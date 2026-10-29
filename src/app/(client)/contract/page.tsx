"use client";

import { CircleNotch, CreditCard, DownloadSimple } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import { PayDialog } from "@/components/client/PayDialog";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { Avatar, Badge, Banner, Button, Card, Dialog, EmptyState, Textarea, useConfirm, useTask } from "@/components/ui";
import { date, daysFrom, fullName, money } from "@/lib/format";
import { act, useData, useMyClient } from "@/lib/mock";

const contractBadge = {
  free: { label: "Free 2 weeks", tone: "info" as const },
  active: { label: "Active", tone: "success" as const },
  ending: { label: "Ending soon", tone: "warning" as const },
  paused: { label: "Paused", tone: "warning" as const },
  completed: { label: "Completed", tone: "neutral" as const },
  cancelled: { label: "Pulled out", tone: "neutral" as const },
};
const invoiceBadge = { paid: { label: "Paid", tone: "success" as const }, due: { label: "Due", tone: "info" as const }, failed: { label: "Failed", tone: "danger" as const }, refunded: { label: "Refunded", tone: "neutral" as const } };

/** C13 Contract: plan and dates, account manager, payments and invoices, and pulling out. */
export default function ContractPage() {
  const { client, contract, invoices, managerUser, manager } = useMyClient();
  const db = useData();
  const confirm = useConfirm();
  const { run, pending } = useTask();
  const [paying, setPaying] = useState(false);
  const [changing, setChanging] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string>();
  if (!client) return null;

  if (!contract) {
    return (
      <Columns {...rails.clientSettings}>
        <Card title="Contract">
          <EmptyState title="No contract yet" action={<Link href="/setup/plan" className="rounded-sm font-medium text-primary-600 hover:underline focus-visible:focus-ring">Choose your plan</Link>}>
            You choose a 3, 6 or 12-month plan and sign during setup. Your first 2 weeks are free.
          </EmptyState>
        </Card>
      </Columns>
    );
  }

  const b = contractBadge[contract.status];
  const changeRequest = db.changeRequests.find((r) => r.clientId === client.id && r.status === "open");
  const unpaid = !contract.paid && (contract.status === "free" || contract.status === "paused");
  const rows: [string, string][] = [
    ["Plan", `${contract.months} months, ${money(contract.monthlyCents)} a month`],
    ["Signed", `${date(contract.signedAt)} by ${contract.signedName}`],
    ["Free 2 weeks", `Until ${date(contract.freeEndsAt)}`],
    ["Contract", `${date(contract.startsAt)} to ${date(contract.endsAt)}`],
  ];

  return (
    <Columns {...rails.clientSettings}>
      <Card title="Your plan" action={<Badge status={b.tone}>{b.label}</Badge>}>
        <div className="flex flex-col gap-6">
          {unpaid && (
            <Banner tone={contract.status === "paused" || daysFrom(contract.freeEndsAt) <= 5 ? "warning" : "info"} title={contract.status === "paused" ? "Your account is paused until you pay" : `Pay by ${date(contract.freeEndsAt)} to keep going`}>
              {contract.status === "paused" ? "Paying reactivates your account at once, with the same manager." : "If we have not received payment by then, your account pauses until you pay."}
            </Banner>
          )}
          {contract.status === "cancelled" && (
            <Banner
              tone="info"
              title="You pulled out"
              action={
                daysFrom(contract.endsAt) > 0 && (
                  <Button
                    variant="secondary"
                    onClick={() =>
                      confirm({
                        title: "Stay with Bluecut?",
                        body: `Your contract carries on as before, with ${managerUser?.firstName ?? "your manager"}, to ${date(contract.endsAt)}.`,
                        warning: "Any refund not yet paid is cancelled.",
                        confirmLabel: "Stay",
                        action: () => act.stayAfterAll(client.id),
                        success: "Welcome back. Your contract carries on as before.",
                      })
                    }
                  >
                    Stay after all
                  </Button>
                )
              }
            >
              Service runs to {date(contract.endsAt)}. Any refund is shown under Payments. Changed your mind? You can stay until then.
            </Banner>
          )}
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {rows.map(([k, v]) => (
              <div key={k} className="flex flex-col gap-1">
                <dt className="text-caption text-secondary">{k}</dt>
                <dd className="text-body text-primary">{v}</dd>
              </div>
            ))}
          </dl>
          {unpaid && (
            <Button className="self-start" onClick={() => setPaying(true)}>
              Pay {money(contract.monthlyCents)}
            </Button>
          )}
          <Banner tone="info">You can pull out any time. We refund every paid month that has not started.</Banner>
        </div>
      </Card>

      {manager && managerUser && (
        <Card title="Your account manager">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <Avatar name={fullName(managerUser)} size="md" />
              <div className="flex flex-col">
                <span className="text-body font-medium text-primary">{fullName(managerUser)}</span>
                <span className="text-body-sm text-secondary">Since {date(client.joinedAt)}. You keep the same manager when you renew.</span>
              </div>
            </div>
            {changeRequest ? (
              <div className="flex flex-col gap-2 rounded-md bg-info-bg p-4">
                <span className="text-body font-medium text-primary">You asked for a different manager</span>
                <span className="text-body-sm text-secondary">&ldquo;{changeRequest.reason}&rdquo; The owner will get back to you within 1 working day.</span>
                <button
                  type="button"
                  onClick={() =>
                    confirm({
                      title: "Withdraw your request?",
                      body: `You keep ${managerUser.firstName} as your account manager. The owner is told.`,
                      confirmLabel: "Withdraw request",
                      action: () => act.cancelManagerChange(changeRequest.id),
                      success: "Request withdrawn.",
                    })
                  }
                  className="self-start rounded-sm text-body-sm font-medium text-primary-600 hover:underline focus-visible:focus-ring"
                >
                  Withdraw request
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setChanging(true)} className="self-start rounded-sm text-body-sm font-medium text-primary-600 hover:text-primary-700 hover:underline focus-visible:focus-ring">
                Ask for a different manager
              </button>
            )}
          </div>
        </Card>
      )}

      <Card title="Payments">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 rounded-md border border-border p-4">
            <CreditCard className="size-6 text-primary-600" aria-hidden />
            <span className="flex-1 text-body text-primary">{contract.card ? `${contract.card.brand} ending ${contract.card.last4}` : "No card yet"}</span>
            <button type="button" onClick={() => setPaying(true)} className="rounded-sm text-body-sm font-medium text-primary-600 hover:text-primary-700 hover:underline focus-visible:focus-ring">
              {contract.card ? "Update card" : "Add a card"}
            </button>
          </div>
          {invoices.length ? (
            <ul className="flex flex-col">
              {invoices.map((i) => {
                const ib = invoiceBadge[i.status];
                return (
                  <li key={i.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border py-3 last:border-b-0">
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="text-body font-medium text-primary">{i.label}</span>
                      <span className="text-caption text-secondary">
                        {i.number}, {date(i.at)}
                      </span>
                    </span>
                    <span className="text-body-sm text-primary">{money(i.amountCents)}</span>
                    <Badge status={ib.tone}>{ib.label}</Badge>
                    <button
                      type="button"
                      disabled={pending(i.id)}
                      onClick={() => run(i.id, () => act.save(), `${i.number}.pdf downloaded.`)}
                      aria-label={`Download invoice ${i.number}`}
                      className="flex size-10 items-center justify-center rounded-full text-secondary hover:bg-primary-50 hover:text-primary-700 focus-visible:focus-ring"
                    >
                      {pending(i.id) ? <CircleNotch className="size-5 animate-spin" aria-hidden /> : <DownloadSimple className="size-5" aria-hidden />}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-body-sm text-secondary">No payments yet. Receipts appear here.</p>
          )}
        </div>
      </Card>

      {contract.status !== "cancelled" && (
        <Card title="Pull out">
          <div className="flex flex-col gap-3">
            <p className="text-body-sm text-secondary">You can pull out of your contract at any time. We show you the end date and your refund before you confirm.</p>
            <Link href="/contract/cancel" className="self-start rounded-sm text-body-sm font-medium text-primary-600 hover:text-primary-700 hover:underline focus-visible:focus-ring">
              Pull out of my contract
            </Link>
          </div>
        </Card>
      )}

      <PayDialog open={paying} onClose={() => setPaying(false)} clientId={client.id} amountCents={contract.monthlyCents} title={contract.card ? "Pay or update your card" : "Pay now"} />

      <Dialog open={changing} onClose={() => setChanging(false)} title="Ask for a different manager">
        <p className="text-body-sm text-secondary">The owner reads this and gets back to you within 1 working day. Your new manager receives a full handover, so nothing is lost.</p>
        <Textarea label="Why would you like a change?" value={reason} onChange={(e) => { setReason(e.target.value); setError(undefined); }} error={error} />
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setChanging(false)}>
            Cancel
          </Button>
          <Button
            loading={pending("change")}
            onClick={async () => {
              if (!reason.trim()) return setError("Give a short reason, so the owner can find the right person.");
              if (await run("change", () => act.requestManagerChange(client.id, reason.trim()), "Sent to the owner. They will reply within 1 working day.")) {
                setChanging(false);
                setReason("");
              }
            }}
          >
            {pending("change") ? "Sending" : "Send"}
          </Button>
        </div>
      </Dialog>
    </Columns>
  );
}
