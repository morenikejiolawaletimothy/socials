"use client";

import { PaperPlaneTilt, Timer } from "@phosphor-icons/react";
import { useState } from "react";
import { whatsappNumberOk } from "@/components/account/NotifySettings";
import Link from "next/link";
import { Avatar, Badge, Banner, Breadcrumbs, Button, buttonClass, Card, Dialog, Input, Meta, Select, Textarea, TextLink, Tile, TileFooter, useTask } from "@/components/ui";
import { taskProgress } from "@/lib/engage";
import { agoIn, dayTimeIn } from "@/lib/format";
import { act, useData, type Assistant, type QuickTask } from "@/lib/mock";

/** The kinds of quick task an assistant can take, in the words clients see. */
export const kindLabels: Record<QuickTask["kind"], string> = {
  connect: "Connection requests",
  profile: "Profile updates",
  event: "Event and program sign-ups",
  video: "Sending videos",
  comment: "Comments",
  react: "Reactions",
  reshare: "Reposts",
  save: "Saving posts",
  follow: "Follows",
  message: "Messages",
};

/**
 * C19: add or edit an assistant, on its own page (/assistants/new, /assistants/[id]). Email or WhatsApp is
 * needed, so we can send them the link. `onDone` runs after Save or Cancel (usually going back).
 */
export function AssistantForm({ clientId, assistant, onDone }: { clientId: string; assistant?: Assistant; onDone: () => void }) {
  const onClose = onDone;
  const { run, pending } = useTask();
  const [name, setName] = useState(assistant?.name ?? "");
  const [role, setRole] = useState<Assistant["role"]>(assistant?.role ?? "EA");
  const [email, setEmail] = useState(assistant?.email ?? "");
  const [whatsapp, setWhatsapp] = useState(assistant?.whatsapp ?? "");
  const [auto, setAuto] = useState<QuickTask["kind"][]>(assistant?.auto ?? []);
  const [errors, setErrors] = useState<{ name?: string; email?: string; whatsapp?: string }>({});

  const save = async () => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = "Enter their name.";
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) e.email = "Enter an email address like name@company.com.";
    if (whatsapp.trim() && !whatsappNumberOk(whatsapp)) e.whatsapp = "Enter the number with its country code, like +234 803 555 0142.";
    if (!email.trim() && !whatsapp.trim()) e.email = "Add their email or WhatsApp number, so we can send them tasks.";
    setErrors(e);
    if (Object.keys(e).length) return;
    const data = { id: assistant?.id, name: name.trim(), role, email: email.trim() || undefined, whatsapp: whatsapp.trim() || undefined, auto };
    if (await run("save", () => act.saveAssistant(clientId, data), assistant ? `${data.name} updated.` : `${data.name} added. You can now hand them tasks.`)) onClose();
  };

  return (
    <Card title={assistant ? `Edit ${assistant.name}` : "Add an assistant"} eyebrow={<Breadcrumbs items={[{ label: "Assistants", href: "/assistants" }, { label: assistant ? "Edit" : "Add" }]} />}>
      <form
        noValidate
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
          <Input label="Their name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} autoComplete="off" />
          <Select label="Role" value={role} onChange={(e) => setRole(e.target.value as Assistant["role"])}>
            <option value="EA">Executive assistant</option>
            <option value="PA">Personal assistant</option>
          </Select>
        </div>
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} placeholder="name@company.com" autoComplete="off" />
        <Input label="WhatsApp number (optional)" type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} error={errors.whatsapp} placeholder="+234 803 555 0142" autoComplete="off" />
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 text-body-sm font-medium text-primary">Send these to them as soon as they arrive (optional)</legend>
          {(Object.keys(kindLabels) as QuickTask["kind"][]).map((k) => (
            <label key={k} className="flex cursor-pointer items-center gap-3 text-body text-primary">
              <input
                type="checkbox"
                checked={auto.includes(k)}
                onChange={(e) => setAuto(e.target.checked ? [...auto, k] : auto.filter((x) => x !== k))}
                className="size-4 shrink-0 accent-primary-600 focus-visible:focus-ring"
              />
              {kindLabels[k]}
            </label>
          ))}
        </fieldset>
        <div className="flex flex-wrap gap-3">
          <Button type="submit" loading={pending("save")}>
            {pending("save") ? "Saving" : assistant ? "Save" : "Add assistant"}
          </Button>
          <Button variant="cancel" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}

/**
 * C19 on a quick task: hand it to an assistant, or, once handed over, see where it is (sent, opened, progress)
 * with Resend link and Take back.
 */
