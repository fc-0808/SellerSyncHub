"use client";

import { useState, useId } from "react";
import { ArrowRight, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

type Status = "idle" | "loading" | "success" | "error";

interface WaitlistFormProps {
  className?: string;
  variant?: "hero" | "inline";
}

export default function WaitlistForm({
  className = "",
  variant = "hero",
}: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const emailId = useId();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message ?? "You're on the list! We'll be in touch soon.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please check your connection and try again.");
    }
  };

  if (status === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        className={`flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 animate-fade-in ${className}`}
      >
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
        <div>
          <p className="text-sm font-semibold text-emerald-800">You&apos;re on the list!</p>
          <p className="mt-0.5 text-sm text-emerald-700">{message}</p>
        </div>
      </div>
    );
  }

  const isHero = variant === "hero";

  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full ${className}`}
      noValidate
    >
      <div
        className={`flex ${
          isHero
            ? "flex-col sm:flex-row gap-3"
            : "flex-col gap-2"
        }`}
      >
        <label htmlFor={emailId} className="sr-only">
          Email address
        </label>
        <input
          id={emailId}
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          placeholder="Enter your work email"
          disabled={status === "loading"}
          className={`flex-1 rounded-xl border bg-white/10 placeholder-white/50 text-white backdrop-blur-sm px-4 py-3 text-sm outline-none transition-all
            border-white/20 focus:border-white/60 focus:bg-white/15 focus:ring-2 focus:ring-white/20
            disabled:opacity-60 disabled:cursor-not-allowed
            ${status === "error" ? "border-red-400 focus:border-red-400 focus:ring-red-400/20" : ""}
            ${isHero ? "h-12" : "h-11"}
          `}
          aria-describedby={status === "error" ? `${emailId}-error` : undefined}
          aria-invalid={status === "error"}
        />
        <button
          type="submit"
          disabled={status === "loading" || !email.trim()}
          className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold text-sm
            bg-white text-indigo-700 shadow-sm
            hover:bg-slate-50 active:scale-[0.98]
            disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100
            transition-all duration-150
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-700
            ${isHero ? "h-12 px-6 sm:whitespace-nowrap" : "h-11 px-5 w-full"}
          `}
        >
          {status === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Joining…
            </>
          ) : (
            <>
              Join the Waitlist
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {status === "error" && (
        <div
          id={`${emailId}-error`}
          role="alert"
          aria-live="assertive"
          className="mt-2.5 flex items-center gap-2 text-sm text-red-300 animate-fade-in"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          {message}
        </div>
      )}

      <p className="mt-2.5 text-xs text-white/50">
        No credit card required. Free early access for founding members.
      </p>
    </form>
  );
}
