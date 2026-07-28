"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { CHATBOT_KNOWLEDGE } from "@/data/chatbotKnowledge";
import styles from "./PortfolioChatbot.module.css";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

const STORAGE_KEY = "fatima-portfolio-chat-session";
const MAX_INPUT_LENGTH = 500;
const MAX_HISTORY_MESSAGES = 8;
const ERROR_MESSAGE =
  "I'm sorry, the portfolio assistant is unavailable right now. Please try again later or send your question through the Contact page.";

const initialMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: CHATBOT_KNOWLEDGE.welcomeMessage,
};

function createMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role,
    content,
  };
}

function getStoredMessages() {
  if (typeof window === "undefined") {
    return [initialMessage];
  }

  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [initialMessage];
    }

    const parsed = JSON.parse(stored) as ChatMessage[];
    const validMessages = parsed.filter(
      (message) =>
        message &&
        (message.role === "assistant" || message.role === "user") &&
        typeof message.content === "string",
    );

    return validMessages.length > 0 ? validMessages : [initialMessage];
  } catch {
    return [initialMessage];
  }
}

async function readTextStream(
  stream: ReadableStream<Uint8Array>,
  onText: (text: string) => void,
) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  const textParts: string[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    textParts.push(decoder.decode(value, { stream: true }));
    onText(textParts.join(""));
  }

  return textParts.join("").trim();
}

