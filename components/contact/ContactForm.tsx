"use client";

import { FormEvent, useCallback, useEffect, useId, useRef, useState } from "react";
import { Check } from "lucide-react";
import {
  isValidPhone,
  MAX_PHONE_LENGTH,
  normalizePhone,
  PHONE_INPUT_FILTER,
} from "@/lib/contactValidation";
import styles from "./ContactPanel.module.css";

type FormValues = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

type Status = "idle" | "sending" | "success" | "error";

type TurnstileApi = {
  render: (
    element: HTMLElement,
    options: {
      sitekey: string;
      theme?: "light" | "dark" | "auto";
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
const INITIAL_VALUES: FormValues = { name: "", email: "", phone: "", message: "" };
const MAX_MESSAGE_LENGTH = 1000;

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

  if (!values.phone.trim()) {
    errors.phone = "Please enter your phone number.";
  } else if (!isValidPhone(values.phone)) {
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
          theme: "light",
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

export default function ContactForm() {
  const uid = useId();
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [turnstileFailed, setTurnstileFailed] = useState(false);
  const [humanChecked, setHumanChecked] = useState(false);

  const handleTurnstileToken = useCallback((token: string) => setTurnstileToken(token), []);
  const handleTurnstileLoadError = useCallback(() => setTurnstileFailed(true), []);

  const formErrors = validate(values);
  const isFormValid = Object.keys(formErrors).length === 0;
  const isVerified = TURNSTILE_SITE_KEY ? Boolean(turnstileToken) : humanChecked;
  const isSending = status === "sending";

  const displayedErrors: FormErrors = {
    name: touched.name || submitAttempted ? formErrors.name : undefined,
    email: touched.email || submitAttempted ? formErrors.email : undefined,
    phone: touched.phone || submitAttempted ? formErrors.phone : undefined,
    message: submitAttempted ? formErrors.message : undefined,
  };
  const verifyError = submitAttempted && !isVerified && !turnstileFailed;

  function handleChange(field: keyof FormValues, value: string) {
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

  function handleBlur(field: keyof FormValues) {
    setTouched((current) => (current[field] ? current : { ...current, [field]: true }));
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

    if (!isFormValid || !isVerified) {
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
        website: honeypot,
        turnstileToken,
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

      setStatus("success");
      setValues(INITIAL_VALUES);
      setTouched({});
      setSubmitAttempted(false);
      setHoneypot("");
      setHumanChecked(false);
    } catch (error) {
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
        <span className={styles.successIcon} aria-hidden="true">
          <Check size={26} strokeWidth={2.5} />
        </span>
        <p className={styles.successTitle}>Message sent.</p>
        <p className={styles.successText}>
          Thanks for reaching out &mdash; I&apos;ll get back to you within 24 hours.
        </p>
        <button className={styles.submit} type="button" onClick={sendAnother}>
          Send another
        </button>
      </div>
    );
  }

  const ids = {
    name: `${uid}-name`,
    email: `${uid}-email`,
    phone: `${uid}-phone`,
    message: `${uid}-message`,
    verify: `${uid}-verify`,
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
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

      <div className={styles.fieldPair}>
        <div className={styles.field} data-invalid={Boolean(displayedErrors.name)}>
          <label className={styles.label} htmlFor={ids.name}>
            Name <span aria-hidden="true">*</span>
          </label>
          <input
            id={ids.name}
            className={styles.input}
            type="text"
            name="name"
            autoComplete="name"
            value={values.name}
            onChange={(event) => handleChange("name", event.target.value)}
            onBlur={() => handleBlur("name")}
            disabled={isSending}
            aria-required="true"
            aria-invalid={Boolean(displayedErrors.name)}
            aria-describedby={displayedErrors.name ? `${ids.name}-error` : undefined}
          />
          {displayedErrors.name && (
            <p className={styles.fieldError} id={`${ids.name}-error`}>
              {displayedErrors.name}
            </p>
          )}
        </div>

        <div className={styles.field} data-invalid={Boolean(displayedErrors.email)}>
          <label className={styles.label} htmlFor={ids.email}>
            Email <span aria-hidden="true">*</span>
          </label>
          <input
            id={ids.email}
            className={styles.input}
            type="email"
            name="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) => handleChange("email", event.target.value)}
            onBlur={() => handleBlur("email")}
            disabled={isSending}
            aria-required="true"
            aria-invalid={Boolean(displayedErrors.email)}
            aria-describedby={displayedErrors.email ? `${ids.email}-error` : undefined}
          />
          {displayedErrors.email && (
            <p className={styles.fieldError} id={`${ids.email}-error`}>
              {displayedErrors.email}
            </p>
          )}
        </div>
      </div>

      <div className={styles.field} data-invalid={Boolean(displayedErrors.phone)}>
        <label className={styles.label} htmlFor={ids.phone}>
          Phone <span aria-hidden="true">*</span>
        </label>
        <input
          id={ids.phone}
          className={styles.input}
          type="tel"
          name="phone"
          inputMode="tel"
          autoComplete="tel"
          value={values.phone}
          onChange={(event) => handleChange("phone", event.target.value)}
          onBlur={() => handleBlur("phone")}
          disabled={isSending}
          aria-required="true"
          aria-invalid={Boolean(displayedErrors.phone)}
          aria-describedby={displayedErrors.phone ? `${ids.phone}-error` : undefined}
        />
        {displayedErrors.phone && (
          <p className={styles.fieldError} id={`${ids.phone}-error`}>
            {displayedErrors.phone}
          </p>
        )}
      </div>

      <div
        className={`${styles.field} ${styles.fieldMessage}`}
        data-invalid={Boolean(displayedErrors.message)}
      >
        <label className={styles.label} htmlFor={ids.message}>
          Message <span aria-hidden="true">*</span>
        </label>
        <textarea
          id={ids.message}
          className={`${styles.input} ${styles.textarea}`}
          name="message"
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
        <span className={styles.charCount} id={`${ids.message}-count`}>
          {values.message.length}/{MAX_MESSAGE_LENGTH}
        </span>
        {displayedErrors.message && (
          <p className={styles.fieldError} id={`${ids.message}-error`}>
            {displayedErrors.message}
          </p>
        )}
      </div>

      <div className={styles.formFooter}>
        <div className={styles.verify}>
          {TURNSTILE_SITE_KEY ? (
            <TurnstileBox
              siteKey={TURNSTILE_SITE_KEY}
              resetKey={turnstileResetKey}
              onToken={handleTurnstileToken}
              onLoadError={handleTurnstileLoadError}
            />
          ) : (
            <label className={styles.humanCheck} htmlFor={ids.verify}>
              <input
                id={ids.verify}
                className={styles.humanInput}
                type="checkbox"
                checked={humanChecked}
                onChange={(event) => setHumanChecked(event.target.checked)}
                disabled={isSending}
                aria-describedby={verifyError ? `${ids.verify}-error` : undefined}
              />
              <span className={styles.humanBox} aria-hidden="true">
                <Check size={16} strokeWidth={3} />
              </span>
              <span className={styles.humanText}>
                {humanChecked ? "Verified" : "I’m not a robot"}
              </span>
            </label>
          )}

          {turnstileFailed && (
            <p className={styles.fieldError} role="alert">
              Verification couldn&apos;t load. Please refresh the page and try again.
            </p>
          )}
          {verifyError && (
            <p className={styles.fieldError} id={`${ids.verify}-error`} role="alert">
              Please complete the verification.
            </p>
          )}
        </div>

        {status === "error" && (
          <p className={styles.formError} role="alert">
            {errorMessage}
          </p>
        )}

        <button className={styles.submit} type="submit" disabled={isSending}>
          {isSending ? "Sending…" : "Submit"}
        </button>
      </div>
    </form>
  );
}
