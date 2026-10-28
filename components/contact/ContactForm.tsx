"use client";

import {
  CSSProperties,
  FormEvent,
  ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { ArrowRight, Check, CircleAlert } from "lucide-react";
import {
  CONTACT_TOPICS,
  type ContactTopic,
  isValidPhone,
  MAX_PHONE_LENGTH,
  normalizePhone,
  PHONE_INPUT_FILTER,
} from "@/lib/contactValidation";
import { getTheme } from "@/lib/theme";
import styles from "./ContactPanel.module.css";

type FieldName = "name" | "email" | "phone" | "message";

type FormValues = Record<FieldName, string> & { topic: ContactTopic | "" };

type FormErrors = Partial<Record<FieldName, string>>;

type Status = "idle" | "sending" | "success" | "error";

type TurnstileApi = {
  render: (
    element: HTMLElement,
    options: {
      sitekey: string;
      theme?: "light" | "dark" | "auto";
      appearance?: "always" | "execute" | "interaction-only";
      callback?: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    },
  ) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || "";
const TURNSTILE_SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

const NAME_PATTERN = /^[\p{L}]+(?:[\s'-][\p{L}]+)*$/u;
const NAME_INPUT_FILTER = /[^\p{L}\s'-]/gu;
const EMAIL_PATTERN =
  /^(?!.*\.\.)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
const INITIAL_VALUES: FormValues = { name: "", email: "", phone: "", message: "", topic: "" };
const FIELD_ORDER: FieldName[] = ["name", "email", "phone", "message"];
const MAX_MESSAGE_LENGTH = 1000;
const BURST_SPARKS = 8;

let turnstilePromise: Promise<TurnstileApi> | null = null;

function loadTurnstile(): Promise<TurnstileApi> {
  if (typeof window !== "undefined" && window.turnstile) {
    return Promise.resolve(window.turnstile);
  }

  if (!turnstilePromise) {
    turnstilePromise = new Promise<TurnstileApi>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = TURNSTILE_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.turnstile) {
          resolve(window.turnstile);
        } else {
          turnstilePromise = null;
          reject(new Error("Verification failed to initialise."));
        }
      };
      script.onerror = () => {
        script.remove();
        turnstilePromise = null;
        reject(new Error("Verification failed to load."));
      };
      document.head.appendChild(script);
    });
  }

  return turnstilePromise;
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  const normalizedName = values.name.trim().replace(/\s+/g, " ");
  if (!normalizedName) {
    errors.name = "Please enter your name.";
  } else if (!NAME_PATTERN.test(normalizedName)) {
    errors.name = "Use letters, spaces, apostrophes, or hyphens only.";
  }

  const trimmedEmail = values.email.trim();
  if (!trimmedEmail) {
    errors.email = "Please enter your email address.";
  } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
    errors.email = "Please enter a valid email (e.g. name@example.com).";
  }

  // Optional — checked only when filled in.
  if (values.phone.trim() && !isValidPhone(values.phone)) {
    errors.phone = "Enter a valid phone number (7–15 digits).";
  }

  if (!values.message.trim()) {
    errors.message = "Please enter a message.";
  } else if (values.message.length > MAX_MESSAGE_LENGTH) {
    errors.message = `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`;
  }

  return errors;
}

type TurnstileBoxProps = {
  siteKey: string;
  resetKey: number;
  onToken: (token: string) => void;
  onLoadError: () => void;
};

function TurnstileBox({ siteKey, resetKey, onToken, onLoadError }: TurnstileBoxProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadTurnstile()
      .then((api) => {
        if (cancelled || !hostRef.current) {
          return;
        }

        widgetIdRef.current = api.render(hostRef.current, {
          sitekey: siteKey,
          // Matched once at render; re-rendering on a theme switch would discard a solved challenge.
          theme: getTheme(),
          appearance: "interaction-only",
          callback: (token) => onToken(token),
          "expired-callback": () => onToken(""),
          "error-callback": () => onToken(""),
        });
      })
      .catch(() => {
        if (!cancelled) {
          onLoadError();
        }
      });

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = null;
    };
  }, [siteKey, onToken, onLoadError]);

  useEffect(() => {
    if (resetKey > 0 && widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  }, [resetKey]);

  return <div ref={hostRef} className={styles.turnstileHost} />;
}

