"use client";

import { Desktop, DeviceMobile } from "@phosphor-icons/react";
import Link from "next/link";
import { useRef, useState } from "react";
import { pullOutTerms } from "@/components/client/contract";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { Avatar, Banner, Button, Card, Dialog, Input, Select, Switch, useConfirm, useTask } from "@/components/ui";
import { fullName, money } from "@/lib/format";
import { act, useMyClient } from "@/lib/mock";

const zones = ["Africa/Lagos", "Africa/Accra", "Africa/Nairobi", "Africa/Johannesburg", "Europe/London", "America/Toronto", "America/New_York"];
const emailItems = [
  { key: "review" as const, label: "Posts ready for your review", description: "Also set in How you review, in Control." },
  { key: "updates" as const, label: "Weekly and monthly updates" },
  { key: "tasks" as const, label: "Quick tasks for you" },
  { key: "tips" as const, label: "News from Bluecut", description: "Once a month at most." },
];

/** C14 Account: profile, time zone, sign-in and two-step, sessions, email notifications, your data, delete. */
export default function AccountPage() {
  const { user, client, contract, invoices } = useMyClient();
  const confirm = useConfirm();
  const { run, pending } = useTask();
  const photoRef = useRef<HTMLInputElement>(null);
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [zone, setZone] = useState(user?.timeZone ?? "Africa/Lagos");
  const [nameError, setNameError] = useState<string>();
  const [emails, setEmails] = useState({ review: true, updates: true, tasks: true, tips: false });
  const [sessions, setSessions] = useState([
    { id: "s1", icon: Desktop, name: "Chrome on Mac", where: "Lagos, now", current: true },
    { id: "s2", icon: DeviceMobile, name: "Safari on iPhone", where: "Lagos, 2 hours ago", current: false },
    { id: "s3", icon: Desktop, name: "Edge on Windows", where: "Abuja, 5 days ago", current: false },
  ]);
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  if (!user || !client) return null;

  const activeContract = contract && !["cancelled", "completed"].includes(contract.status);
  const terms = contract ? pullOutTerms(contract, invoices) : null;
  const dirty = firstName !== user.firstName || lastName !== user.lastName || zone !== user.timeZone;

  return (
    <Columns {...rails.clientSettings}>
      <Card title="Profile">
        <form
          noValidate
          className="flex flex-col gap-6"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!firstName.trim() || !lastName.trim()) return setNameError("Enter your first and last name.");
            setNameError(undefined);
            await run("profile", () => act.saveProfile(user.id, { firstName: firstName.trim(), lastName: lastName.trim(), timeZone: zone }), "Profile saved.");
          }}
        >
          <div className="flex items-center gap-4">
            <Avatar name={fullName(user)} size="xl" />
            <input
              ref={photoRef}
              type="file"
              accept="image/png,image/jpeg"
              className="sr-only"
              tabIndex={-1}
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (f) run("photo", () => act.save(), "Photo updated.");
              }}
            />
            <Button variant="secondary" loading={pending("photo")} onClick={() => photoRef.current?.click()}>
              {pending("photo") ? "Uploading" : "Change photo"}
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} error={nameError} />
            <Input label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <Select label="Time zone" help="We show call times and due times in this time zone." value={zone} onChange={(e) => setZone(e.target.value)}>
              {zones.map((z) => (
                <option key={z} value={z}>
                  {z.replace("_", " ").replace("/", ", ")}
                </option>
              ))}
          </Select>
          <Button type="submit" className="self-start" disabled={!dirty} loading={pending("profile")}>
            {pending("profile") ? "Saving" : "Save"}
          </Button>
        </form>
      </Card>

      <Card title="Sign-in and security">
        <div className="flex flex-col gap-6">
          <dl className="flex flex-col gap-1">
            <dt className="text-caption text-secondary">Email</dt>
            <dd className="text-body text-primary">{user.email}</dd>
          </dl>
          <Link href="/reset" className="self-start rounded-sm text-body-sm font-medium text-primary-600 hover:text-primary-700 hover:underline focus-visible:focus-ring">
            Change password
          </Link>
          <Switch
            label="Two-step sign-in"
            description={pending("2fa") ? "Saving" : "Ask for a code from your authenticator app when you sign in. Recommended."}
            checked={user.twoStep}
            disabled={pending("2fa")}
            onChange={(v) =>
              v
                ? run("2fa", () => act.setTwoStep(user.id, true), "Two-step sign-in is on.")
                : confirm({
                    title: "Turn off two-step sign-in?",
                    body: "You will sign in with your password only.",
                    warning: "Your account is easier to break into without it. We recommend keeping it on.",
                    confirmLabel: "Turn off",
                    tone: "danger",
                    action: () => act.setTwoStep(user.id, false),
                    success: "Two-step sign-in is off.",
                  })
            }
          />
          <div className="flex flex-col gap-3">
            <span className="flex items-center justify-between gap-3">
              <span className="text-body font-semibold text-primary">Where you are signed in</span>
              {sessions.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    confirm({
                      title: "Sign out everywhere else?",
                      body: `${sessions.length - 1} other devices will be signed out. This device stays signed in.`,
                      confirmLabel: "Sign out others",
                      action: async () => {
                        await act.save();
                        setSessions((s) => s.filter((x) => x.current));
                      },
                      success: "Signed out of all other devices.",
                    })
                  }
                  className="rounded-sm text-body-sm font-medium text-primary-600 hover:underline focus-visible:focus-ring"
                >
                  Sign out everywhere else
                </button>
              )}
            </span>
            <ul className="flex flex-col rounded-md border border-border">
              {sessions.map((s) => (
                <li key={s.id} className="flex items-center gap-3 border-b border-border p-4 last:border-b-0">
                  <s.icon className="size-6 text-secondary" aria-hidden />
                  <span className="flex flex-1 flex-col">
                    <span className="text-body font-medium text-primary">{s.name}</span>
                    <span className="text-caption text-secondary">{s.where}</span>
                  </span>
                  {s.current ? (
                    <span className="text-caption text-success">This device</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        confirm({
                          title: `Sign out of ${s.name}?`,
                          body: "Anyone using that device will need your password to get back in.",
                          confirmLabel: "Sign out",
                          action: async () => {
                            await act.save();
                            setSessions((list) => list.filter((x) => x.id !== s.id));
                          },
                          success: `Signed out of ${s.name}.`,
                        })
                      }
                      className="rounded-sm text-body-sm font-medium text-primary-600 hover:underline focus-visible:focus-ring"
                    >
                      Sign out
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      <Card title="Email notifications">
        <ul className="flex flex-col">
          {emailItems.map((i) => (
            <li key={i.key} className="border-b border-border py-4 first:pt-0 last:border-b-0 last:pb-0">
              <Switch
                label={i.label}
                description={pending(i.key) ? "Saving" : i.description}
                checked={emails[i.key]}
                disabled={pending(i.key)}
                onChange={async (v) => {
                  if (await run(i.key, () => act.save(), `${v ? "You will get" : "You will no longer get"} emails for ${i.label.toLowerCase()}.`)) setEmails({ ...emails, [i.key]: v });
                }}
              />
            </li>
          ))}
        </ul>
        <p className="pt-4 text-caption text-secondary">Payment reminders and account notices are always sent.</p>
      </Card>

      <Card title="Your data">
        <div className="flex flex-col gap-3">
          <p className="text-body-sm text-secondary">Download everything we hold about you: your strategy, posts, brand files, messages and activity.</p>
          <Button variant="secondary" className="self-start" loading={pending("data")} onClick={() => run("data", () => act.save(), "We are preparing your download. We will email you a link within an hour.")}>
            {pending("data") ? "Preparing" : "Download my data"}
          </Button>
        </div>
      </Card>

      <Card title="Delete your account">
        <div className="flex flex-col gap-3">
          <Banner tone="warning">
            This removes your account and deletes your data. We keep only invoices and payment records, as the law requires.
            {activeContract ? " Your contract is cancelled first, with any refund due." : ""}
          </Banner>
          <Button variant="ghost" className="self-start" onClick={() => setDeleting(true)}>
            Delete my account
          </Button>
        </div>
      </Card>

      <Dialog open={deleting} onClose={() => setDeleting(false)} title="Delete your account?">
        {activeContract && terms && (
          <Banner tone="warning" title="This cancels your contract first">
            {terms.explain} Refund: {money(terms.refundCents)}.
          </Banner>
        )}
        <p className="text-body text-secondary">Your strategy, posts, brand files and messages are deleted. Download your data first if you want to keep it.</p>
        <p className="rounded-md bg-danger-bg px-4 py-3 text-body-sm text-primary">You cannot undo this. To come back, you would sign up and start again.</p>
        <Input label='Type "delete" to confirm' value={confirmText} onChange={(e) => setConfirmText(e.target.value)} />
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setDeleting(false)}>
            Keep my account
          </Button>
          <Button
            variant="danger"
            disabled={confirmText.trim().toLowerCase() !== "delete"}
            loading={pending("delete")}
            onClick={async () => {
              if (await run("delete", () => act.save(), "Demo only: in the live app your account would now be deleted, and we would email you a confirmation.")) setDeleting(false);
            }}
          >
            {pending("delete") ? "Deleting" : "Delete my account"}
          </Button>
        </div>
      </Dialog>
    </Columns>
  );
}
