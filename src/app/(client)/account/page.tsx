"use client";

import { Desktop, DeviceMobile } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { NotifySettings } from "@/components/account/NotifySettings";
import { PhotoField } from "@/components/account/PhotoField";
import { pullOutTerms } from "@/components/client/contract";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { Badge, Banner, Button, Card, Dialog, Input, Select, Switch, TextButton, textActionClass, useConfirm, useTask } from "@/components/ui";
import { timeZones, zoneLabel } from "@/lib/timezones";
import { fullName, money } from "@/lib/format";
import { act, useMyClient } from "@/lib/mock";

const allSessions = [
  { id: "s1", icon: Desktop, name: "Chrome on Mac", where: "Lagos · now", current: true },
  { id: "s2", icon: DeviceMobile, name: "Safari on iPhone", where: "Lagos · 2 hours ago", current: false },
  { id: "s3", icon: Desktop, name: "Edge on Windows", where: "Abuja · 5 days ago", current: false },
];

const emailItems = [
  { key: "review", label: "Posts ready for your review", description: "Also set in How you review, in Control.", default: true },
  { key: "updates", label: "Weekly and monthly updates", default: true },
  { key: "tasks", label: "Quick tasks for you", default: true },
  { key: "tips", label: "News from Bluecut", description: "Once a month at most.", default: false },
];