type FieldShellProps = {
  id: string;
  index: string;
  label: string;
  optional?: boolean;
  error?: string;
  valid: boolean;
  className?: string;
  /** The input itself — it renders before its label so CSS can float the label off its state. */
  children: ReactNode;
  after?: ReactNode;
};

/** One underlined field: floating label, a numbered mark that turns into a tick once valid, and its error. */
function FieldShell({ id, index, label, optional, error, valid, className, children, after }: FieldShellProps) {
  return (
    <div
      className={className ? `${styles.field} ${className}` : styles.field}
      data-invalid={Boolean(error)}
      data-valid={valid}
    >
      <div className={styles.control}>
        {children}
        <label className={styles.label} htmlFor={id}>
          {label}{" "}
          {optional ? (
            <span className={styles.optional}>(optional)</span>
          ) : (
            <span className={styles.required} aria-hidden="true">
              *
            </span>
          )}
        </label>
        <span className={styles.fieldMark} aria-hidden="true">
          {valid ? <Check size={14} strokeWidth={2.5} /> : index}
        </span>
        <span className={styles.fieldLine} aria-hidden="true" />
      </div>
      {after}
      {error && (
        <p className={styles.fieldError} id={`${id}-error`}>
          <CircleAlert size={13} strokeWidth={2.25} aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

export default function ContactForm() {
  const uid = useId();
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [sentName, setSentName] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [turnstileFailed, setTurnstileFailed] = useState(false);
  // Lets the server reject submissions that arrive faster than a person can type them.
  const mountedAtRef = useRef(0);
  const successTitleRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    mountedAtRef.current = Date.now();
  }, []);

  // The form (and the focused button) disappears on success; land keyboard and screen-reader users on the confirmation.
  useEffect(() => {
    if (status === "success") {
      successTitleRef.current?.focus();
    }
  }, [status]);

  const handleTurnstileToken = useCallback((token: string) => setTurnstileToken(token), []);
  const handleTurnstileLoadError = useCallback(() => setTurnstileFailed(true), []);

  const formErrors = validate(values);
  const isFormValid = Object.keys(formErrors).length === 0;
  // Without a Turnstile key the honeypot, timing check, and server rate limit are the defences.
  const isVerified = TURNSTILE_SITE_KEY ? Boolean(turnstileToken) : true;
  const isSending = status === "sending";

  const displayedErrors: FormErrors = {
    name: touched.name || submitAttempted ? formErrors.name : undefined,
    email: touched.email || submitAttempted ? formErrors.email : undefined,
    phone: touched.phone || submitAttempted ? formErrors.phone : undefined,
    message: submitAttempted ? formErrors.message : undefined,
  };
  const verifyError = submitAttempted && !isVerified && !turnstileFailed;
  const isValidField = (field: FieldName) =>
    Boolean(values[field].trim()) && Boolean(touched[field] || submitAttempted) && !formErrors[field];

  const ids = {
    name: `${uid}-name`,
    email: `${uid}-email`,
    phone: `${uid}-phone`,
    message: `${uid}-message`,
    verify: `${uid}-verify`,
  };

  function handleChange(field: FieldName, value: string) {
    let nextValue = value;
    if (field === "name") {
      nextValue = value.replace(NAME_INPUT_FILTER, "");
    } else if (field === "phone") {
      nextValue = value.replace(PHONE_INPUT_FILTER, "").slice(0, MAX_PHONE_LENGTH);
    } else if (field === "message") {
      nextValue = value.slice(0, MAX_MESSAGE_LENGTH);
    }
    setValues((current) => ({ ...current, [field]: nextValue }));
  }

  function handleBlur(field: FieldName) {
    setTouched((current) => (current[field] ? current : { ...current, [field]: true }));
  }

  // Optional single choice: picking the selected chip again clears it.
  function handleTopicClick(topic: ContactTopic) {
    if (values.topic === topic) {
      setValues((current) => ({ ...current, topic: "" }));
    }
  }

  // Turnstile tokens are single-use, so the widget is reset after every attempt.
  function resetVerification() {
    setTurnstileToken("");
    setTurnstileResetKey((key) => key + 1);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSending) {
      return;
    }

    setSubmitAttempted(true);

    if (!isFormValid) {
      const firstInvalid = FIELD_ORDER.find((field) => formErrors[field]);
      if (firstInvalid) {
        document.getElementById(ids[firstInvalid])?.focus();
      }
      return;
    }

    if (!isVerified) {
      return;
    }

    setStatus("sending");
    setErrorMessage("");

    try {
      const payload = {
        name: values.name.trim().replace(/\s+/g, " "),
        email: values.email.trim(),
        phone: normalizePhone(values.phone),
        message: values.message.trim(),
        topic: values.topic,
        website: honeypot,
        turnstileToken,
        elapsedMs: Date.now() - mountedAtRef.current,
      };

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => null)) as
        | { success?: boolean; error?: string }
        | null;

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || "Failed to send message.");
      }

      setSentName(payload.name.split(" ")[0] ?? "");
      setStatus("success");
      setValues(INITIAL_VALUES);
      setTouched({});
      setSubmitAttempted(false);
      setHoneypot("");
    } catch (error) {
      // Values stay as typed, so a failed send never costs the visitor their message.
      setStatus("error");
      setErrorMessage(
        error instanceof Error && error.message
          ? error.message
          : "Something went wrong while sending your message. Please try again.",
      );
    } finally {
      resetVerification();
    }
  }

  function sendAnother() {
    setStatus("idle");
    setErrorMessage("");
  }

  if (status === "success") {
    return (
      <div className={styles.success} role="status">
        <span className={styles.successBadge} aria-hidden="true">
          <svg className={styles.successCheck} viewBox="0 0 52 52">
            <circle cx="26" cy="26" r="24" />
            <path d="M15 27.5l7 7 15-16" />
          </svg>
          {Array.from({ length: BURST_SPARKS }, (_, index) => (
            <span key={index} className={styles.burst} style={{ "--i": index } as CSSProperties} />
          ))}
        </span>
        <p className={styles.successTitle} ref={successTitleRef} tabIndex={-1}>
          Message sent.
        </p>
        <p className={styles.successText}>
          Thanks{sentName ? `, ${sentName}` : ""}! Your note is in my inbox &mdash; I&apos;ll get back to you within
          24 hours.
        </p>
        <button className="ui-btn ui-btn--secondary" type="button" onClick={sendAnother}>
          Send another
        </button>
      </div>
    );
  }

  const messageLength = values.message.length;

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate aria-label="Send a message">
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor={`${uid}-website`}>Leave this field blank</label>
        <input
          id={`${uid}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
        />
      </div>

      <fieldset className={styles.topics} disabled={isSending}>
        <legend className={styles.topicsLegend}>
          What&apos;s on your mind? <span className={styles.optional}>(optional)</span>
        </legend>
        <div className={styles.chips}>
          {CONTACT_TOPICS.map((topic) => (
            <label key={topic} className={styles.chip}>
              <input
                className={styles.chipInput}
                type="radio"
                name="topic"
                value={topic}
                checked={values.topic === topic}
                onChange={() => setValues((current) => ({ ...current, topic }))}
                onClick={() => handleTopicClick(topic)}
              />
              <span className={styles.chipText}>{topic}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className={styles.fieldPair}>
        <FieldShell id={ids.name} index="01" label="Name" error={displayedErrors.name} valid={isValidField("name")}>
          <input
            id={ids.name}
            className={styles.input}
            type="text"
            name="name"
            autoComplete="name"
            placeholder=" "
            value={values.name}
            onChange={(event) => handleChange("name", event.target.value)}
            onBlur={() => handleBlur("name")}
            disabled={isSending}
            aria-required="true"
            aria-invalid={Boolean(displayedErrors.name)}
            aria-describedby={displayedErrors.name ? `${ids.name}-error` : undefined}
          />
        </FieldShell>

        <FieldShell id={ids.email} index="02" label="Email" error={displayedErrors.email} valid={isValidField("email")}>
          <input
            id={ids.email}
            className={styles.input}
            type="email"
            name="email"
            autoComplete="email"
            placeholder=" "
            value={values.email}
            onChange={(event) => handleChange("email", event.target.value)}
            onBlur={() => handleBlur("email")}
            disabled={isSending}
            aria-required="true"
            aria-invalid={Boolean(displayedErrors.email)}
            aria-describedby={displayedErrors.email ? `${ids.email}-error` : undefined}
          />
        </FieldShell>
      </div>

      <FieldShell
        id={ids.phone}
        index="03"
        label="Phone"
        optional
        error={displayedErrors.phone}
        valid={isValidField("phone")}
      >
        <input
          id={ids.phone}
          className={styles.input}
          type="tel"
          name="phone"
          inputMode="tel"
          autoComplete="tel"
          placeholder=" "
          value={values.phone}
          onChange={(event) => handleChange("phone", event.target.value)}
          onBlur={() => handleBlur("phone")}
          disabled={isSending}
          aria-invalid={Boolean(displayedErrors.phone)}
          aria-describedby={displayedErrors.phone ? `${ids.phone}-error` : undefined}
        />
      </FieldShell>

      <FieldShell
        id={ids.message}
        index="04"
        label="Message"
        error={displayedErrors.message}
        valid={isValidField("message")}
        after={
          <span
            className={styles.charCount}
            id={`${ids.message}-count`}
            data-near-limit={messageLength > MAX_MESSAGE_LENGTH * 0.9}
          >
            {messageLength}/{MAX_MESSAGE_LENGTH}
          </span>
        }
      >
        <textarea
          id={ids.message}
          className={`${styles.input} ${styles.textarea}`}
          name="message"
          placeholder=" "
          maxLength={MAX_MESSAGE_LENGTH}
          value={values.message}
          onChange={(event) => handleChange("message", event.target.value)}
          onBlur={() => handleBlur("message")}
          disabled={isSending}
          aria-required="true"
          aria-invalid={Boolean(displayedErrors.message)}
          aria-describedby={
            displayedErrors.message ? `${ids.message}-error ${ids.message}-count` : `${ids.message}-count`
          }
        />
      </FieldShell>

      <div className={styles.formFooter}>
        {(TURNSTILE_SITE_KEY || turnstileFailed || verifyError) && (
          <div className={styles.verify}>
            {TURNSTILE_SITE_KEY && (
              <TurnstileBox
                siteKey={TURNSTILE_SITE_KEY}
                resetKey={turnstileResetKey}
                onToken={handleTurnstileToken}
                onLoadError={handleTurnstileLoadError}
              />
            )}

            {turnstileFailed && (
              <p className={styles.fieldError} role="alert">
                Verification couldn&apos;t load. Please refresh the page and try again.
              </p>
            )}
            {verifyError && (
              <p className={styles.fieldError} id={`${ids.verify}-error`} role="alert">
                Still verifying your browser. Please try again in a moment.
              </p>
            )}
          </div>
        )}

        {status === "error" && (
          <p className={styles.formError} role="alert">
            <CircleAlert size={16} strokeWidth={2.25} aria-hidden="true" />
            <span>
              {errorMessage} <span className={styles.formErrorHint}>Your message is still here.</span>
            </span>
          </p>
        )}

        <div className={styles.submitRow}>
          <button
            className={`ui-btn ui-btn--primary ui-btn--lg ${styles.submit}`}
            type="submit"
            disabled={isSending}
            aria-busy={isSending}
            data-magnetic="0.16"
          >
            <span>{isSending ? "Sending…" : "Send Message"}</span>
            <span className={styles.submitIcon} aria-hidden="true">
              {isSending ? (
                <span className={styles.spinner} />
              ) : (
                <>
                  <ArrowRight className={styles.arrowOut} size={17} strokeWidth={2.25} />
                  <ArrowRight className={styles.arrowIn} size={17} strokeWidth={2.25} />
                </>
              )}
            </span>
          </button>
          <p className={styles.privacy}>Your details are only used to reply to you.</p>
        </div>

        <p className="sr-only" aria-live="polite">
          {isSending ? "Sending your message…" : ""}
        </p>
      </div>
    </form>
  );
}
