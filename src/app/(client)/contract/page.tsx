"use client";

import { CalendarBlank, CreditCard, DownloadSimple, Gift, Receipt, Signature } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import { PayDialog } from "@/components/client/PayDialog";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { Avatar, Badge, Banner, Button, buttonClass, Card, Dialog, EmptyState, IconButton, Pill, Row, Rows, Textarea, useConfirm, useTask } from "@/components/ui";
import { date, dateTime, daysFrom, fullName, money } from "@/lib/format";
import { act, useData, useMyClient } from "@/lib/mock";
import { plans } from "@/lib/pricing";

const contractBadge = {
  free: { label: "Free", tone: "info" as const },
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
  // Plan name on each invoice: Starter (3 months), Standard (6) or Steady (12).
  const tier = plans.find((p) => p.months === contract.months)?.tier ?? `${contract.months} months`;
  const changeRequest = db.changeRequests.find((r) => r.clientId === client.id && r.status === "open");
  const unpaid = !contract.paid && (contract.status === "free" || contract.status === "paused");
  const fs = client.fullService;
  const pageOn = !!client.companyPage;
  const addonsMonthly = (fs ? db.settings.fullServiceCents : 0) + (pageOn ? db.settings.pageManagementCents : 0);
  const monthsLeft = Math.max(0, Math.ceil((new Date(contract.endsAt).getTime() - Date.now()) / (30 * 86_400_000)));
  const pageProrated = monthsLeft * db.settings.pageManagementCents;
  const ended = ["cancelled", "completed"].includes(contract.status);
  const pagePrice = money(db.settings.pageManagementCents);
  // Contracts are paid once, up front: the plan for all its months. Add-ons (full-service, company Page) are billed each month.
  const planCents = contract.monthlyCents * contract.months;
  const priceRows: [string, string][] = [
    [`${tier} plan, ${contract.months} months`, `${money(planCents)} (${money(contract.monthlyCents)} a month)`],
    ...(fs ? ([["Full-service", `+${money(db.settings.fullServiceCents)} a month`]] as [string, string][]) : []),
    ...(pageOn ? ([["Company Page management", `+${money(db.settings.pageManagementCents)} a month`]] as [string, string][]) : []),
  ];
  const dateRows = [
    { icon: Signature, label: "Signed", value: `${date(contract.signedAt)} by ${contract.signedName}` },
    { icon: Gift, label: "Free 2 weeks", value: `Until ${date(contract.freeEndsAt)}` },
    { icon: CalendarBlank, label: "Contract", value: `${date(contract.startsAt)} to ${date(contract.endsAt)}` },
  ];

  return (
    <Columns {...rails.clientSettings}>
      <Card title="Your plan" action={<Badge status={b.tone}>{b.label}</Badge>} info="You can pull out any time. We refund every paid month that has not started.">
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
          {/* What you pay: one bordered list, the total shaded at the bottom. */}
          <dl className="flex flex-col overflow-hidden rounded-md border border-border">
            {priceRows.map(([k, v]) => (
              <div key={k} className="flex flex-col gap-1 border-b border-border px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <dt className="text-body-sm text-secondary">{k}</dt>
                <dd className="text-body-sm font-medium text-primary sm:text-right">{v}</dd>
              </div>
            ))}
            <div className="flex items-center justify-between gap-4 border-b border-border bg-neutral-25 px-4 py-3 last:border-b-0">
              <dt className="text-body font-semibold text-primary">Contract, paid once</dt>
              <dd className="text-body font-semibold text-primary">{money(planCents)}</dd>
            </div>
            {(fs || pageOn) && (
              <div className="flex items-center justify-between gap-4 bg-neutral-25 px-4 py-3">
                <dt className="text-body font-semibold text-primary">Add-ons a month</dt>
                <dd className="text-body font-semibold text-primary">{money(addonsMonthly)}</dd>
              </div>
            )}
          </dl>
          {unpaid && (
            <div className="border-t border-border pt-6">
              <Button onClick={() => setPaying(true)}>Pay {money(planCents)}</Button>
            </div>
          )}
        </div>
      </Card>

      <Card title="Contract dates">
        <Rows>
          {dateRows.map(({ icon: Icon, label, value }) => (
            <Row key={label}>
              <span className="flex min-w-0 flex-1 items-center gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-body-sm text-secondary">{label}</span>
                  <span className="text-body font-medium text-primary">{value}</span>
                </span>
              </span>
            </Row>
          ))}
        </Rows>
      </Card>

      <Card
        title="Company Page"
        action={<Badge status={pageOn ? "success" : "neutral"}>{pageOn ? "On" : "Off"}</Badge>}
        info="We manage your company Page: posts, comments and replies. On full-service we do it through your delegated access; on self-serve we prepare it for you as tasks. Billed on top of your plan."
      >
        <div className="flex flex-col gap-4">
          {pageOn ? (
            <p className="text-body text-primary">
              {pagePrice} a month on top of your plan. On since {date(client.companyPage!.since)}.
            </p>
          ) : (
            <p className="text-body-sm text-secondary">
              Add your company Page for {pagePrice} a month.{monthsLeft > 0 ? ` You pay ${money(pageProrated)} for the rest of your contract.` : ""}
            </p>
          )}
          {!ended &&
            (pageOn ? (
              <Button
                variant="remove"
                size="sm"
                className="self-start"
                onClick={() =>
                  confirm({
                    title: "Remove the company Page add-on?",
                    body: "We stop managing your company Page.",
                    warning: monthsLeft > 0 ? `We refund the unused Page fee, ${money(pageProrated)}.` : undefined,
                    confirmLabel: "Remove",
                    tone: "danger",
                    action: () => act.setCompanyPage(client.id, false),
                    success: "Company Page removed.",
                  })
                }
              >
                Remove
              </Button>
            ) : (
              <Button variant="secondary" size="sm" className="self-start" loading={pending("page")} onClick={() => run("page", () => act.setCompanyPage(client.id, true), "Company Page added. Your manager is told.")}>
                Add company Page
              </Button>
            ))}
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
        {/* Two sections under one line each: the card you pay with, then every invoice. */}
        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-3" aria-labelledby="pay-card">
            <h3 id="pay-card" className="text-body font-semibold text-primary">
              Payment card
            </h3>
            <Rows>
              <Row>
                <span className="flex min-w-0 flex-1 items-center gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700">
                    <CreditCard className="size-5" aria-hidden />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-body font-medium text-primary">{contract.card ? `${contract.card.brand} ending ${contract.card.last4}` : "No card yet"}</span>
                    <span className="text-body-sm text-secondary">{contract.card ? "Used to pay for your contract." : "Add a card to pay for your contract."}</span>
                  </span>
                </span>
                <Button variant="secondary" size="sm" onClick={() => setPaying(true)}>
                  {contract.card ? "Update card" : "Add a card"}
                </Button>
              </Row>
            </Rows>
          </section>

          <section className="flex flex-col gap-3 border-t border-border pt-6" aria-labelledby="pay-invoices">
            <h3 id="pay-invoices" className="text-body font-semibold text-primary">
              Invoices
            </h3>
            {invoices.length ? (
              <Rows>
                {invoices.map((i) => {
                  const ib = invoiceBadge[i.status];
                  return (
                    <Row key={i.id}>
                      <span className="flex min-w-0 flex-1 items-center gap-4">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700">
                          <Receipt className="size-5" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1 text-body text-secondary">
                          {tier} · {i.number} · {dateTime(i.at)}
                        </span>
                      </span>
                      <span className="flex items-center gap-3">
                        <span className="text-body font-semibold text-primary">{money(i.amountCents)}</span>
                        <Badge status={ib.tone}>{ib.label}</Badge>
                        <IconButton
                          icon={DownloadSimple}
                          label={`Download invoice ${i.number}`}
                          loading={pending(i.id)}
                          onClick={() => run(i.id, () => act.save(), `${i.number}.pdf downloaded.`)}
                        />
                      </span>
                    </Row>
                  );
                })}
              </Rows>
            ) : (
              <p className="text-body-sm text-secondary">No payments yet. Receipts appear here.</p>
            )}
          </section>
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

      <PayDialog open={paying} onClose={() => setPaying(false)} clientId={client.id} amountCents={planCents} title={contract.card ? "Pay or update your card" : "Pay now"} />

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
