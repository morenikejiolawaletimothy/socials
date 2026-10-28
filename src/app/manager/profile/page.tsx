"use client";

import { CalendarBlank } from "@phosphor-icons/react";
import { useState } from "react";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { Avatar, Badge, Button, Card, Input, Switch, Textarea, useToast } from "@/components/ui";
import { fullName } from "@/lib/format";
import { useMyManager } from "@/lib/mock";

/** M10 Profile: photo and intro (shown to clients when booking), time zone, two-step, notifications, Google Calendar. */
export default function ManagerProfile() {
  const { manager, user } = useMyManager();
  const toast = useToast();
  const [intro, setIntro] = useState(manager?.intro ?? "");
  const [notify, setNotify] = useState({ urgent: true, reviews: true, moments: true, digest: false });
  if (!user || !manager) return null;

  return (
    <Columns {...rails.managerSettings}>
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
            <Input label="First name" defaultValue={user.firstName} />
            <Input label="Last name" defaultValue={user.lastName} />
          </div>
          <Textarea label="Short intro" value={intro} onChange={(e) => setIntro(e.target.value)} help="Clients see this when they book their calls with you." />
          <Input label="Time zone" defaultValue={user.timeZone.replace("_", " ")} />
          <Button type="submit" className="self-start">
            Save
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
            <span className="text-body font-medium text-primary">Connected</span>
            <span className="text-body-sm text-secondary">Booked calls appear in your calendar, and busy times close your slots.</span>
          </span>
          <button type="button" onClick={() => toast("Google Calendar disconnected.")} className="rounded-sm text-body-sm font-medium text-primary-600 hover:underline focus-visible:focus-ring">
            Disconnect
          </button>
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
              <Switch label={i.label} description={i.description} checked={notify[i.key]} disabled={i.key === "urgent"} onChange={(v) => setNotify({ ...notify, [i.key]: v })} />
            </li>
          ))}
        </ul>
      </Card>
    </Columns>
  );
}
