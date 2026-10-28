"use client";

import { useState } from "react";
import { Avatar, Banner, Breadcrumbs, Button, Dialog, EmptyState, ProgressBar, Segmented, Skeleton, Switch, Tabs, Textarea, ToastProvider, useToast } from "@/components/ui";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-display-xl text-primary">{title}</h2>
      {children}
    </section>
  );
}

function Demo() {
  const [tab, setTab] = useState<"review" | "upcoming" | "live">("review");
  const [on, setOn] = useState(true);
  const [view, setView] = useState<"feed" | "board">("feed");
  const [open, setOpen] = useState(false);
  const toast = useToast();

  return (
    <>
      <Section title="Avatars">
        <div className="flex items-center gap-3">
          <Avatar name="Chidi Okeke" size="sm" />
          <Avatar name="Chidi Okeke" />
          <Avatar name="Chidi Okeke" size="lg" />
          <Avatar name="Chidi Okeke" size="xl" />
        </div>
      </Section>

      <Section title="Switch">
        <div className="max-w-md">
          <Switch checked={on} onChange={setOn} label="Post for me" description="We post approved content to your profile." />
        </div>
      </Section>

      <Section title="Segmented">
        <Segmented label="View" value={view} onChange={setView} options={[{ value: "feed", label: "Feed" }, { value: "board", label: "Board" }]} />
      </Section>

      <Section title="Breadcrumbs">
        <Breadcrumbs items={[{ label: "Clients", href: "#" }, { label: "Sarah Mensah", href: "#" }, { label: "Content" }]} />
      </Section>

      <Section title="Banners">
        <div className="flex flex-col gap-3">
          <Banner title="Your first 2 weeks are free">Your contract starts on 10 Nov.</Banner>
          <Banner tone="warning" title="Your account is paused" action={<Button>Pay now</Button>}>
            Pay to pick up where you left off.
          </Banner>
          <Banner tone="danger" title="Your LinkedIn connection expired">Reconnect so we can keep posting.</Banner>
        </div>
      </Section>

      <Section title="Dialog and toast">
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => setOpen(true)}>Open dialog</Button>
          <Button variant="secondary" onClick={() => toast("Your changes are saved.")}>Show toast</Button>
        </div>
        <Dialog open={open} onClose={() => setOpen(false)} title="Take this post down?">
          <p className="text-body text-secondary">It will be removed from LinkedIn straight away.</p>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setOpen(false)}>Keep it</Button>
            <Button variant="danger" onClick={() => setOpen(false)}>Take it down</Button>
          </div>
        </Dialog>
      </Section>

      <Section title="Tabs">
        <Tabs
          label="Example tabs"
          value={tab}
          onChange={setTab}
          tabs={[
            { value: "review", label: "To review", count: 3 },
            { value: "upcoming", label: "Coming up" },
            { value: "live", label: "Live" },
          ]}
        />
      </Section>

      <Section title="Text area and progress">
        <Textarea label="What would you like changed?" help="We remember your preferences for future posts." />
        <div className="flex flex-col gap-2">
          <span className="flex justify-between text-body-sm">
            <span className="text-primary">Comments</span>
            <span className="text-secondary">11 of 15</span>
          </span>
          <ProgressBar value={11} max={15} />
        </div>
      </Section>

      <Section title="Empty state and loading">
        <EmptyState title="No posts yet">Your first posts arrive after your strategy call.</EmptyState>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </Section>
    </>
  );
}

export function InteractiveComponents() {
  return (
    <ToastProvider>
      <Demo />
    </ToastProvider>
  );
}
