"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { isChunkLoadError } from "@/lib/chunkError";

type WidgetBoundaryProps = {
  /** Shown in the console so a caught failure is still easy to trace. */
  name: string;
  /** Static stand-in rendered in place of the widget if it throws. */
  fallback: ReactNode;
  children: ReactNode;
};

/**
 * Keeps an optional, interactive widget from taking the whole page down: if it throws while
 * rendering or in an effect, only its slot swaps to `fallback`. The error is still logged.
 *
 * Stale-build chunk errors are passed up instead, so the route boundary can reload the page
 * onto the current build rather than leaving a fallback in place for no reason.
 */
export default class WidgetBoundary extends Component<WidgetBoundaryProps, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (isChunkLoadError(error)) return;
    console.error(`[${this.props.name}] failed and was replaced by its fallback.`, error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (error && isChunkLoadError(error)) throw error;
    return error ? this.props.fallback : this.props.children;
  }
}
