"use client";

import { CircleNotch, CreditCard, DownloadSimple } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import { PayDialog } from "@/components/client/PayDialog";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { Avatar, Badge, Banner, Button, buttonClass, Card, Dialog, EmptyState, Pill, Textarea, Tile, TileIcon, useConfirm, useTask } from "@/components/ui";
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
          <EmptyState title="No contract yet" action={<Link href="/setup/plan" className={buttonClass("primary")}>Choose your plan</Link>}>
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
          {/* Question on the left, answer on the right, as in How you review. */}
          <dl className="flex flex-col divide-y divide-border">
            {rows.map(([k, v]) => (
              <div key={k} className="flex flex-col gap-1 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <dt className="text-body-sm text-secondary">{k}</dt>
                <dd className="text-body-sm font-medium text-primary sm:text-right">{v}</dd>
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
            <Link href="/account-manager" className="group flex items-start gap-3 self-start rounded-md focus-visible:focus-ring">
              <Avatar name={fullName(managerUser)} src={managerUser.photo} size="md" />
              <span className="flex flex-col gap-1">
                <span className="text-body font-medium text-primary group-hover:underline">{fullName(managerUser)}</span>
                <span className="text-body-sm text-secondary">Since {date(client.joinedAt)}. You keep the same manager when you renew.</span>
              </span>
            </Link>
            {changeRequest ? (
              <Banner
                tone="info"
                title="You asked for a different manager"
                action={
                  <Button
                    variant="remove"
                    size="sm"
                    onClick={() =>
                      confirm({
                        title: "Withdraw your request?",
                        body: `You keep ${managerUser.firstName} as your account manager. The owner is told.`,
                        confirmLabel: "Withdraw request",
                        action: () => act.cancelManagerChange(changeRequest.id),
                        success: "Request withdrawn.",
                      })
                    }
                  >
                    Withdraw request
                  </Button>
                }
              >
                &ldquo;{changeRequest.reason}&rdquo; The owner will get back to you within 1 working day.
              </Banner>
            ) : (
              <Button variant="secondary" className="self-start" onClick={() => setChanging(true)}>
                Ask for a different manager
              </Button>
            )}
          </div>
        </Card>
      )}

      <Card title="Payments" action={invoices.length > 0 && <Pill>{invoices.length === 1 ? "1 invoice" : `${invoices.length} invoices`}</Pill>}>
        <div className="flex flex-col gap-6">
          <Tile>
            <div className="flex items-center gap-3">
              <TileIcon round>
                <CreditCard className="size-6" aria-hidden />
              </TileIcon>
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-body font-medium text-primary">{contract.card ? `${contract.card.brand} ending ${contract.card.last4}` : "No card yet"}</span>
                <span className="text-body-sm text-secondary">{contract.card ? "Used for your monthly payment." : "Add a card to pay each month."}</span>
              </span>
              <Button variant="secondary" size="sm" onClick={() => setPaying(true)}>
                {contract.card ? "Update card" : "Add a card"}
              </Button>
            </div>
          </Tile>
          {invoices.length ? (
            <div className="flex flex-col gap-2">
              <h3 className="text-body font-medium text-primary">Invoices</h3>
              <ul className="flex flex-col rounded-md border border-border">
                {invoices.map((i) => {
                  const ib = invoiceBadge[i.status];
                  return (
                    <li key={i.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border px-4 py-3 last:border-b-0">
                      <span className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="text-body-sm font-medium text-primary">{i.label}</span>
                        <span className="text-caption text-secondary">
                          {i.number} · {date(i.at)}
                        </span>
                      </span>
                      <span className="text-body-sm font-medium text-primary">{money(i.amountCents)}</span>
                      <Badge status={ib.tone}>{ib.label}</Badge>
                      <button
                        type="button"
                        disabled={pending(i.id)}
                        onClick={() => run(i.id, () => act.save(), `${i.number}.pdf downloaded.`)}
                        aria-label={`Download invoice ${i.number}`}
                        title="Download PDF"
                        className="flex size-9 items-center justify-center rounded-full text-secondary transition-colors hover:bg-primary-50 hover:text-primary-700 focus-visible:focus-ring disabled:cursor-not-allowed"
                      >
                        {pending(i.id) ? <CircleNotch className="size-5 animate-spin" aria-hidden /> : <DownloadSimple className="size-5" aria-hidden />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <p className="text-body-sm text-secondary">No payments yet. Receipts appear here.</p>
          )}
        </div>
      </Card>

      {contract.status !== "cancelled" && (
        <Card title="Pull out">
          <div className="flex flex-col gap-4">
            <p className="text-body-sm text-secondary">You can pull out of your contract at any time. We show you the end date and your refund before you confirm.</p>
            <Link href="/contract/cancel" className={`self-start ${buttonClass("remove")}`}>
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
          <Button variant="cancel" onClick={() => setChanging(false)}>
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
