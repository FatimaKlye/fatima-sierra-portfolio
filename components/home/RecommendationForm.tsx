"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { Check, LoaderCircle, X } from "lucide-react";
import {
  RECOMMENDATION_LIMITS,
  validateRecommendation,
  type RecommendationErrors,
  type RecommendationField,
  type RecommendationFields,
} from "@/lib/recommendationValidation";
import styles from "./RecommendationForm.module.css";

type Status = "idle" | "sending" | "success" | "error";

const EMPTY: RecommendationFields = {
  name: "",
  email: "",
  role: "",
  relationship: "",
  message: "",
  linkedin: "",
  consent: false,
};
const FIELD_ORDER: RecommendationField[] = ["name", "email", "role", "relationship", "message", "linkedin", "consent"];

/**
 * "Share a few words": a compact dialog that emails a recommendation to me for
 * review. Nothing submitted here is published; entries reach the homepage only
 * after I confirm the wording with the writer and add it to recommendationsData.
 */
export default function RecommendationForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const uid = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const openedAt = useRef(0);
  const onCloseRef = useRef(onClose);

  const [values, setValues] = useState<RecommendationFields>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<RecommendationField, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [serverErrors, setServerErrors] = useState<RecommendationErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Open: focus, scroll lock, focus trap, Escape and the entrance motion.
  useEffect(() => {
    if (!open) return;

    openedAt.current = Date.now();
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (event.key === "Tab" && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            "a[href], button:not(:disabled), input:not(:disabled):not([tabindex='-1']), textarea:not(:disabled), [tabindex]:not([tabindex='-1'])"
          )
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(() => firstFieldRef.current?.focus());

    // Opacity only (not autoAlpha): a visibility-hidden field can't take focus.
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const dialog = dialogRef.current;
      if (!dialog) return;
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power2.out", clearProps: "opacity" });
      gsap.fromTo(
        dialog,
        { y: 28, scale: 0.97, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, duration: 0.6, ease: "expo.out", clearProps: "transform,opacity" }
      );
      gsap.fromTo(
        dialog.querySelectorAll("[data-form-rise]"),
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power3.out", stagger: 0.04, delay: 0.12, clearProps: "transform,opacity" }
      );
    });

    return () => {
      mm.revert();
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      opener?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  if (!open) return null;

  const clientErrors = validateRecommendation(values).errors ?? {};
  const errorFor = (field: RecommendationField) =>
    serverErrors[field] ?? (touched[field] || submitAttempted ? clientErrors[field] : undefined);

  const update = (field: RecommendationField) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = event.target;
    const value = target instanceof HTMLInputElement && target.type === "checkbox" ? target.checked : target.value;
    setValues((current) => ({ ...current, [field]: value }));
    if (serverErrors[field]) {
      setServerErrors((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
    }
    if (status === "error") setStatus("idle");
  };

  const blur = (field: RecommendationField) => () => setTouched((current) => ({ ...current, [field]: true }));

  const close = () => {
    // A sent form starts fresh next time; an unsent draft is kept.
    if (status === "success") {
      setValues(EMPTY);
      setTouched({});
      setSubmitAttempted(false);
      setStatus("idle");
    }
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;
    setSubmitAttempted(true);

    const result = validateRecommendation(values);
    if (result.errors) {
      const first = FIELD_ORDER.find((field) => result.errors[field]);
      if (first) document.getElementById(`${uid}-${first}`)?.focus();
      return;
    }

    setStatus("sending");
    setStatusMessage("");
    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...result.data, website: honeypot, elapsedMs: Date.now() - openedAt.current }),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string; fields?: RecommendationErrors };
      if (!response.ok) {
        setServerErrors(payload.fields ?? {});
        setStatus("error");
        setStatusMessage(payload.error ?? "Something went wrong. Please try again in a moment.");
        return;
      }
      setStatus("success");
    } catch {
      setStatus("error");
      setStatusMessage("Couldn't reach the server. Please check your connection and try again.");
    }
  };

  const id = (field: RecommendationField) => `${uid}-${field}`;
  const describedBy = (field: RecommendationField, hint?: boolean) =>
    [hint ? `${id(field)}-hint` : "", errorFor(field) ? `${id(field)}-error` : ""].filter(Boolean).join(" ") || undefined;
  const error = (field: RecommendationField) => {
    const message = errorFor(field);
    return message ? (
      <p id={`${id(field)}-error`} className={styles.error}>
        {message}
      </p>
    ) : null;
  };

  const isSending = status === "sending";
  const firstName = values.name.trim().split(" ")[0];

  return createPortal(
    <div ref={overlayRef} className={styles.overlay} onClick={close}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${uid}-title`}
        aria-describedby={`${uid}-intro`}
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className={styles.close} onClick={close} aria-label="Close">
          <X size={18} aria-hidden="true" />
        </button>

        {status === "success" ? (
          <div className={styles.success} role="status">
            <span className={styles.successIcon} aria-hidden="true">
              <Check size={26} strokeWidth={2.5} />
            </span>
            <h2 ref={successRef} tabIndex={-1} id={`${uid}-title`} className={styles.title}>
              Thank you{firstName ? `, ${firstName}` : ""}.
            </h2>
            <p id={`${uid}-intro`} className={styles.lead}>
              Your recommendation is with me for review. I&apos;ll reach out at <strong>{values.email.trim()}</strong> to
              confirm the wording before anything appears on the site.
            </p>
            <button type="button" className="ui-btn ui-btn--primary" onClick={close}>
              Close
            </button>
          </div>
        ) : (
          <>
            <header className={styles.header} data-form-rise>
              <p className={styles.eyebrow}>Recommendations</p>
              <h2 id={`${uid}-title`} className={styles.title}>
                Worked with me? <em>Share a few words.</em>
              </h2>
              <p id={`${uid}-intro`} className={styles.lead}>
                Nothing is published automatically. I&apos;ll confirm the final wording with you before it appears on
                the site.
              </p>
            </header>

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

              <div className={styles.pair}>
                <div className={styles.field} data-invalid={Boolean(errorFor("name"))} data-form-rise>
                  <label className={styles.label} htmlFor={id("name")}>
                    Full name
                  </label>
                  <input
                    ref={firstFieldRef}
                    id={id("name")}
                    className={styles.input}
                    type="text"
                    autoComplete="name"
                    maxLength={RECOMMENDATION_LIMITS.name}
                    value={values.name}
                    onChange={update("name")}
                    onBlur={blur("name")}
                    aria-invalid={Boolean(errorFor("name"))}
                    aria-describedby={describedBy("name")}
                    required
                    disabled={isSending}
                  />
                  {error("name")}
                </div>
                <div className={styles.field} data-invalid={Boolean(errorFor("email"))} data-form-rise>
                  <label className={styles.label} htmlFor={id("email")}>
                    Email
                  </label>
                  <input
                    id={id("email")}
                    className={styles.input}
                    type="email"
                    autoComplete="email"
                    maxLength={RECOMMENDATION_LIMITS.email}
                    value={values.email}
                    onChange={update("email")}
                    onBlur={blur("email")}
                    aria-invalid={Boolean(errorFor("email"))}
                    aria-describedby={describedBy("email", true)}
                    required
                    disabled={isSending}
                  />
                  <p id={`${id("email")}-hint`} className={styles.hint}>
                    Only used to confirm with you. Never shown.
                  </p>
                  {error("email")}
                </div>
              </div>

              <div className={styles.pair}>
                <div className={styles.field} data-invalid={Boolean(errorFor("role"))} data-form-rise>
                  <label className={styles.label} htmlFor={id("role")}>
                    Your role
                  </label>
                  <input
                    id={id("role")}
                    className={styles.input}
                    type="text"
                    autoComplete="organization-title"
                    placeholder="e.g. Capstone Adviser"
                    maxLength={RECOMMENDATION_LIMITS.role}
                    value={values.role}
                    onChange={update("role")}
                    onBlur={blur("role")}
                    aria-invalid={Boolean(errorFor("role"))}
                    aria-describedby={describedBy("role")}
                    required
                    disabled={isSending}
                  />
                  {error("role")}
                </div>
                <div className={styles.field} data-invalid={Boolean(errorFor("relationship"))} data-form-rise>
                  <label className={styles.label} htmlFor={id("relationship")}>
                    How we worked together
                  </label>
                  <input
                    id={id("relationship")}
                    className={styles.input}
                    type="text"
                    placeholder="e.g. Teammate on IGNIS SAFE"
                    maxLength={RECOMMENDATION_LIMITS.relationship}
                    value={values.relationship}
                    onChange={update("relationship")}
                    onBlur={blur("relationship")}
                    aria-invalid={Boolean(errorFor("relationship"))}
                    aria-describedby={describedBy("relationship")}
                    required
                    disabled={isSending}
                  />
                  {error("relationship")}
                </div>
              </div>

              <div className={styles.field} data-invalid={Boolean(errorFor("message"))} data-form-rise>
                <label className={styles.label} htmlFor={id("message")}>
                  Your recommendation
                </label>
                <textarea
                  id={id("message")}
                  className={`${styles.input} ${styles.textarea}`}
                  rows={5}
                  maxLength={RECOMMENDATION_LIMITS.messageMax}
                  value={values.message}
                  onChange={update("message")}
                  onBlur={blur("message")}
                  aria-invalid={Boolean(errorFor("message"))}
                  aria-describedby={describedBy("message", true)}
                  required
                  disabled={isSending}
                />
                <p id={`${id("message")}-hint`} className={styles.count}>
                  {values.message.trim().length} / {RECOMMENDATION_LIMITS.messageMax}
                  <span className={styles.srOnly}> characters</span>
                </p>
                {error("message")}
              </div>

              <div className={styles.field} data-invalid={Boolean(errorFor("linkedin"))} data-form-rise>
                <label className={styles.label} htmlFor={id("linkedin")}>
                  LinkedIn <span className={styles.optional}>(optional)</span>
                </label>
                <input
                  id={id("linkedin")}
                  className={styles.input}
                  type="url"
                  inputMode="url"
                  autoComplete="url"
                  placeholder="linkedin.com/in/your-name"
                  maxLength={RECOMMENDATION_LIMITS.linkedin}
                  value={values.linkedin}
                  onChange={update("linkedin")}
                  onBlur={blur("linkedin")}
                  aria-invalid={Boolean(errorFor("linkedin"))}
                  aria-describedby={describedBy("linkedin")}
                  disabled={isSending}
                />
                {error("linkedin")}
              </div>

              <div className={styles.consent} data-invalid={Boolean(errorFor("consent"))} data-form-rise>
                <input
                  id={id("consent")}
                  className={styles.checkbox}
                  type="checkbox"
                  checked={values.consent}
                  onChange={update("consent")}
                  onBlur={blur("consent")}
                  aria-invalid={Boolean(errorFor("consent"))}
                  aria-describedby={describedBy("consent")}
                  required
                  disabled={isSending}
                />
                <label htmlFor={id("consent")}>
                  Fatima may publish my name, role and these words on her portfolio once we&apos;ve agreed on the
                  final wording.
                </label>
                {error("consent")}
              </div>

              <div className={styles.footer} data-form-rise>
                {status === "error" && (
                  <p className={styles.formError} role="alert">
                    {statusMessage}
                  </p>
                )}
                <button type="submit" className="ui-btn ui-btn--primary" disabled={isSending}>
                  {isSending ? (
                    <>
                      <LoaderCircle size={16} className={styles.spinner} aria-hidden="true" />
                      Sending…
                    </>
                  ) : (
                    "Send for review"
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
