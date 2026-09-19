"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import sectionStyles from "./ContactSection.module.css";
import styles from "./ContactModal.module.css";

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
    errors.name =
      "Please enter a valid name using letters, spaces, apostrophes, or hyphens only.";
  }

  const trimmedEmail = values.email.trim();
  if (!trimmedEmail) {
    errors.email = "Please enter your email address.";
  } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
    errors.email = "Please enter a valid email address (e.g. name@example.com).";
  }

  if (!values.message.trim()) {
    errors.message = "Please enter a message or question.";
  } else if (values.message.length > MAX_MESSAGE_LENGTH) {
    errors.message = `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`;
  }

  return errors;
}

export default function ContactModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const formErrors = validate(values);
  const isFormValid = Object.keys(formErrors).length === 0;
  const displayedErrors: FormErrors = {
    name: touched.name || submitAttempted ? formErrors.name : undefined,
    email: touched.email || submitAttempted ? formErrors.email : undefined,
    message: submitAttempted ? formErrors.message : undefined,
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    firstFieldRef.current?.focus({ preventScroll: true });
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    if (status === "sending") {
      return;
    }

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

  function handleOverlayKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      closeModal();
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (status === "sending") {
      return;
    }

    setSubmitAttempted(true);

    if (!isFormValid) {
      return;
    }

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

  return (
    <>
      <button className={sectionStyles.primaryButton} type="button" onClick={openModal}>
        Send a Message
        <span aria-hidden="true">↗</span>
      </button>

      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className={styles.overlay}
            role="presentation"
            onClick={closeModal}
            onKeyDown={handleOverlayKeyDown}
          >
            <div
              className={styles.dialog}
              role="dialog"
              aria-modal="true"
              aria-labelledby="contact-modal-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className={styles.dialogHeader}>
                <h3 id="contact-modal-title" className={styles.dialogTitle}>
                  Send a Message
                </h3>
                <button
                  className={styles.closeButton}
                  type="button"
                  onClick={closeModal}
                  aria-label="Close"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>

              {status === "success" ? (
                <div className={styles.successState}>
                  <span className={styles.successIcon} aria-hidden="true">
                    ✓
                  </span>
                  <p className={styles.successText}>Message sent successfully</p>
                  <p className={styles.successSubtext}>
                    Thanks for reaching out &mdash; I&apos;ll get back to you within 24 hours.
                  </p>
                  <button className={styles.doneButton} type="button" onClick={closeModal}>
                    Done
                  </button>
                </div>
              ) : (
                <form className={styles.form} onSubmit={handleSubmit} noValidate>
                  <div className={styles.honeypotField} aria-hidden="true">
                    <label htmlFor="contact-website">Leave this field blank</label>
                    <input
                      id="contact-website"
                      name="website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(event) => setHoneypot(event.target.value)}
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="contact-name">
                      Name
                    </label>
                    <input
                      ref={firstFieldRef}
                      id="contact-name"
                      className={`${styles.input} ${displayedErrors.name ? styles.inputError : ""}`}
                      type="text"
                      value={values.name}
                      onChange={(event) => handleChange("name", event.target.value)}
                      onBlur={() => handleBlur("name")}
                      disabled={status === "sending"}
                      aria-invalid={Boolean(displayedErrors.name)}
                      aria-describedby={displayedErrors.name ? "contact-name-error" : undefined}
                    />
                    {displayedErrors.name && (
                      <p className={styles.fieldError} id="contact-name-error">
                        {displayedErrors.name}
                      </p>
                    )}
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="contact-email">
                      Email
                    </label>
                    <input
                      id="contact-email"
                      className={`${styles.input} ${displayedErrors.email ? styles.inputError : ""}`}
                      type="email"
                      value={values.email}
                      onChange={(event) => handleChange("email", event.target.value)}
                      onBlur={() => handleBlur("email")}
                      disabled={status === "sending"}
                      aria-invalid={Boolean(displayedErrors.email)}
                      aria-describedby={displayedErrors.email ? "contact-email-error" : undefined}
                    />
                    {displayedErrors.email && (
                      <p className={styles.fieldError} id="contact-email-error">
                        {displayedErrors.email}
                      </p>
                    )}
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="contact-message">
                      Message / Question
                    </label>
                    <div className={styles.textareaWrapper}>
                      <textarea
                        id="contact-message"
                        className={`${styles.textarea} ${displayedErrors.message ? styles.inputError : ""}`}
                        rows={4}
                        maxLength={MAX_MESSAGE_LENGTH}
                        value={values.message}
                        onChange={(event) => handleChange("message", event.target.value)}
                        disabled={status === "sending"}
                        aria-invalid={Boolean(displayedErrors.message)}
                        aria-describedby={
                          displayedErrors.message ? "contact-message-error contact-message-count" : "contact-message-count"
                        }
                      />
                      <span className={styles.charCount} id="contact-message-count" aria-live="polite">
                        {values.message.length}/{MAX_MESSAGE_LENGTH}
                      </span>
                    </div>
                    {displayedErrors.message && (
                      <p className={styles.fieldError} id="contact-message-error">
                        {displayedErrors.message}
                      </p>
                    )}
                  </div>

                  {status === "error" && (
                    <p className={styles.formError} role="alert">
                      {errorMessage}
                    </p>
                  )}

                  <div className={styles.actions}>
                    <button
                      className={styles.cancelButton}
                      type="button"
                      onClick={closeModal}
                      disabled={status === "sending"}
                    >
                      Cancel
                    </button>
                    <button
                      className={styles.sendButton}
                      type="submit"
                      disabled={status === "sending" || !isFormValid}
                    >
                      {status === "sending" ? "Sending…" : "Send Message"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
