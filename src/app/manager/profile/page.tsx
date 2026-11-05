"use client";

import { CalendarBlank, Desktop, DeviceMobile } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { NotifySettings } from "@/components/account/NotifySettings";
import { PhotoField } from "@/components/account/PhotoField";
import { Badge, Button, Card, Input, Select, Switch, Textarea, TextButton, textActionClass, useConfirm, useTask } from "@/components/ui";
import { timeZones, zoneLabel } from "@/lib/timezones";
import { fullName } from "@/lib/format";
import { act, useMyManager } from "@/lib/mock";

const allSessions = [
  { id: "s1", icon: Desktop, name: "Chrome on Mac", where: "Lagos · now", current: true },
  { id: "s2", icon: DeviceMobile, name: "Safari on iPhone", where: "Lagos · 3 hours ago", current: false },
];

/** M10 Profile: photo and intro (shown to clients when booking), time zone, two-step, notifications, Google Calendar. */
export default function ManagerProfile() {
  const { manager, user } = useMyManager();
  const confirm = useConfirm();
  const { run, pending } = useTask();
  const [intro, setIntro] = useState(manager?.intro ?? "");
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [zone, setZone] = useState(user?.timeZone ?? "Africa/Lagos");
  const [introError, setIntroError] = useState<string>();
  if (!user || !manager) return null;
  const calendar = manager.calendarConnected ?? true;
  const sessions = allSessions.filter((x) => !user.signedOut?.includes(x.id));
  const alertOn = (key: string, fallback: boolean) => user.prefs?.[`alert.${key}`] ?? fallback;
  const dirty = intro !== manager.intro || firstName !== user.firstName || lastName !== user.lastName || zone !== user.timeZone;

  return (
    <Columns {...rails.managerSettings}>
      <Card title="Profile">
        <form
          noValidate
          className="flex flex-col gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!firstName.trim()) return;
            if (intro.trim().length < 20) return setIntroError("Write a short intro (at least 20 characters). Clients see it when they book.");
            setIntroError(undefined);
            await run("profile", () => act.saveManagerProfile(manager.id, { firstName: firstName.trim(), lastName: lastName.trim(), intro: intro.trim(), timeZone: zone }), "Profile saved. Clients see your new intro when they book.");
          }}
        >
          <PhotoField user={user} name={fullName(user)} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} error={!firstName.trim() ? "Add your first name." : undefined} />
            <Input label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <Textarea label="Short intro" value={intro} onChange={(e) => setIntro(e.target.value)} help="Clients see this when they book their calls with you." error={introError} />
          <Select label="Time zone" info="Your call slots and due times use this time zone." value={zone} onChange={(e) => setZone(e.target.value)}>
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
          {/* As on the client Account page: one row per setting, its action on the right, a line between rows. */}
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
            <div className="flex items-center justify-between gap-4 pt-4">
              <dl className="flex flex-col gap-1">
                <dt className="text-body font-medium text-primary">Two-step sign-in</dt>
                <dd className="text-body-sm text-secondary">Required for everyone who works on client accounts.</dd>
              </dl>
              <Badge status="success">On</Badge>
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

      <Card
        title="Google Calendar"
        action={<Badge status={calendar ? "success" : "neutral"}>{calendar ? "Connected" : "Not connected"}</Badge>}
        info="Booked calls appear in your calendar, and busy times close your slots."
      >
        <ul className="flex flex-col rounded-md border border-border">
          <li className="flex items-center gap-4 px-4 py-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700">
              <CalendarBlank className="size-5" aria-hidden />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-body font-medium text-primary">{calendar ? "Your calendar is connected" : "Connect your calendar"}</span>
              <span className="break-all text-body-sm text-secondary">{calendar ? user.email : "So clients cannot book when you are busy."}</span>
            </span>
            {calendar ? (
              <Button
                variant="remove"
                size="sm"
                onClick={() =>
                  confirm({
                    title: "Disconnect Google Calendar?",
                    body: "New bookings will not appear in your calendar, and busy times will not close your slots.",
                    warning: "Clients could book times when you are busy.",
                    confirmLabel: "Disconnect",
                    tone: "danger",
                    action: () => act.setCalendar(manager.id, false),
                    success: "Google Calendar disconnected.",
                  })
                }
              >
                Disconnect
              </Button>
            ) : (
              <Button variant="secondary" size="sm" loading={pending("cal")} onClick={() => run("cal", () => act.setCalendar(manager.id, true), "Google Calendar connected.")}>
                Connect
              </Button>
            )}
          </li>
        </ul>
      </Card>

      <NotifySettings user={user}>
        <ul className="flex flex-col">
          {[
            { key: "urgent", label: "Urgent: fix requests, take-downs, failed posts", description: "Always on, at any hour.", default: true },
            { key: "reviews", label: "Client reviews and changes", default: true },
            { key: "moments", label: "New Moments from clients", default: true },
          ].map((i) => (
            <li key={i.key} className="border-b border-border py-4 first:pt-0 last:border-b-0 last:pb-0">
              <Switch label={i.label} description={i.description} checked={alertOn(i.key, i.default)} disabled={i.key === "urgent" || pending(i.key)} onChange={(v) => run(i.key, () => act.setPref(user.id, `alert.${i.key}`, v), `${i.label.split(":")[0]}: ${v ? "on" : "off"}.`)} />
            </li>
          ))}
        </ul>
      </NotifySettings>
    </Columns>
  );
}