export default function PortfolioChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(() => getStoredMessages());
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (!isOpen || isMinimized) {
      return;
    }

    inputRef.current?.focus();
  }, [isOpen, isMinimized]);

  useEffect(() => {
    transcriptRef.current?.scrollTo({
      top: transcriptRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  function openChat() {
    setIsOpen(true);
    setIsMinimized(false);
  }

  function closeChat() {
    setIsOpen(false);
    setIsMinimized(false);
  }

  function clearConversation() {
    setMessages([initialMessage]);
    setInput("");
    window.sessionStorage.removeItem(STORAGE_KEY);
    inputRef.current?.focus();
  }

  function openDirectMessage() {
    const form = document.querySelector<HTMLElement>(
      "#contact-form, [data-contact-form]",
    );

    if (form) {
      form.scrollIntoView({ behavior: "smooth", block: "center" });
      const firstField = form.querySelector<HTMLElement>(
        "input, textarea, button, a",
      );
      firstField?.focus();
      return;
    }

    const contactHeading = document.getElementById("contact-heading");
    contactHeading?.scrollIntoView({ behavior: "smooth", block: "start" });
    document
      .querySelector<HTMLAnchorElement>('a[href="https://github.com/FatimaKlye"]')
      ?.focus();
  }

  async function submitMessage(messageText: string) {
    const trimmedMessage = messageText.trim();

    if (!trimmedMessage || isLoading) {
      return;
    }

    const userMessage = createMessage("user", trimmedMessage);
    const nextMessages = [...messages, userMessage].slice(-MAX_HISTORY_MESSAGES);

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/portfolio-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Portfolio chat request failed.");
      }

      const assistantMessage = createMessage("assistant", "");
      setMessages((current) => [...current, assistantMessage]);

      const finalText = await readTextStream(response.body, (currentText) => {
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantMessage.id
              ? { ...message, content: currentText }
              : message,
          ),
        );
      });

      setMessages((current) =>
        current.map((message) =>
          message.id === assistantMessage.id
            ? { ...message, content: finalText || ERROR_MESSAGE }
            : message,
        ),
      );
    } catch {
      setMessages((current) => [...current, createMessage("assistant", ERROR_MESSAGE)]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitMessage(input);
  }

  function handleSuggestion(question: string) {
    void submitMessage(question);
  }

  function handlePanelKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      closeChat();
    }
  }

  return (
    <div className={styles.chatbot} aria-live="polite">
      {!isOpen ? (
        <button
          className={styles.floatingButton}
          type="button"
          onClick={openChat}
          aria-label="Open Fatima's Portfolio Assistant"
        >
          <span aria-hidden="true" className={styles.floatingIcon}>
            ?
          </span>
          <span className={styles.floatingText}>Ask about Fatima</span>
        </button>
      ) : (
        <section
          className={`${styles.panel} ${isMinimized ? styles.panelMinimized : ""}`}
          aria-label="Fatima's Portfolio Assistant"
          onKeyDown={handlePanelKeyDown}
        >
          <header className={styles.header}>
            <div>
              <p className={styles.kicker}>Portfolio Chat</p>
              <h2 className={styles.title}>{CHATBOT_KNOWLEDGE.assistantName}</h2>
            </div>

            <div className={styles.headerActions}>
              <button
                className={styles.iconButton}
                type="button"
                onClick={() => setIsMinimized((value) => !value)}
                aria-label={isMinimized ? "Expand chatbot" : "Minimize chatbot"}
                title={isMinimized ? "Expand" : "Minimize"}
              >
                <span aria-hidden="true">{isMinimized ? "+" : "-"}</span>
              </button>
              <button
                className={styles.iconButton}
                type="button"
                onClick={closeChat}
                aria-label="Close chatbot"
                title="Close"
              >
                <span aria-hidden="true">x</span>
              </button>
            </div>
          </header>

          {!isMinimized && (
            <div className={styles.body}>
              <div
                ref={transcriptRef}
                className={styles.transcript}
                aria-label="Chat conversation"
                role="log"
              >
                {messages.map((message) => (
                  <article
                    className={`${styles.messageRow} ${
                      message.role === "user" ? styles.messageRowUser : ""
                    }`}
                    key={message.id}
                  >
                    <div
                      className={`${styles.message} ${
                        message.role === "user"
                          ? styles.userMessage
                          : styles.assistantMessage
                      }`}
                    >
                      <span className={styles.messageLabel}>
                        {message.role === "user" ? "You" : "Assistant"}
                      </span>
                      <p>{message.content}</p>
                    </div>
                  </article>
                ))}

                {isLoading && (
                  <div className={styles.typingStatus} role="status">
                    <span>Assistant is typing</span>
                    <span className={styles.typingDots} aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </span>
                  </div>
                )}
              </div>

              <div className={styles.suggestions} aria-label="Suggested questions">
                {CHATBOT_KNOWLEDGE.suggestedQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => handleSuggestion(question)}
                    disabled={isLoading}
                  >
                    {question}
                  </button>
                ))}
              </div>

              <form className={styles.form} onSubmit={handleSubmit}>
                <label className={styles.inputLabel} htmlFor="portfolio-chat-input">
                  Ask a portfolio question
                </label>
                <div className={styles.inputRow}>
                  <textarea
                    ref={inputRef}
                    id="portfolio-chat-input"
                    value={input}
                    onChange={(event) =>
                      setInput(event.target.value.slice(0, MAX_INPUT_LENGTH))
                    }
                    placeholder="Ask about projects, skills, or availability"
                    rows={2}
                    maxLength={MAX_INPUT_LENGTH}
                    disabled={isLoading}
                    aria-describedby="portfolio-chat-notice portfolio-chat-count"
                  />
                  <button
                    className={styles.sendButton}
                    type="submit"
                    disabled={isLoading || input.trim().length === 0}
                  >
                    {isLoading ? "Sending" : "Send"}
                  </button>
                </div>
                <div className={styles.formMeta}>
                  <p id="portfolio-chat-notice">
                    Answers are generated from verified information in this portfolio.
                  </p>
                  <span id="portfolio-chat-count">
                    {input.length}/{MAX_INPUT_LENGTH}
                  </span>
                </div>
              </form>

              <div className={styles.footerActions}>
                <button
                  className={styles.secondaryAction}
                  type="button"
                  onClick={clearConversation}
                  disabled={isLoading}
                >
                  Clear Conversation
                </button>
                <button
                  className={styles.directAction}
                  type="button"
                  onClick={openDirectMessage}
                >
                  {CHATBOT_KNOWLEDGE.directMessageLabel}
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
