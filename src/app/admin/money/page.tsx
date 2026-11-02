"use client";

import { CalendarBlank } from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ClientCell, Stats, Table, td } from "@/components/admin/parts";
import { Badge, Banner, Button, Card, Dialog, Input, Meta, PageHeader, Pill, ProgressBar, Row, Rows, Tabs, Textarea, Tile, TileFooter, textActionClass, useConfirm, useTask } from "@/components/ui";
import { date, money } from "@/lib/format";
import { act, useData, type Contract, type Refund } from "@/lib/mock";

type Tab = "contracts" | "payments" | "refunds" | "reasons";

const contractTone: Record<Contract["status"], { label: string; tone: "info" | "success" | "warning" | "neutral" }> = {
  free: { label: "Free 2 weeks", tone: "info" },
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
  const reasons = db.cancellations.reduce<Record<string, number>>((acc, c) => ({ ...acc, [c.reason]: (acc[c.reason] ?? 0) + 1 }), {});
  const max = Math.max(1, ...Object.values(reasons));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Money" description={`Refunds under ${money(db.settings.autoRefundLimitCents)} are approved automatically. Larger ones wait for you.`} />
      <Stats
        items={[
          { label: "Paid this month", value: money(paid) },
          {
            label: "Active contracts",
            value: db.contracts.filter((k) => k.status === "active").length,
          },
          {
            label: "Unpaid, in free 2 weeks",
            value: db.contracts.filter((k) => k.status === "free" && !k.paid).length,
          },
          {
            label: "Failed payments",
            value: db.invoices.filter((i) => i.status === "failed").length,
            tone: "danger",
          },
          {
            label: "Refunds waiting",
            value: db.refunds.filter((r) => r.status === "waiting").length,
            tone: "warning",
          },
        ]}
      />
      <Card padding="none">
        <div className="px-6 pt-2">
          <Tabs
            label="Money"
            value={tab}
            onChange={(t) => router.replace(`/admin/money?tab=${t}`, { scroll: false })}
            tabs={[
              { value: "contracts", label: "Contracts" },
              { value: "payments", label: "Payments" },
              {
                value: "refunds",
                label: "Refunds",
                count: db.refunds.filter((r) => r.status === "waiting").length,
              },
              { value: "reasons", label: "Why clients pull out" },
            ]}
          />
        </div>
        <div className="p-6">
          {tab === "contracts" && (
            <Table label="Contracts" head={["Client", "Status", "Plan", "Dates", "Paid", ""]}>
              {db.contracts.map((k) => (
                <tr key={k.id}>
                  <td className={td}>
                    <ClientCell db={db} clientId={k.clientId} />
                  </td>
                  <td className={td}>
                    <Badge status={contractTone[k.status].tone}>{contractTone[k.status].label}</Badge>
                  </td>
                  <td className={td}>
                    {k.months} months, {money(k.monthlyCents)} a month
                  </td>
                  <td className={`${td} whitespace-nowrap`}>
                    {date(k.startsAt)} to {date(k.endsAt)}
                  </td>
                  <td className={td}>{k.paid ? "Yes" : "No"}</td>
                  <td className={`${td} text-right`}>
                    <button type="button" onClick={() => setExtending(k)} className={textActionClass}>
                      Extend or credit
                    </button>
                  </td>
                </tr>
              ))}
            </Table>
          )}

          {tab === "payments" && (
            <Table label="Invoices" head={["Invoice", "Client", "For", "Amount", "Date", "Status"]}>
              {[...db.invoices]
                .sort((a, b) => b.at.localeCompare(a.at))
                .map((i) => (
                  <tr key={i.id}>
                    <td className={td}>{i.number}</td>
                    <td className={td}>
                      <ClientCell db={db} clientId={i.clientId} />
                    </td>
                    <td className={td}>{i.label}</td>
                    <td className={td}>{money(i.amountCents)}</td>
                    <td className={`${td} whitespace-nowrap`}>{date(i.at)}</td>
                    <td className={td}>
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
          )}

          {tab === "refunds" && (
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
          )}

          {tab === "reasons" && (
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
          )}
        </div>
      </Card>

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