export function HandoffCard({ task, clientId }: { task: QuickTask; clientId: string }) {
  const db = useData();
  const { run, pending } = useTask();
  const assistants = (db.assistants ?? []).filter((a) => a.clientId === clientId);
  const [open, setOpen] = useState(false);
  const [pick, setPick] = useState(assistants[0]?.id ?? "");
  const [note, setNote] = useState("");
  const h = task.handoff;
  const active = h && !h.endedAt;
  const a = assistants.find((x) => x.id === h?.assistantId);
  const first = a?.name.split(" ")[0] ?? "your assistant";
  const via = (x?: Assistant) => [x?.email && "email", x?.whatsapp && "WhatsApp"].filter(Boolean).join(" and ");

  if (task.done && !h) return null;

  return (
    <Card
      title={active ? `With ${first}` : "Someone does this for you?"}
      info={
        active || (task.done && h)
          ? undefined
          : assistants.length === 0
            ? "Add your executive or personal assistant and we send them a private link to this task by email or WhatsApp. They do not need an account, and they only see this task."
            : `We send ${assistants.length === 1 ? assistants[0].name.split(" ")[0] : "them"} a private link to this task only. They can do everything you can here, and you see their progress.`
      }
    >
      <div className="flex flex-col gap-4">
        {active && a ? (
          <Tile>
            <span className="flex items-start gap-4">
              <Avatar name={a.name} size="md" />
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="flex flex-wrap items-center gap-2 text-body font-medium text-primary">
                  {a.name} ({a.role}) <Badge status={h.openedAt ? "info" : "neutral"}>{h.openedAt ? "Opened" : "Sent"}</Badge>
                </span>
                <span className="text-body-sm text-secondary">
                  Sent by {via(a)} {agoIn(h.sentAt)}
                  {h.openedAt ? `, opened ${agoIn(h.openedAt)}` : ""}.
                  {(task.people || task.items) && ` ${[...(task.people ?? []), ...(task.items ?? [])].filter((p) => p.doneBy).length} of ${taskProgress(task).total} done by ${first}.`}
                </span>
                {h.note && <span className="text-body-sm text-primary">Your note: &ldquo;{h.note}&rdquo;</span>}
              </span>
            </span>
            <TileFooter>
              <Meta icon={Timer}>Link works until {dayTimeIn(h.expiresAt)}</Meta>
              <span className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="remove"
                  loading={pending("back")}
                  onClick={() =>
                    run("back", () => act.takeBackTask(task.id), {
                      text: `Taken back. ${first}'s link no longer works.`,
                      action: { label: "Undo", onClick: () => act.restoreHandoff(task.id) },
                    })
                  }
                >
                  Take back
                </Button>
                <Button
                  size="sm"
                  loading={pending("resend")}
                  onClick={() => run("resend", () => act.resendHandoff(task.id), `Sent ${first} a new link. The old one no longer works.`)}
                >
                  Resend link
                </Button>
              </span>
            </TileFooter>
          </Tile>
        ) : task.done && h ? (
          <Banner tone="success">{task.doneBy ? `${task.doneBy} finished this.` : "Done. The link to your assistant has stopped working."}</Banner>
        ) : assistants.length === 0 ? (
          <>
            <Link href={`/assistants/new?back=${encodeURIComponent(`/tasks/${task.id}`)}`} className={`self-start ${buttonClass("secondary")}`}>
              Add an assistant
            </Link>
          </>
        ) : (
          <>
            {h?.endedReason === "taken-back" && <Banner tone="neutral">You took this back from {first}. Their link no longer works.</Banner>}
            <Button className="self-start" onClick={() => setOpen(true)}>
              <PaperPlaneTilt className="size-4" aria-hidden /> Hand to my assistant
            </Button>
          </>
        )}
        <TextLink href="/assistants" className="self-start">
          Manage assistants
        </TextLink>
      </div>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Hand to your assistant"
        info="The link opens this task only and works for 14 days, or until it is done or you take it back. They cannot see anything else on your account."
      >
        <form
          noValidate
          className="flex flex-col gap-5"
          onSubmit={async (e) => {
            e.preventDefault();
            const to = assistants.find((x) => x.id === pick);
            if (!to) return;
            if (await run("hand", () => act.handToAssistant(task.id, to.id, note.trim()), `Sent to ${to.name} by ${via(to)}.`)) {
              setOpen(false);
              setNote("");
            }
          }}
        >
          {assistants.length > 1 ? (
            <Select label="Who" value={pick} onChange={(e) => setPick(e.target.value)}>
              {assistants.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name} ({x.role})
                </option>
              ))}
            </Select>
          ) : (
            assistants[0] && (
              // One assistant: show who gets it and how, instead of a one-option dropdown.
              <div className="flex items-center gap-3 rounded-md border border-border p-3">
                <Avatar name={assistants[0].name} size="md" />
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-body font-medium text-primary">
                    {assistants[0].name} ({assistants[0].role})
                  </span>
                  <span className="text-body-sm text-secondary">Sent by {via(assistants[0])}</span>
                </span>
              </div>
            )
          )}
          <Textarea label="A note for them (optional)" value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} placeholder="Please finish these by Thursday." />
          <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row-reverse sm:justify-start">
            <Button type="submit" loading={pending("hand")}>
              {pending("hand") ? "Sending" : "Send"}
            </Button>
            <Button variant="cancel" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Dialog>
    </Card>
  );
}
