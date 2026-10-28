"use client";

import { useSyncExternalStore } from "react";

const clock = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Manila",
  hour: "numeric",
  minute: "2-digit",
});

function subscribe(onTick: () => void) {
  const timer = window.setInterval(onTick, 30_000);
  return () => window.clearInterval(timer);
}

// Snapshots are strings, so React re-renders only when the shown minute actually changes.
const getTime = () => clock.format(new Date());
const getServerTime = () => "—";

/** Philippine local time, so visitors abroad know when to expect a reply. The server renders a dash, the client the time. */
export default function LocalTime({ className }: { className?: string }) {
  const time = useSyncExternalStore(subscribe, getTime, getServerTime);

  return <span className={className}>{time}</span>;
}
