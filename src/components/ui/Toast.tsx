"use client";

import { CheckCircle, WarningCircle, X } from "@phosphor-icons/react";
import { createContext, useCallback, useContext, useState } from "react";

type Toast = { id: number; text: string; tone: "success" | "danger" };
const ToastContext = createContext<(text: string, tone?: Toast["tone"]) => void>(() => {});

/** Short confirmation after an action. Plain words, one line. */
export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const dismiss = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

  const show = useCallback((text: string, tone: Toast["tone"] = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => dismiss(id), 4000);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 top-4 z-50 flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:items-end"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-md border border-border bg-card px-4 py-3 text-body-sm text-primary shadow-lg"
          >
            {t.tone === "success" ? (
              <CheckCircle className="size-5 shrink-0 text-success" aria-hidden />
            ) : (
              <WarningCircle className="size-5 shrink-0 text-danger" aria-hidden />
            )}
            <span className="flex-1">{t.text}</span>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="rounded-sm p-1 text-secondary hover:text-primary focus-visible:focus-ring"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
