"use client";

import { ArrowCounterClockwise, CalendarBlank, Gift, Signature, WarningCircle } from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ClientCell, StatTile, Table, tdFlush } from "@/components/admin/parts";
import { Badge, Banner, Button, Card, Dialog, Input, Meta, PageHeader, Pill, ProgressBar, Row, Rows, Tabs, Textarea, Tile, TileFooter, textActionClass, useConfirm, useTask } from "@/components/ui";
import { date, money, plural } from "@/lib/format";
import { plans } from "@/lib/pricing";
import { act, useData, type Contract, type Refund } from "@/lib/mock";

type Tab = "contracts" | "payments" | "refunds" | "reasons";

const contractTone: Record<Contract["status"], { label: string; tone: "info" | "success" | "warning" | "neutral" }> = {
  free: { label: "Free", tone: "info" },
  active: { label: "Active", tone: "success" },
  ending: { label: "Ending soon", tone: "warning" },
  paused: { label: "Paused", tone: "warning" },
  completed: { label: "Completed", tone: "neutral" },
  cancelled: { label: "Cancelled", tone: "neutral" },
};
const refundTone: Record<Refund["status"], { label: string; tone: "info" | "success" | "warning" | "danger" | "neutral" }> = {
  waiting: { label: "Waiting for you", tone: "warning" },
  "auto-approved": { label: "Approved automatically", tone: "success" },
  approved: { label: "Approved", tone: "success" },
  declined: { label: "Declined", tone: "neutral" },
  paid: { label: "Paid", tone: "success" },
};

