"use client";

import { CalendarBlank } from "@phosphor-icons/react";
import { useState } from "react";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { Avatar, Badge, Button, Card, Input, Switch, Textarea, useConfirm, useTask } from "@/components/ui";
import { fullName } from "@/lib/format";
import { act, useMyManager } from "@/lib/mock";

/** M10 Profile: photo and intro (shown to clients when booking), time zone, two-step, notifications, Google Calendar. */
export default function ManagerProfile() {
  const { manager, user } = useMyManager();
  const confirm = useConfirm();
  const { run, pending } = useTask();
  const [intro, setIntro] = useState(manager?.intro ?? "");
  const [introError, setIntroError] = useState<string>();
  const [calendar, setCalendar] = useState(true);
  const [notify, setNotify] = useState({ urgent: true, reviews: true, moments: true, digest: false });
  if (!user || !manager) return null;

  return (
    <Columns {...rails.managerSettings}>
      <Card title="Profile">
        <form
          className="flex flex-col gap-6"
          onSubmit={async (e) => {
            e.preventDefault();
            if (intro.trim().length < 20) return setIntroError("Write a short intro (at least 20 characters). Clients see it when they book.");
            setIntroError(undefined);
            await run("profile", () => act.save(), "Profile saved. Clients see your new intro when they book.");
          }}
        >
          <div className="flex items-center gap-4">
            <Avatar name={fullName(user)} size="xl" />
            <Button variant="secondary" loading={pending("photo")} onClick={() => run("photo", () => act.save(), "Photo updated.")}>
              {pending("photo") ? "Uploading" : "Change photo"}
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="First name" defaultValue={user.firstName} />
            <Input label="Last name" defaultValue={user.lastName} />
          </div>
          <Textarea label="Short intro" value={intro} onChange={(e) => setIntro(e.target.value)} help="Clients see this when they book their calls with you." error={introError} />
          <Input label="Time zone" defaultValue={user.timeZone.replace("_", " ")} />
          <Button type="submit" className="self-start" loading={pending("profile")}>
            {pending("profile") ? "Saving" : "Save"}
          </Button>
        </form>
      </Card>

      <Card title="Sign-in and security">
        <div className="flex flex-col gap-4">
          <p className="text-body text-primary">{user.email}</p>
          <div className="flex items-center justify-between gap-3">
            <span className="flex flex-col">
              <span className="text-body font-medium text-primary">Two-step sign-in</span>
              <span className="text-body-sm text-secondary">Required for everyone who works on client accounts.</span>
            </span>
            <Badge status="success">On</Badge>
          </div>
        </div>
      </Card>

      <Card title="Google Calendar">
        <div className="flex items-center gap-3">
          <CalendarBlank className="size-8 text-primary-600" aria-hidden />
          <span className="flex flex-1 flex-col">
            <span className="text-body font-medium text-primary">{calendar ? "Connected" : "Not connected"}</span>
            <span className="text-body-sm text-secondary">Booked calls appear in your calendar, and busy times close your slots.</span>
          </span>
          {calendar ? (
            <button
              type="button"
              onClick={() =>
                confirm({
                  title: "Disconnect Google Calendar?",
                  body: "New bookings will not appear in your calendar, and busy times will not close your slots.",
                  warning: "Clients could book times when you are busy.",
                  confirmLabel: "Disconnect",
                  tone: "danger",
                  action: async () => {
                    await act.save();
                    setCalendar(false);
                  },
                  success: "Google Calendar disconnected.",
                })
              }
              className="rounded-sm text-body-sm font-medium text-primary-600 hover:underline focus-visible:focus-ring"
            >
              Disconnect
            </button>
          ) : (
            <Button variant="secondary" loading={pending("cal")} onClick={async () => { if (await run("cal", () => act.save(), "Google Calendar connected.")) setCalendar(true); }}>
              Connect
            </Button>
          )}
        </div>
      </Card>

      <Card title="Notifications">
        <ul className="flex flex-col">
          {[
            { key: "urgent" as const, label: "Urgent: fix requests, take-downs, failed posts", description: "Email and in the app, always on." },
            { key: "reviews" as const, label: "Client reviews and changes" },
            { key: "moments" as const, label: "New Moments from clients" },
            { key: "digest" as const, label: "Morning summary by email" },
          ].map((i) => (
            <li key={i.key} className="border-b border-border py-4 first:pt-0 last:border-b-0 last:pb-0">
              <Switch label={i.label} description={i.description} checked={notify[i.key]} disabled={i.key === "urgent" || pending(i.key)} onChange={async (v) => {
                  if (await run(i.key, () => act.save(), `${i.label.split(":")[0]}: ${v ? "on" : "off"}.`)) setNotify({ ...notify, [i.key]: v });
                }} />
            </li>
          ))}
        </ul>
      </Card>
    </Columns>
  );
}
