"use client";

import { EnvelopeSimple, WhatsappLogo } from "@phosphor-icons/react";
import { useState } from "react";
import { Badge, Button, Card, CodeInput, Dialog, InfoTip, Input, Row, Rows, RowText, Select, Switch, TextButton, useConfirm, useTask, useToast } from "@/components/ui";
import { act, type Client, type User } from "@/lib/mock";

/** A WhatsApp number with country code: a plus, then 8 to 15 digits (spaces allowed). */
export const whatsappNumberOk = (n: string) => /^\+\d{8,15}$/.test(n.replace(/[\s-]/g, ""));

/**
 * C18: add or change the WhatsApp number. Two steps: the number, then the 6-digit code we send on WhatsApp.
 * Nothing is sent on WhatsApp until the code is confirmed.
 */
export function WhatsAppDialog({ user, open, onClose }: { user: User; open: boolean; onClose: () => void }) {
  const { run, pending } = useTask();
  const [number, setNumber] = useState(user.whatsapp?.number ?? "+234 ");
  const [step, setStep] = useState<"number" | "code">("number");
  // Phase 1: the code is filled in for the demo (see docs/demo-accounts.md).
  const [code, setCode] = useState("482913");
  const [error, setError] = useState<string>();

  const close = () => {
    setStep("number");
    setError(undefined);
    onClose();
  };

  return (
    <Dialog open={open} onClose={close} title={step === "number" ? "Your WhatsApp number" : "Enter the code"}>
      {step === "number" ? (
        <form
          noValidate
          className="flex flex-col gap-5"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!whatsappNumberOk(number)) return setError("Enter the number with its country code, like +234 802 555 0187.");
            setError(undefined);
            if (await run("wa-send", () => act.startWhatsApp(user.id, number.trim()), "Code sent on WhatsApp.")) setStep("code");
          }}
        >
          <Input label="WhatsApp number" type="tel" autoComplete="tel" value={number} onChange={(e) => setNumber(e.target.value)} error={error} help="With the country code. We send a 6-digit code to it on WhatsApp." />
          <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <Button variant="cancel" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" loading={pending("wa-send")}>
              {pending("wa-send") ? "Sending" : "Send code"}
            </Button>
          </div>
        </form>
      ) : (
        <form
          noValidate
          className="flex flex-col gap-5"
          onSubmit={async (e) => {
            e.preventDefault();
            if (code.length !== 6) return setError("Enter the 6 digits from the WhatsApp message.");
            setError(undefined);
            if (await run("wa-code", () => act.confirmWhatsApp(user.id, code), "WhatsApp is confirmed. We will message you there.")) close();
          }}
        >
          <p className="text-body-sm text-secondary">We sent a code to {number.trim()} on WhatsApp.</p>
          <CodeInput label="6-digit code" value={code} onChange={setCode} error={error} />
          <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
            <TextButton className="self-center" onClick={() => setStep("number")}>Change number</TextButton>
            <Button type="submit" loading={pending("wa-code")}>
              {pending("wa-code") ? "Checking" : "Confirm"}
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}

/**
 * C18 Notifications: how a person is told (in the app always, email, WhatsApp), when (straight away or once a
 * day, quiet at night), then what about (`children`). Used in the client's Account and the manager's Profile.
 */
