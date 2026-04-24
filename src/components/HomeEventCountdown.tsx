"use client";

import { useEffect, useState } from "react";

/** Fri Apr 24, 2026 6:00 PM US Eastern Daylight Time (single instant for everyone). */
const TARGET_MS = Date.UTC(2026, 3, 24, 22, 0, 0);

function splitRemaining(totalMs: number) {
  if (totalMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true };
  }
  const sec = Math.floor(totalMs / 1000);
  const days = Math.floor(sec / 86400);
  const hours = Math.floor((sec % 86400) / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;
  return { days, hours, minutes, seconds, ended: false };
}

function two(n: number) {
  return n.toString().padStart(2, "0");
}

export function HomeEventCountdown() {
  const [nowMs, setNowMs] = useState<number | null>(null);

  useEffect(() => {
    setNowMs(Date.now());
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const hasMounted = nowMs !== null;
  const { days, hours, minutes, seconds, ended } = splitRemaining(
    TARGET_MS - (nowMs ?? TARGET_MS),
  );

  return (
    <div className="home-countdown mb-1 space-y-1">
      <p
        className="text-3xl font-bold tracking-wide text-[#9cc5f6] text-border tommy-font sm:text-4xl md:text-5xl break-words"
        aria-live="polite"
      >
        {!hasMounted ? (
          <span className="tabular-nums">-- days, -- hours, -- minutes, -- seconds</span>
        ) : ended ? (
          <span>0 days, 0 hours, 0 minutes, 0 seconds</span>
        ) : (
          <span className="tabular-nums">
            {days} days, {two(hours)} hours, {two(minutes)} minutes, {two(seconds)} seconds
          </span>
        )}
      </p>
      <p className="text-sm font-bold text-[#9cc5f6] break-words">
        {ended
          ? "We're on - see you there!"
          : "Until opening ceremonies · Fri Apr 24 · 6:00 PM Eastern"}
      </p>
    </div>
  );
}
