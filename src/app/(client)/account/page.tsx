"use client";

import { Desktop, DeviceMobile } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import { pullOutTerms } from "@/components/client/contract";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { Avatar, Banner, Button, Card, Dialog, Input, Switch, useToast } from "@/components/ui";
import { fullName, money } from "@/lib/format";
import { useMyClient } from "@/lib/mock";

const zones = ["Africa/Lagos", "Africa/Accra", "Africa/Nairobi", "Africa/Johannesburg", "Europe/London", "America/Toronto", "America/New_York"];

/** C14 Account: profile, time zone, sign-in and two-step, sessions, email notifications, your data, delete. */
export default function AccountPage() {
  const { user, client, contract, invoices } = useMyClient();
  const toast = useToast();
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [zone, setZone] = useState(user?.timeZone ?? "Africa/Lagos");
  const [twoStep, setTwoStep] = useState(user?.twoStep ?? false);
  const [emails, setEmails] = useState({ review: true, updates: true, tasks: true, tips: false });
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  if (!user || !client) return null;

  const activeContract = contract && !["cancelled", "completed"].includes(contract.status);
  const terms = contract ? pullOutTerms(contract, invoices) : null;

  return (
    <Columns {...rails.clientSettings}>
      <Card title="Profile">
        <form
          className="flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            toast("Profile saved.");
          }}
        >
          <div className="flex items-center gap-4">
            <Avatar name={fullName(user)} size="xl" />
            <Button variant="secondary">Change photo</Button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <Input label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <label className="flex flex-col gap-2">
            <span className="text-body-sm font-medium text-primary">Time zone</span>
            <select value={zone} onChange={(e) => setZone(e.target.value)} className="min-h-11 rounded-sm border border-border-strong bg-card px-4 text-body text-primary focus-visible:border-primary-600 focus-visible:focus-ring">
              {zones.map((z) => (
                <option key={z} value={z}>
                  {z.replace("_", " ").replace("/", ", ")}
                </option>
              ))}
            </select>
            <span className="text-body-sm text-secondary">We show call times and due times in this time zone.</span>
          </label>
          <Button type="submit" className="self-start">
            Save
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
            description="Ask for a code from your authenticator app when you sign in. Recommended."
            checked={twoStep}
            onChange={(v) => {
              setTwoStep(v);
              toast(v ? "Two-step sign-in is on." : "Two-step sign-in is off.");
            }}
          />
          <div className="flex flex-col gap-3">
            <span className="text-body-sm font-medium text-primary">Where you are signed in</span>
            <ul className="flex flex-col rounded-md border border-border">
              {[
                { icon: Desktop, name: "Chrome on Mac", where: "Lagos, now", current: true },
                { icon: DeviceMobile, name: "Safari on iPhone", where: "Lagos, 2 hours ago", current: false },
              ].map((s) => (
                <li key={s.name} className="flex items-center gap-3 border-b border-border p-4 last:border-b-0">
                  <s.icon className="size-6 text-secondary" aria-hidden />
                  <span className="flex flex-1 flex-col">
                    <span className="text-body-sm font-medium text-primary">{s.name}</span>
                    <span className="text-caption text-secondary">{s.where}</span>
                  </span>
                  {s.current ? (
                    <span className="text-caption text-success">This device</span>
                  ) : (
                    <button type="button" onClick={() => toast("Signed out of Safari on iPhone.")} className="rounded-sm text-body-sm font-medium text-primary-600 hover:underline focus-visible:focus-ring">
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
          {[
            { key: "review" as const, label: "Posts ready for your review", description: "Also set in How you review, in Control." },
            { key: "updates" as const, label: "Weekly and monthly updates" },
            { key: "tasks" as const, label: "Quick tasks for you" },
            { key: "tips" as const, label: "News from Bluecut", description: "Once a month at most." },
          ].map((i) => (
            <li key={i.key} className="border-b border-border py-4 first:pt-0 last:border-b-0 last:pb-0">
              <Switch label={i.label} description={i.description} checked={emails[i.key]} onChange={(v) => setEmails({ ...emails, [i.key]: v })} />
            </li>
          ))}
        </ul>
        <p className="pt-4 text-caption text-secondary">Payment reminders and account notices are always sent.</p>
      </Card>

      <Card title="Your data">
        <div className="flex flex-col gap-3">
          <p className="text-body-sm text-secondary">Download everything we hold about you: your strategy, posts, brand files, messages and activity.</p>
          <Button variant="secondary" className="self-start" onClick={() => toast("We are preparing your download. We will email you a link within an hour.")}>
            Download my data
          </Button>
        </div>
      </Card>

      <Card title="Delete your account">
        <div className="flex flex-col gap-3">
          <p className="text-body-sm text-secondary">
            This removes your account and deletes your data. We keep only invoices and payment records, as the law requires.
            {activeContract ? " Your contract is cancelled first, with any refund due." : ""}
          </p>
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
        <p className="text-body text-secondary">Your strategy, posts, brand files and messages are deleted and cannot be brought back. Download your data first if you want to keep it.</p>
        <Input label='Type "delete" to confirm' value={confirmText} onChange={(e) => setConfirmText(e.target.value)} />
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setDeleting(false)}>
            Keep my account
          </Button>
          <Button
            variant="danger"
            disabled={confirmText.trim().toLowerCase() !== "delete"}
            onClick={() => {
              setDeleting(false);
              toast("Demo only: in the live app your account would now be deleted.");
            }}
          >
            Delete my account
          </Button>
        </div>
      </Dialog>
    </Columns>
  );
}