export function NotifySettings({ user, client, children }: { user: User; client?: Client; children?: React.ReactNode }) {
  const { run, pending } = useTask();
  const confirm = useConfirm();
  const toast = useToast();
  const [adding, setAdding] = useState(false);
  const ch = user.channels ?? { email: client?.review.channels.email ?? true, whatsapp: false, timing: "now" as const, quietNights: true };
  const wa = user.whatsapp;

  const setChannel = (key: "email" | "whatsapp", on: boolean) => {
    if (!on && !(key === "email" ? ch.whatsapp : ch.email))
      return toast("Keep email or WhatsApp on, so you hear about reviews and payments when you are away.", "danger");
    return run(key, () => act.setChannels(user.id, { [key]: on }), `${key === "email" ? "Email" : "WhatsApp"} is ${on ? "on" : "off"}.`);
  };

  return (
    <Card title="Notifications" info="Each message links straight to the page that needs you. Security, payments, review deadlines and account notices always reach you.">
      {/* Three sections, each a heading over its rows, with a line and the same space between sections. */}
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-3" aria-labelledby="notify-how">
          <div className="flex items-center gap-2">
            <h3 id="notify-how" className="text-body font-semibold text-primary">
              How we tell you
            </h3>
            <InfoTip label="About how we tell you">You always see everything in the app too, under Notifications.</InfoTip>
          </div>
          <Rows label="How we tell you">
            <Row>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700">
                <EnvelopeSimple className="size-5" aria-hidden />
              </span>
              <RowText size="md" title="Email" sub={<span className="break-all">{user.email}</span>} />
              <Switch hideLabel label="Email" checked={ch.email} disabled={pending("email")} onChange={(v) => setChannel("email", v)} />
            </Row>
            <Row>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700">
                <WhatsappLogo className="size-5" aria-hidden />
              </span>
              <RowText
                size="md"
                title={
                  <span className="flex flex-wrap items-center gap-2">
                    WhatsApp {wa?.confirmed && <Badge status="success">Confirmed</Badge>}
                  </span>
                }
                sub={
                  wa?.confirmed ? (
                    <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      {wa.number}
                      <TextButton onClick={() => setAdding(true)}>Change</TextButton>
                      <TextButton
                        onClick={() =>
                          confirm({
                            title: "Remove your WhatsApp number?",
                            body: "We will stop messaging you on WhatsApp. Email stays on.",
                            confirmLabel: "Remove",
                            tone: "danger",
                            action: () => act.removeWhatsApp(user.id),
                            success: "WhatsApp number removed. We will email you instead.",
                          })
                        }
                      >
                        Remove
                      </TextButton>
                    </span>
                  ) : (
                    "Add your number to get messages on WhatsApp."
                  )
                }
              />
              {wa?.confirmed ? (
                <Switch hideLabel label="WhatsApp" checked={ch.whatsapp} disabled={pending("whatsapp")} onChange={(v) => setChannel("whatsapp", v)} />
              ) : (
                <Button size="sm" variant="secondary" onClick={() => setAdding(true)}>
                  Add number
                </Button>
              )}
            </Row>
          </Rows>
        </section>

        <section className="flex flex-col gap-3 border-t border-border pt-6" aria-labelledby="notify-when">
          <h3 id="notify-when" className="text-body font-semibold text-primary">
            When
          </h3>
          <div className="flex flex-col divide-y divide-border">
            <div className="pb-4">
              <Select
                label="Send messages"
                value={ch.timing}
                disabled={pending("timing")}
                onChange={(e) => {
                  const v = e.target.value as "now" | "daily";
                  run("timing", () => act.setChannels(user.id, { timing: v }), v === "now" ? "We will message you as things happen." : "We will send one message a day at 9am, plus anything urgent.");
                }}
              >
                <option value="now">Straight away</option>
                <option value="daily">Together, once a day at 9am</option>
              </Select>
            </div>
            <div className="pt-4">
              <Switch
                label="Quiet at night"
                description={pending("quiet") ? "Saving" : "No messages from 9pm to 7am your time, except urgent ones."}
                checked={ch.quietNights}
                disabled={pending("quiet")}
                onChange={(v) => run("quiet", () => act.setChannels(user.id, { quietNights: v }), v ? "Quiet at night is on." : "Quiet at night is off.")}
              />
            </div>
          </div>
        </section>

        {children && (
          <section className="flex flex-col gap-4 border-t border-border pt-6" aria-labelledby="notify-what">
            <h3 id="notify-what" className="text-body font-semibold text-primary">
              What we tell you about
            </h3>
            {children}
          </section>
        )}
      </div>
      <WhatsAppDialog key={String(adding)} user={user} open={adding} onClose={() => setAdding(false)} />
    </Card>
  );
}
