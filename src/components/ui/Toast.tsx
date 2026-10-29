"use client";

import { CheckCircle, Info, WarningCircle, X } from "@phosphor-icons/react";
import { createContext, useCallback, useContext, useRef, useState } from "react";
import { Button } from "./Button";
import { Dialog } from "./Dialog";

/* ---------- Toasts ---------- */

type Tone = "success" | "danger" | "info";
type ToastOptions = { action?: { label: string; onClick: () => void } };
type Toast = { id: number; text: string; tone: Tone } & ToastOptions;
type ShowToast = (text: string, tone?: Tone, options?: ToastOptions) => void;
const ToastContext = createContext<ShowToast>(() => {});

/**
 * Short feedback after an action. Plain words, one line: what happened (and what to do, for errors).
 * Pass `{ action: { label: "Undo", onClick } }` when the action can be reversed.
 */
export function useToast() {
  return useContext(ToastContext);
}

const toneIcon = {
  success: <CheckCircle className="size-5 shrink-0 text-success" aria-hidden />,
  danger: <WarningCircle className="size-5 shrink-0 text-danger" aria-hidden />,
  info: <Info className="size-5 shrink-0 text-primary-600" aria-hidden />,
};

/* ---------- Confirmations ---------- */

export type ConfirmOptions = {
  title: string;
  /** What will happen, in plain words. */
  body: React.ReactNode;
  /** Shown in a warning box, for example "You cannot undo this." */
  warning?: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  /** Runs while the dialog shows a spinner. Throw to keep the dialog open (the error is shown). */
  action?: () => Promise<unknown> | unknown;
  /** Toast shown after the action succeeds. */
  /** Toast shown once the action is done, optionally with an action such as Undo or Open. */
  success?: string | (ToastOptions & { text: string });
};
type Confirm = (options: ConfirmOptions) => Promise<boolean>;
const ConfirmContext = createContext<Confirm>(async () => false);

/**
 * Ask before anything destructive or hard to undo: removing, cancelling, sending, paying.
 * `if (await confirm({ ... })) ...`, or pass `action` to run it with a spinner inside the dialog.
 */
export function useConfirm() {
  return useContext(ConfirmContext);
}

/** Provides toasts and confirmations to everything inside it. Every shell wraps its pages in this. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const dismiss = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

  const show = useCallback<ShowToast>((text, tone = "success", options) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, text, tone, ...options }]);
    setTimeout(() => dismiss(id), options?.action ? 6000 : 4000);
  }, []);

  const [ask, setAsk] = useState<ConfirmOptions | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const resolver = useRef<(v: boolean) => void>(null);

  const confirm = useCallback<Confirm>((options) => {
    setError(undefined);
    setAsk(options);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = (result: boolean) => {
    resolver.current?.(result);
    resolver.current = null;
    setAsk(null);
    setBusy(false);
  };

  return (
    <ToastContext.Provider value={show}>
      <ConfirmContext.Provider value={confirm}>
        {children}

        <Dialog open={!!ask} onClose={() => !busy && close(false)} title={ask?.title ?? ""}>
          {ask && (
            <>
              <div className="text-body text-secondary">{ask.body}</div>
              {ask.warning && (
                <p className={`flex items-start gap-2 rounded-md px-4 py-3 text-body-sm text-primary ${ask.tone === "danger" ? "bg-danger-bg" : "bg-warning-bg"}`}>
                  <WarningCircle className={`mt-0.5 size-5 shrink-0 ${ask.tone === "danger" ? "text-danger" : "text-warning"}`} aria-hidden />
                  {ask.warning}
                </p>
              )}
              {error && <p className="text-body-sm text-danger">{error}</p>}
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button variant="ghost" disabled={busy} onClick={() => close(false)}>
                  {ask.cancelLabel ?? "Cancel"}
                </Button>
                <Button
                  variant={ask.tone === "danger" ? "danger" : "primary"}
                  loading={busy}
                  onClick={async () => {
                    if (!ask.action) return close(true);
                    setBusy(true);
                    setError(undefined);
                    try {
                      await ask.action();
                      if (typeof ask.success === "string") show(ask.success);
                      else if (ask.success) show(ask.success.text, "success", ask.success);
                      close(true);
                    } catch {
                      setBusy(false);
                      setError("That did not go through. Check your connection and try again.");
                    }
                  }}
                >
                  {ask.confirmLabel}
                </Button>
              </div>
            </>
          )}
        </Dialog>

        <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-24 z-50 flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:items-end md:bottom-6">
          {toasts.map((t) => (
            <div
              key={t.id}
              role={t.tone === "danger" ? "alert" : "status"}
              className="pointer-events-auto flex w-full max-w-sm animate-toast-in items-center gap-3 rounded-md border border-border bg-card px-4 py-3 text-body-sm text-primary shadow-lg"
            >
              {toneIcon[t.tone]}
              <span className="flex-1">{t.text}</span>
              {t.action && (
                <button
                  type="button"
                  onClick={() => {
                    t.action!.onClick();
                    dismiss(t.id);
                  }}
                  className="rounded-sm px-1 font-medium text-primary-600 hover:underline focus-visible:focus-ring"
                >
                  {t.action.label}
                </button>
              )}
              <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss" className="rounded-sm p-1 text-secondary hover:text-primary focus-visible:focus-ring">
                <X className="size-4" aria-hidden />
              </button>
            </div>
          ))}
        </div>
      </ConfirmContext.Provider>
    </ToastContext.Provider>
  );
}

/* ---------- Running actions ---------- */

/**
 * One way to run any action: tracks which button is busy, shows a success toast, and an error toast
 * (with the fix) if it fails. `run("approve", () => act.approvePost(id), "Approved.")`, then
 * `<Button loading={pending("approve")}>`.
 */
export function useTask() {
  const toast = useToast();
  const [key, setKey] = useState<string | null>(null);
  const run = useCallback(
    async (k: string, fn: () => Promise<unknown> | unknown, success?: string | ToastOptions & { text: string }) => {
      setKey(k);
      try {
        await fn();
        if (typeof success === "string") toast(success);
        else if (success) toast(success.text, "success", success);
        return true;
      } catch {
        toast("That did not go through. Check your connection and try again.", "danger");
        return false;
      } finally {
        setKey(null);
      }
    },
    [toast],
  );
  return { run, pending: (k: string) => key === k, busy: key !== null };
}
