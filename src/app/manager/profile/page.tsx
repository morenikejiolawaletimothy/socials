"use client";

import { CalendarBlank } from "@phosphor-icons/react";
import { useState } from "react";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { NotifySettings } from "@/components/account/NotifySettings";
import { PhotoField } from "@/components/account/PhotoField";
import { Badge, Button, Card, Input, Row, Rows, RowText, Select, Switch, Textarea, Tile, TileIcon, useConfirm, useTask } from "@/components/ui";
import { timeZones, zoneLabel } from "@/lib/timezones";
import { fullName } from "@/lib/format";
import { act, useMyManager } from "@/lib/mock";

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
  const alertOn = (key: string, fallback: boolean) => user.prefs?.[`alert.${key}`] ?? fallback;
  const dirty = intro !== manager.intro || firstName !== user.firstName || lastName !== user.lastName || zone !== user.timeZone;

  return (
    <Columns {...rails.managerSettings}>
      <Card title="Profile">
        <form
          className="flex flex-col gap-6"
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
          <Select label="Time zone" help="Your call slots and due times use this time zone." value={zone} onChange={(e) => setZone(e.target.value)}>
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
        <Rows>
          <Row>
            <RowText title="Email" sub={user.email} />
          </Row>
          <Row>
            <RowText title="Two-step sign-in" sub="Required for everyone who works on client accounts." />
            <Badge status="success">On</Badge>
          </Row>
        </Rows>
      </Card>

      <Card title="Google Calendar" action={<Badge status={calendar ? "success" : "neutral"}>{calendar ? "Connected" : "Not connected"}</Badge>}>
        <Tile>
        <div className="flex items-center gap-3">
          <TileIcon round>
            <CalendarBlank className="size-6" aria-hidden />
          </TileIcon>
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-body font-medium text-primary">{calendar ? "Your calendar is connected" : "Connect your calendar"}</span>
            <span className="text-body-sm text-secondary">Booked calls appear in your calendar, and busy times close your slots.</span>
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
        </div>
        </Tile>
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
