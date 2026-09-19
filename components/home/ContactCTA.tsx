"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import styles from "./ContactCTA.module.css";

type FormValues = {
  name: string;
  email: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

type Status = "idle" | "sending" | "success" | "error";

const NAME_PATTERN = /^[\p{L}]+(?:[\s'-][\p{L}]+)*$/u;
const NAME_INPUT_FILTER = /[^\p{L}\s'-]/gu;
const EMAIL_PATTERN =
  /^(?!.*\.\.)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
const INITIAL_VALUES: FormValues = { name: "", email: "", message: "" };
const MAX_MESSAGE_LENGTH = 1000;

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  const normalizedName = values.name.trim().replace(/\s+/g, " ");
  if (!normalizedName) {
    errors.name = "Please enter your name.";
  } else if (!NAME_PATTERN.test(normalizedName)) {
    errors.name = "Please use letters, spaces, apostrophes, or hyphens only.";
  }

  const trimmedEmail = values.email.trim();
  if (!trimmedEmail) {
    errors.email = "Please enter your email address.";
  } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!values.message.trim()) {
    errors.message = "Please enter a short message.";
  } else if (values.message.length > MAX_MESSAGE_LENGTH) {
    errors.message = `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`;
  }

  return errors;
}

export default function ContactCTA() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const reduceMotion = Boolean(useReducedMotion());

  const formErrors = validate(values);
  const isFormValid = Object.keys(formErrors).length === 0;
  const displayedErrors: FormErrors = {
    name: touched.name || submitAttempted ? formErrors.name : undefined,
    email: touched.email || submitAttempted ? formErrors.email : undefined,
    message: submitAttempted ? formErrors.message : undefined,
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(() => firstFieldRef.current?.focus());

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    if (status === "sending") return;

    setIsOpen(false);
    setValues(INITIAL_VALUES);
    setTouched({});
    setSubmitAttempted(false);
    setStatus("idle");
    setErrorMessage("");
    setHoneypot("");
  }

  function handleChange(field: keyof FormValues, value: string) {
    let nextValue = value;
    if (field === "name") {
      nextValue = value.replace(NAME_INPUT_FILTER, "");
    } else if (field === "message") {
      nextValue = value.slice(0, MAX_MESSAGE_LENGTH);
    }
    setValues((current) => ({ ...current, [field]: nextValue }));
    setTouched((current) => (current[field] ? current : { ...current, [field]: true }));
  }

  function handleBlur(field: keyof FormValues) {
    setTouched((current) => (current[field] ? current : { ...current, [field]: true }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (status === "sending") return;

    setSubmitAttempted(true);
    if (!isFormValid) return;

    setStatus("sending");
    setErrorMessage("");

    try {
      const payload = {
        name: values.name.trim().replace(/\s+/g, " "),
        email: values.email.trim(),
        message: values.message.trim(),
        website: honeypot,
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
      setHoneypot("");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error && error.message
          ? error.message
          : "Something went wrong while sending your message. Please try again.",
      );
    }
  }

  const overlayTransition = reduceMotion ? { duration: 0.01 } : { duration: 0.22, ease: "easeOut" as const };
  const dialogTransition = reduceMotion
    ? { duration: 0.01 }
    : { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <>
      <button type="button" className={styles.trigger} onClick={openModal}>
        Send Me a Message
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                className={styles.overlay}
                role="presentation"
                onClick={closeModal}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={overlayTransition}
              >
                <motion.div
                  className={styles.dialog}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="contact-cta-title"
                  onClick={(event) => event.stopPropagation()}
                  initial={{ opacity: 0, y: 18, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.97 }}
                  transition={dialogTransition}
                >
                  <div className={styles.header}>
                    <div>
                      <p className={styles.eyebrow}>Let&apos;s Connect</p>
                      <h3 id="contact-cta-title" className={styles.title}>
                        Send Me a Message
                      </h3>
                    </div>
                    <button
                      type="button"
                      className={styles.close}
                      aria-label="Close contact form"
                      onClick={closeModal}
                    >
                      ×
                    </button>
                  </div>

                  {status === "success" ? (
                    <div className={styles.successState}>
                      <span className={styles.successIcon} aria-hidden="true">
                        ✓
                      </span>
                      <p className={styles.successText}>Message sent</p>
                      <p className={styles.successSubtext}>
                        Thanks for reaching out &mdash; I&apos;ll reply within 24 hours.
                      </p>
                      <button type="button" className={styles.doneButton} onClick={closeModal}>
                        Close
                      </button>
                    </div>
                  ) : (
                    <form className={styles.form} onSubmit={handleSubmit} noValidate>
                      <div className={styles.honeypotField} aria-hidden="true">
                        <label htmlFor="cta-website">Leave this field blank</label>
                        <input
                          id="cta-website"
                          name="website"
                          type="text"
                          tabIndex={-1}
                          autoComplete="off"
                          value={honeypot}
                          onChange={(event) => setHoneypot(event.target.value)}
                        />
                      </div>

                      <div className={styles.field}>
                        <label className={styles.label} htmlFor="cta-name">
                          Name
                        </label>
                        <input
                          ref={firstFieldRef}
                          id="cta-name"
                          className={`${styles.input} ${displayedErrors.name ? styles.inputError : ""}`}
                          type="text"
                          value={values.name}
                          onChange={(event) => handleChange("name", event.target.value)}
                          onBlur={() => handleBlur("name")}
                          disabled={status === "sending"}
                          aria-invalid={Boolean(displayedErrors.name)}
                          aria-describedby={displayedErrors.name ? "cta-name-error" : undefined}
                        />
                        {displayedErrors.name && (
                          <p className={styles.fieldError} id="cta-name-error">
                            {displayedErrors.name}
                          </p>
                        )}
                      </div>

                      <div className={styles.field}>
                        <label className={styles.label} htmlFor="cta-email">
                          Email
                        </label>
                        <input
                          id="cta-email"
                          className={`${styles.input} ${displayedErrors.email ? styles.inputError : ""}`}
                          type="email"
                          value={values.email}
                          onChange={(event) => handleChange("email", event.target.value)}
                          onBlur={() => handleBlur("email")}
                          disabled={status === "sending"}
                          aria-invalid={Boolean(displayedErrors.email)}
                          aria-describedby={displayedErrors.email ? "cta-email-error" : undefined}
                        />
                        {displayedErrors.email && (
                          <p className={styles.fieldError} id="cta-email-error">
                            {displayedErrors.email}
                          </p>
                        )}
                      </div>

                      <div className={styles.field}>
                        <label className={styles.label} htmlFor="cta-message">
                          Message
                        </label>
                        <div className={styles.textareaWrapper}>
                          <textarea
                            id="cta-message"
                            className={`${styles.textarea} ${displayedErrors.message ? styles.inputError : ""}`}
                            rows={4}
                            maxLength={MAX_MESSAGE_LENGTH}
                            value={values.message}
                            onChange={(event) => handleChange("message", event.target.value)}
                            disabled={status === "sending"}
                            aria-invalid={Boolean(displayedErrors.message)}
                            aria-describedby={
                              displayedErrors.message
                                ? "cta-message-error cta-message-count"
                                : "cta-message-count"
                            }
                          />
                          <span className={styles.charCount} id="cta-message-count" aria-live="polite">
                            {values.message.length}/{MAX_MESSAGE_LENGTH}
                          </span>
                        </div>
                        {displayedErrors.message && (
                          <p className={styles.fieldError} id="cta-message-error">
                            {displayedErrors.message}
                          </p>
                        )}
                      </div>

                      {status === "error" && (
                        <p className={styles.formError} role="alert">
                          {errorMessage}
                        </p>
                      )}

                      <button
                        className={styles.sendButton}
                        type="submit"
                        disabled={status === "sending" || !isFormValid}
                      >
                        {status === "sending" ? "Sending…" : "Send Message"}
                      </button>
                    </form>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