/** A5 Money: contracts, payments, refunds (automatic below the limit) and why clients pull out. */
function MoneyPage() {
  const db = useData();
  const confirm = useConfirm();
  const { run, pending } = useTask();
  const router = useRouter();
  const [extending, setExtending] = useState<Contract | null>(null);
  const [extKind, setExtKind] = useState<"extend" | "credit">("extend");
  const [extAmount, setExtAmount] = useState("1");
  const [extNote, setExtNote] = useState("");
  const [extError, setExtError] = useState<string>();
  const tab = (useSearchParams().get("tab") as Tab) || "contracts";
  const [declining, setDeclining] = useState<Refund | null>(null);
  const [reason, setReason] = useState("");
  const paid = db.invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amountCents, 0);
  const paidCount = db.invoices.filter((i) => i.status === "paid").length;
  const failedCount = db.invoices.filter((i) => i.status === "failed").length;
  const waitingCount = db.refunds.filter((r) => r.status === "waiting").length;
  const liveContracts = db.contracts.filter((k) => k.status !== "cancelled" && k.status !== "completed");
  const reasons = db.cancellations.reduce<Record<string, number>>((acc, c) => ({ ...acc, [c.reason]: (acc[c.reason] ?? 0) + 1 }), {});
  const max = Math.max(1, ...Object.values(reasons));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Money" />
      {/* As on the Overview: the hero card across two columns and two rows, four small number cards beside it (two across on phones). */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        <section aria-labelledby="money-paid" className="col-span-2 flex flex-col gap-6 rounded-lg border border-border bg-card p-6 lg:row-span-2">
          <div className="flex flex-col gap-2">
            <h2 id="money-paid" className="text-body-sm text-secondary">
              Paid this month
            </h2>
            <p className="font-display text-display-3xl text-primary">{money(paid)}</p>
            <p className="text-body-sm text-secondary">
              From {paidCount} {paidCount === 1 ? "payment" : "payments"}, each a full contract paid up front
            </p>
          </div>
          {/* Contracts by length (Starter, Standard, Steady), with a bar each. */}
          <ul className="flex flex-col gap-4 border-t border-border pt-6">
            {plans.map((p) => {
              const n = liveContracts.filter((k) => k.months === p.months).length;
              return (
                <li key={p.id} className="flex flex-col gap-2">
                  <span className="flex items-center justify-between gap-3 text-body-sm">
                    <span className="text-secondary">
                      {p.tier}, {p.label}
                    </span>
                    <span className="font-medium text-primary">{plural(n, "contract")}</span>
                  </span>
                  <ProgressBar value={n} max={Math.max(liveContracts.length, 1)} />
                </li>
              );
            })}
          </ul>
        </section>

        <StatTile icon={Signature} label="Active contracts" value={db.contracts.filter((k) => k.status === "active").length} />
        <StatTile icon={Gift} label="Unpaid, in their free period" value={db.contracts.filter((k) => k.status === "free" && !k.paid).length} />
        <StatTile icon={WarningCircle} label="Failed payments" value={failedCount} tone={failedCount ? "danger" : undefined} />
        <StatTile icon={ArrowCounterClockwise} label="Refunds waiting" value={waitingCount} tone={waitingCount ? "warning" : undefined} />
      </div>
      {/* As on the Overview: the tab row in its own card, then one titled card at a time under it. */}
      <div className="rounded-lg border border-border bg-card p-2">
        <Tabs
          label="Money"
          value={tab}
          onChange={(t) => router.replace(`/admin/money?tab=${t}`, { scroll: false })}
          className="max-w-none w-full bg-neutral-50!"
          tabs={[
            { value: "contracts", label: "Contracts" },
            { value: "payments", label: "Payments" },
            { value: "refunds", label: "Refunds", count: waitingCount },
            { value: "reasons", label: "Why clients pull out" },
          ]}
        />
      </div>

      {tab === "contracts" && (
        <Card title="Contracts" padding="none" action={<Pill>{plural(db.contracts.length, "contract")}</Pill>}>
            <Table label="Contracts" flush head={["Client", "Plan", "Dates", "Paid", "", "Status"]}>
              {db.contracts.map((k) => (
                <tr key={k.id}>
                  <td className={tdFlush}>
                    <ClientCell db={db} clientId={k.clientId} />
                  </td>
                  <td className={tdFlush}>
                    {k.months} months, {money(k.monthlyCents)} a month
                  </td>
                  <td className={`${tdFlush} whitespace-nowrap`}>
                    {date(k.startsAt)} to {date(k.endsAt)}
                  </td>
                  <td className={tdFlush}>{k.paid ? "Yes" : "No"}</td>
                  <td className={tdFlush}>
                    <button type="button" onClick={() => setExtending(k)} className={`${textActionClass} whitespace-nowrap`}>
                      Extend or credit
                    </button>
                  </td>
                  <td className={tdFlush}>
                    <Badge status={contractTone[k.status].tone}>{contractTone[k.status].label}</Badge>
                  </td>
                </tr>
              ))}
            </Table>
        </Card>
      )}

      {tab === "payments" && (
        <Card title="Payments" padding="none" action={<Pill>{plural(db.invoices.length, "invoice")}</Pill>}>
            <Table label="Invoices" flush head={["Invoice", "Client", "For", "Amount", "Date", "Status"]}>
              {[...db.invoices]
                .sort((a, b) => b.at.localeCompare(a.at))
                .map((i) => (
                  <tr key={i.id}>
                    <td className={tdFlush}>{i.number}</td>
                    <td className={tdFlush}>
                      <ClientCell db={db} clientId={i.clientId} />
                    </td>
                    <td className={tdFlush}>{i.label}</td>
                    <td className={tdFlush}>{money(i.amountCents)}</td>
                    <td className={`${tdFlush} whitespace-nowrap`}>{date(i.at)}</td>
                    <td className={tdFlush}>
                      <Badge
                        status={
                          {
                            paid: "success" as const,
                            failed: "danger" as const,
                            due: "info" as const,
                            refunded: "neutral" as const,
                          }[i.status]
                        }
                      >
                        {
                          {
                            paid: "Paid",
                            failed: "Failed",
                            due: "Due",
                            refunded: "Refunded",
                          }[i.status]
                        }
                      </Badge>
                    </td>
                  </tr>
                ))}
            </Table>
        </Card>
      )}

      {tab === "refunds" && (
        <Card
          title="Refunds"
          info={`Refunds under ${money(db.settings.autoRefundLimitCents)} are approved automatically. Larger ones wait for you.`}
          action={waitingCount > 0 && <Pill>{waitingCount} waiting</Pill>}
        >
            <ul className="flex flex-col gap-3">
              {db.refunds.map((r) => (
                <li key={r.id}>
                  <Tile done={r.status !== "waiting"}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <ClientCell db={db} clientId={r.clientId} sub={`Reason: ${r.reason}`} />
                    <Badge status={refundTone[r.status].tone}>{refundTone[r.status].label}</Badge>
                  </div>
                  <Banner tone="neutral">{r.calc}</Banner>
                  <TileFooter>
                    <span className="text-body font-medium text-primary">{money(r.amountCents)}</span>
                  {r.status === "waiting" && (
                    <div className="flex gap-2">
                      <Button variant="remove" size="sm" onClick={() => setDeclining(r)}>
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          confirm({
                            title: `Approve a refund of ${money(r.amountCents)}?`,
                            body: "It is paid to the client's card automatically, and they are told by email.",
                            warning: "Refunds cannot be taken back once paid.",
                            confirmLabel: "Approve refund",
                            action: () => act.decideRefund(r.id, true),
                            success: "Refund approved. It is paid automatically and the client is told.",
                          })
                        }
                      >
                        Approve refund
                      </Button>
                    </div>
                  )}
                  </TileFooter>
                  </Tile>
                </li>
              ))}
            </ul>
        </Card>
      )}

      {tab === "reasons" && (
        <Card title="Why clients pull out" action={<Pill>{plural(db.cancellations.length, "client")}</Pill>}>
            <div className="flex flex-col gap-6">
              <Rows label="Reasons">
                {Object.entries(reasons)
                  .sort((a, b) => b[1] - a[1])
                  .map(([r, n]) => (
                    <Row key={r} className="flex-col items-stretch gap-2">
                      <span className="flex justify-between gap-3 text-body-sm">
                        <span className="font-medium text-primary">{r}</span>
                        <Pill>{n}</Pill>
                      </span>
                      <ProgressBar value={n} max={max} />
                    </Row>
                  ))}
              </Rows>
              <section className="flex flex-col gap-2">
                <h3 className="text-body font-medium text-primary">Who pulled out</h3>
                <ul className="flex flex-col gap-3">
                  {db.cancellations.map((c) => (
                    <li key={c.id}>
                      <Tile done={!!c.withdrawnAt}>
                        <ClientCell db={db} clientId={c.clientId} sub={c.reason} />
                        {c.note && <Banner tone="neutral">&ldquo;{c.note}&rdquo;</Banner>}
                        <TileFooter>
                          <Meta icon={CalendarBlank}>{date(c.at)}</Meta>
                          {c.withdrawnAt && <Badge status="success">Stayed after all</Badge>}
                        </TileFooter>
                      </Tile>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
        </Card>
      )}

      <Dialog open={!!declining} onClose={() => setDeclining(null)} title="Decline this refund?">
        <Textarea label="Reason (sent to the client)" value={reason} onChange={(e) => setReason(e.target.value)} />
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="cancel" onClick={() => setDeclining(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            disabled={!reason.trim()}
            loading={pending("decline")}
            onClick={async () => {
              if (declining && (await run("decline", () => act.decideRefund(declining.id, false, reason.trim()), "Refund declined. The client has your reason."))) {
                setDeclining(null);
                setReason("");
              }
            }}
          >
            Decline
          </Button>
        </div>
      </Dialog>
      <Dialog open={!!extending} onClose={() => setExtending(null)} title="Extend or credit">
        <fieldset className="flex gap-2">
          <legend className="sr-only">Kind</legend>
          {(["extend", "credit"] as const).map((k) => (
            <label key={k} className={`flex flex-1 cursor-pointer items-center gap-2 rounded-md border p-3 ${extKind === k ? "border-primary-600 bg-primary-50" : "border-border"}`}>
              <input type="radio" name="kind" checked={extKind === k} onChange={() => setExtKind(k)} className="size-4 accent-primary-600" />
              <span className="text-body-sm text-primary">{k === "extend" ? "Extend, free" : "Add a credit"}</span>
            </label>
          ))}
        </fieldset>
        <Input label={extKind === "extend" ? "Months to add" : "Credit (USD)"} inputMode="numeric" value={extAmount} onChange={(e) => setExtAmount(e.target.value)} />
        <Textarea
          label="Note (required)"
          rows={2}
          value={extNote}
          onChange={(e) => {
            setExtNote(e.target.value);
            setExtError(undefined);
          }}
          error={extError}
          help="Kept in the audit log. The client is told."
        />
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="cancel" onClick={() => setExtending(null)}>
            Cancel
          </Button>
          <Button
            loading={pending("extend")}
            onClick={async () => {
              const n = Number(extAmount);
              if (!n || n < 1) return setExtError(extKind === "extend" ? "Enter the number of months, 1 or more." : "Enter the credit amount.");
              if (!extNote.trim()) return setExtError("Add a note. It is required for every change.");
              if (
                extending &&
                (await run(
                  "extend",
                  () => act.extendContract(extending.id, extKind, n, extNote.trim()),
                  extKind === "extend" ? `Contract extended by ${n} month${n === 1 ? "" : "s"}. The client is told.` : `Credit of $${n} added. The client is told.`,
                ))
              ) {
                setExtending(null);
                setExtNote("");
              }
            }}
          >
            Save
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <MoneyPage />
    </Suspense>
  );
}
