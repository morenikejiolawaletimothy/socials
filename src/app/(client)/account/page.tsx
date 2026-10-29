"use client";

import { Desktop, DeviceMobile } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PhotoField } from "@/components/account/PhotoField";
import { pullOutTerms } from "@/components/client/contract";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { Banner, Button, Card, Dialog, Input, Select, Switch, useConfirm, useTask } from "@/components/ui";
import { timeZones, zoneLabel } from "@/lib/timezones";
import { fullName, money } from "@/lib/format";
import { act, useMyClient } from "@/lib/mock";

const allSessions = [
  { id: "s1", icon: Desktop, name: "Chrome on Mac", where: "Lagos, now", current: true },
  { id: "s2", icon: DeviceMobile, name: "Safari on iPhone", where: "Lagos, 2 hours ago", current: false },
  { id: "s3", icon: Desktop, name: "Edge on Windows", where: "Abuja, 5 days ago", current: false },
];

const emailItems = [
  { key: "review", label: "Posts ready for your review", description: "Also set in How you review, in Control.", default: true },
  { key: "updates", label: "Weekly and monthly updates", default: true },
  { key: "tasks", label: "Quick tasks for you", default: true },
  { key: "tips", label: "News from Bluecut", description: "Once a month at most.", default: false },
];

/** C14 Account: profile, time zone, sign-in and two-step, sessions, email notifications, your data, delete. */
export default function AccountPage() {
  const { user, client, contract, invoices } = useMyClient();
  const confirm = useConfirm();
  const { run, pending } = useTask();
  const router = useRouter();
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [zone, setZone] = useState(user?.timeZone ?? "Africa/Lagos");
  const [nameError, setNameError] = useState<string>();
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  if (!user || !client) return null;

  const activeContract = contract && !["cancelled", "completed"].includes(contract.status);
  const terms = contract ? pullOutTerms(contract, invoices) : null;
  const sessions = allSessions.filter((x) => !user.signedOut?.includes(x.id));
  const emailOn = (key: string, fallback: boolean) => user.prefs?.[`email.${key}`] ?? fallback;
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
          <PhotoField user={user} name={fullName(user)} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} error={nameError} />
            <Input label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <Select label="Time zone" help="We show call times and due times in this time zone." value={zone} onChange={(e) => setZone(e.target.value)}>
              {timeZones(user.timeZone).map((z) => (
                <option key={z} value={z}>
                  {zoneLabel(z)}
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
                      action: () => act.signOutSessions(user.id, sessions.filter((x) => !x.current).map((x) => x.id)),
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
                          action: () => act.signOutSessions(user.id, [s.id]),
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
                checked={emailOn(i.key, i.default)}
                disabled={pending(i.key)}
                onChange={(v) => run(i.key, () => act.setPref(user.id, `email.${i.key}`, v), `${v ? "You will get" : "You will no longer get"} emails for ${i.label.toLowerCase()}.`)}
              />
            </li>
          ))}
        </ul>
        <p className="pt-4 text-caption text-secondary">Payment reminders and account notices are always sent.</p>
      </Card>

      <Card title="Your data">
        <div className="flex flex-col gap-3">
          <p className="text-body-sm text-secondary">Download everything we hold about you: your strategy, posts, brand files, messages and activity.</p>
          <Button variant="secondary" className="self-start" loading={pending("data")} onClick={() => run("data", () => act.requestDataExport(user.id), "Your download is ready. We emailed you a link.")}>
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
              if (await run("delete", () => act.deleteAccount(client.id), "Your account is deleted. We emailed you a confirmation.")) {
                setDeleting(false);
                router.push("/");
              }
            }}
          >
            {pending("delete") ? "Deleting" : "Delete my account"}
          </Button>
        </div>
      </Dialog>
    </Columns>
  );
}