/** C14 Account: profile, time zone, sign-in and two-step, sessions, notifications (C18), your data, delete. */
export default function AccountPage() {
  const { user, client, contract, invoices } = useMyClient();
  const confirm = useConfirm();
  const { run, pending } = useTask();
  const router = useRouter();
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [zone, setZone] = useState(user?.timeZone ?? "Africa/Lagos");
  const [linkedin, setLinkedin] = useState(user?.linkedinUrl ?? "");
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
          className="flex flex-col gap-4"
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
          <Select label="Time zone" info="We show call times and due times in this time zone." value={zone} onChange={(e) => setZone(e.target.value)}>
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

      <Card title="LinkedIn" info="Your name and photo come from your LinkedIn profile. Update pulls the latest; we only read what is on your public profile.">
        <div className="flex flex-col gap-4">
          {user.linkedinUrl ? (
            <>
              <div className="flex flex-col gap-1">
                <span className="text-body-sm text-secondary">Your profile</span>
                <a href={user.linkedinUrl} target="_blank" rel="noreferrer" className={`break-all ${textActionClass}`}>
                  {user.linkedinUrl}
                </a>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" className="self-start" loading={pending("sync")} onClick={() => run("sync", () => act.syncLinkedIn(user.id), "Profile updated from LinkedIn.")}>
                  Update my profile
                </Button>
                <Button variant="remove" className="self-start" loading={pending("unlink")} onClick={() => run("unlink", () => act.saveProfile(user.id, { linkedinUrl: "" }), "LinkedIn link removed.")}>
                  Remove link
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-body-sm text-secondary">Add your LinkedIn profile link so we keep your name and photo up to date.</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <Input label="LinkedIn profile link" type="url" placeholder="https://www.linkedin.com/in/your-name" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
                </div>
                <Button
                  variant="secondary"
                  disabled={!linkedin.trim()}
                  loading={pending("linkedin")}
                  onClick={() => run("linkedin", async () => { await act.saveProfile(user.id, { linkedinUrl: linkedin.trim() }); await act.syncLinkedIn(user.id); }, "LinkedIn link saved and your profile updated.")}
                >
                  Save and update
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>

      <Card title="Sign-in and security">
        <div className="flex flex-col gap-6">
          {/* One row per setting: what it is on the left, its action on the right, a line between rows. */}
          <div className="flex flex-col divide-y divide-border">
            <dl className="flex flex-col gap-1 pb-4">
              <dt className="text-body-sm text-secondary">Email</dt>
              <dd className="break-all text-body font-medium text-primary">{user.email}</dd>
            </dl>
            <div className="flex items-center justify-between gap-4 py-4">
              <dl className="flex flex-col gap-1">
                <dt className="text-body-sm text-secondary">Password</dt>
                <dd className="text-body font-medium text-primary" aria-label="Hidden">
                  ••••••••
                </dd>
              </dl>
              <Link href="/reset" className={`shrink-0 ${textActionClass}`}>
                Change password
              </Link>
            </div>
            <div className="pt-4">
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
            </div>
          </div>

          <section aria-label="Where you are signed in" className="flex flex-col gap-3 border-t border-border pt-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-body font-semibold text-primary">Where you are signed in</h3>
              {sessions.length > 1 && (
                <TextButton
                  onClick={() =>
                    confirm({
                      title: "Sign out everywhere else?",
                      body: `${sessions.length - 1} other devices will be signed out. This device stays signed in.`,
                      confirmLabel: "Sign out others",
                      action: () => act.signOutSessions(user.id, sessions.filter((x) => !x.current).map((x) => x.id)),
                      success: "Signed out of all other devices.",
                    })
                  }
                >
                  Sign out everywhere else
                </TextButton>
              )}
            </div>
            <ul className="flex flex-col rounded-md border border-border">
              {sessions.map((s) => (
                <li key={s.id} className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-b-0">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700">
                    <s.icon className="size-5" aria-hidden />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-body font-medium text-primary">{s.name}</span>
                    <span className="text-body-sm text-secondary">{s.where}</span>
                  </span>
                  {s.current ? (
                    <Badge status="success">This device</Badge>
                  ) : (
                    <TextButton
                      onClick={() =>
                        confirm({
                          title: `Sign out of ${s.name}?`,
                          body: "Anyone using that device will need your password to get back in.",
                          confirmLabel: "Sign out",
                          action: () => act.signOutSessions(user.id, [s.id]),
                          success: `Signed out of ${s.name}.`,
                        })
                      }
                    >
                      Sign out
                    </TextButton>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </Card>

      <NotifySettings user={user} client={client}>
        <ul className="flex flex-col">
          {emailItems.map((i) => (
            <li key={i.key} className="border-b border-border py-4 first:pt-0 last:border-b-0 last:pb-0">
              <Switch
                label={i.label}
                description={pending(i.key) ? "Saving" : i.description}
                checked={emailOn(i.key, i.default)}
                disabled={pending(i.key)}
                onChange={(v) => run(i.key, () => act.setPref(user.id, `email.${i.key}`, v), `${v ? "We will tell you about" : "We will no longer message you about"} ${i.label.toLowerCase()}.`)}
              />
            </li>
          ))}
        </ul>
      </NotifySettings>

      <Card title="Your data" info="Download everything we hold about you: your strategy, posts, brand files, messages and activity.">
        <div className="flex flex-col gap-4">
          <Button variant="secondary" className="self-start" loading={pending("data")} onClick={() => run("data", () => act.requestDataExport(user.id), "Your download is ready. We emailed you a link.")}>
            {pending("data") ? "Preparing" : "Download my data"}
          </Button>
        </div>
      </Card>

      <Card
        title="Delete your account"
        info={`This removes your account and deletes your data. We keep only invoices and payment records, as the law requires.${activeContract ? " Your contract is cancelled first, with any refund due." : ""}`}
      >
        <Button variant="remove" className="self-start" onClick={() => setDeleting(true)}>
          Delete my account
        </Button>
      </Card>

      <Dialog open={deleting} onClose={() => setDeleting(false)} title="Delete your account?">
        {/* Warnings first, right under the title, then the details, then the buttons on the right. */}
        <Banner tone="danger">You cannot undo this. To come back, you would sign up and start again.</Banner>
        {activeContract && terms && (
          <Banner tone="warning" title="This cancels your contract first">
            {terms.explain} Refund: {money(terms.refundCents)}.
          </Banner>
        )}
        <p className="text-body text-secondary">Your strategy, posts, brand files and messages are deleted. Download your data first if you want to keep it.</p>
        <Input label='Type "delete" to confirm' value={confirmText} onChange={(e) => setConfirmText(e.target.value)} />
        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="cancel" onClick={() => setDeleting(false)}>
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
