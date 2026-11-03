"use client";

import { Buildings, CheckCircle, Clock, Key, Lock, ShieldCheck } from "@phosphor-icons/react";
import { useState } from "react";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { Badge, Banner, Button, buttonClass, Card, Pill, Row, Rows, RowText, TextButton, TextLink, useConfirm, useTask } from "@/components/ui";
import { agoIn, dayIn, money, plural } from "@/lib/format";
import { act, useData, useMyClient } from "@/lib/mock";

/** C2: company Page delegation through LinkedIn's official Page admin roles (never a login). */
function PageCard() {
  const { client } = useMyClient();
  const { run, pending } = useTask();
  const confirm = useConfirm();
  const db = useData();
  const fs = client?.fullService;
  if (!client || !fs) return null;
  const price = money(db.settings.pageManagementCents);

  if (!fs.pageManagement) {
    return (
      <Card title="Company Page" action={<Pill>{price} a month</Pill>}>
        <div className="flex flex-col gap-4">
          <p className="text-body-sm text-secondary">Let us run your company Page too: posts, comments and replies. You add us as an admin on LinkedIn, so we never need your login.</p>
          <Button className="self-start" variant="secondary" loading={pending("add")} onClick={() => run("add", () => act.setPageManagement(client.id, true), "Company Page management added. Next, add us as a Page admin.")}>
            Add Page management
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Company Page" action={<Badge status={fs.pageGrant === "granted" ? "success" : "warning"}>{fs.pageGrant === "granted" ? "Managed by your team" : "Waiting for admin access"}</Badge>}>
      <div className="flex flex-col gap-4">
        {fs.pageGrant === "granted" ? (
          <Banner tone="success">
            <span className="flex items-start gap-2">
              <Buildings className="mt-0.5 size-4 shrink-0 text-success" aria-hidden /> Your team manages your Page as an official admin. Remove the access any time from your Page settings on LinkedIn.
            </span>
          </Banner>
        ) : (
          <Banner tone="warning" title="Add us as a Page admin">
            On LinkedIn, open your Page, go to Settings, then Manage admins, and add Bluecut Socials as a Content admin. Then confirm here. No password is ever shared.
          </Banner>
        )}
        <div className="flex flex-wrap gap-3">
          {fs.pageGrant !== "granted" && (
            <Button loading={pending("grant")} onClick={() => run("grant", () => act.confirmPageGrant(client.id), "Thank you. Your team can manage your Page now.")}>
              I have added them
            </Button>
          )}
          <Button
            variant="remove"
            loading={pending("remove")}
            onClick={() =>
              confirm({
                title: "Remove company Page management?",
                body: "We will stop managing your Page. You can keep managing it yourself on LinkedIn.",
                confirmLabel: "Remove",
                tone: "danger",
                action: () => act.setPageManagement(client.id, false),
                success: "Company Page management removed.",
              })
            }
          >
            Remove Page management
          </Button>
        </div>
      </div>
    </Card>
  );
}

const included = [
  "We write, schedule and publish everything you approve.",
  "We research people and conversations and handle the outreach for you.",
  "We reply to comments and messages on your company Page.",
  "You approve the plan and the posts. We take the day-to-day off your plate.",
];

/** C20: the permission contract, read-only. On full-service the manager follows it exactly and cannot change it. */
function Contract() {
  const { client, brand } = useMyClient();
  if (!client) return null;
  const p = client.permissions;
  const offLimits = brand?.offLimits ?? [];
  const perms: [string, boolean][] = [
    ["Post for me", p.post],
    ["Manage my company Page", p.companyPage],
    ["Reactions, comments, reposts and follows", p.engage],
    ["Connection requests and messages", p.connectionDrafts],
    ["Profile updates", p.profileDrafts],
  ];
  return (
    <Card title="Your permission contract" action={<TextLink href="/control">Change</TextLink>}>
      <div className="flex flex-col gap-4">
        <Banner tone="neutral">
          <span className="flex items-start gap-2">
            <Lock className="mt-0.5 size-4 shrink-0 text-secondary" aria-hidden />
            Only you can change these. Your account team follows them exactly and cannot change them for you.
          </span>
        </Banner>
        <section className="flex flex-col gap-2">
          <h3 className="text-body font-semibold text-primary">What you let us do</h3>
          <Rows>
            {perms.map(([label, on]) => (
              <Row key={label}>
                <RowText title={label} />
                <Badge status={on ? "success" : "neutral"}>{on ? "Allowed" : "Not allowed"}</Badge>
              </Row>
            ))}
          </Rows>
        </section>
        <section className="flex flex-col gap-2">
          <h3 className="text-body font-semibold text-primary">Off limits</h3>
          {offLimits.length ? (
            <Rows>
              {offLimits.map((o) => (
                <Row key={o.id}>
                  <RowText title={o.text} sub={o.kind[0].toUpperCase() + o.kind.slice(1)} />
                </Row>
              ))}
            </Rows>
          ) : (
            <p className="text-body-sm text-secondary">
              Nothing yet. Add anything we should never touch in <TextLink href="/brand">Your brand</TextLink>.
            </p>
          )}
        </section>
      </div>
    </Card>
  );
}

/** D: the client's delegated-access status, the per-session approval prompt, and the refresh notice. */
function DelegatedAccessCard() {
  const { client } = useMyClient();
  const { run, pending } = useTask();
  const confirm = useConfirm();
  const fs = client?.fullService;
  const a = fs?.access;
  if (!client || !fs) return null;
  const ready = a?.credentials === "set" && a.twoFactor;
  const session = a?.session;

  return (
    <Card title="Delegated access" action={ready ? <Badge status={a?.needsRefresh ? "warning" : "success"}>{a?.needsRefresh ? "Needs refresh" : "Ready"}</Badge> : <Badge status="neutral">Not set up</Badge>}>
      <div className="flex flex-col gap-4">
        {!ready ? (
          <>
            <Banner tone="info">
              <span className="flex items-start gap-2">
                <Key className="mt-0.5 size-4 shrink-0 text-primary-600" aria-hidden /> Set up secure access so your team can manage your LinkedIn. You keep your login in a vault we never read, and approve every sign-in on your phone.
              </span>
            </Banner>
            <TextLink href="/full-service/access" className={`self-start ${buttonClass("primary")}`}>
              Set up delegated access
            </TextLink>
          </>
        ) : session?.state === "requested" ? (
          <>
            <Banner tone="warning" title={`${session.managerName} wants to log in`}>
              {session.note ? <>&ldquo;{session.note}&rdquo; </> : null}Approve it on your phone (LinkedIn will prompt you), or approve here. We only sign in after you say yes.
            </Banner>
            <div className="flex flex-wrap gap-3">
              <Button loading={pending("approve")} onClick={() => run("approve", () => act.approveSession(client.id), "Approved. Your team can sign in now.")}>
                Approve this sign-in
              </Button>
              <Button variant="remove" loading={pending("decline")} onClick={() => run("decline", () => act.declineSession(client.id), "Declined. No one signed in.")}>
                Decline
              </Button>
            </div>
          </>
        ) : session?.state === "active" ? (
          <Banner tone="info" title={`${session.managerName} is in a session now`}>
            Working on your account, with the session recorded. You can stop everything any time with Pause access above.
          </Banner>
        ) : (
          <Banner tone="success">
            <span className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden /> Secure access is on. Your team notifies you and you approve on your phone before every sign-in. Your password stays in the vault; we never read it.
            </span>
          </Banner>
        )}

        {ready && a?.needsRefresh && (
          <Button variant="secondary" className="self-start" loading={pending("refresh")} onClick={() => run("refresh", () => act.refreshDelegatedSession(client.id), "Secure session refreshed. Your team stays connected.")}>
            Refresh secure session
          </Button>
        )}

        {ready && (
          <TextButton
            onClick={() =>
              confirm({
                title: "Remove your stored login?",
                body: "Your team can no longer sign in until you set it up again. Full-service stays on; we just lose access to your profile.",
                confirmLabel: "Remove login",
                tone: "danger",
                action: () => act.setDelegatedCredentials(client.id, false),
                success: "Stored login removed.",
              })
            }
            className="self-start"
          >
            Remove stored login
          </TextButton>
        )}
      </div>
    </Card>
  );
}

/** C20 Full-service hub: activate, or manage access, the Page, the permission contract and the team's activity. */
export function FullServiceHub() {
  const { client, accessLog } = useMyClient();
  const db = useData();
  const confirm = useConfirm();
  const { run, pending } = useTask();
  const [pageOn, setPageOn] = useState(true);
  if (!client) return null;
  const fs = client.fullService;
  const fullServicePrice = money(db.settings.fullServiceCents);
  const pagePrice = money(db.settings.pageManagementCents);

  // Not on full-service: explain and turn on (also reachable for self-serve clients who want to upgrade).
  if (client.service !== "full-service" || !fs) {
    const total = db.settings.fullServiceCents + (pageOn ? db.settings.pageManagementCents : 0);
    return (
      <Columns {...rails.clientSettings}>
        <Card title="Full-service" action={<Pill>From {fullServicePrice} a month</Pill>}>
          <div className="flex flex-col gap-4">
            <Banner tone="info">
              <span className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary-600" aria-hidden /> Hand the work to us. You keep your login, your settings and full control. We never see your password.
              </span>
            </Banner>
            <section className="flex flex-col gap-2">
              <h3 className="text-body font-semibold text-primary">What is included</h3>
              <ul className="flex flex-col gap-2">
                {included.map((i) => (
                  <li key={i} className="flex items-start gap-2 text-body-sm text-primary">
                    <CheckCircle className="mt-0.5 size-4 shrink-0 text-success" aria-hidden /> {i}
                  </li>
                ))}
              </ul>
            </section>
            <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-4">
              <input type="checkbox" checked={pageOn} onChange={(e) => setPageOn(e.target.checked)} className="mt-1 size-4 shrink-0 accent-primary-600 focus-visible:focus-ring" />
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="flex flex-wrap items-baseline justify-between gap-x-3 text-body font-medium text-primary">
                  Manage my company Page too <span className="text-body-sm text-primary-700">+{pagePrice} a month</span>
                </span>
                <span className="text-body-sm text-secondary">Posts, comments and replies on your Page. You add us as an admin on LinkedIn.</span>
              </span>
            </label>
            <div className="flex flex-col gap-3 rounded-md bg-neutral-25 p-4">
              <span className="flex items-center justify-between text-body font-medium text-primary">
                Full-service <span>{fullServicePrice} a month</span>
              </span>
              {pageOn && (
                <span className="flex items-center justify-between text-body-sm text-secondary">
                  Company Page management <span>{pagePrice} a month</span>
                </span>
              )}
              <span className="flex items-center justify-between border-t border-border pt-3 text-body font-semibold text-primary">
                On top of your plan <span>{money(total)} a month</span>
              </span>
            </div>
            <Button
              className="self-start"
              loading={pending("activate")}
              onClick={() =>
                confirm({
                  title: "Turn on full-service?",
                  body: `We take on the day-to-day. This adds ${money(total)} a month to your plan${pageOn ? ", including company Page management" : ""}. You keep full control and can pause or end this any time.`,
                  confirmLabel: "Turn on full-service",
                  action: () => act.activateFullService(client.id, pageOn),
                  success: "Full-service is on. Next, set up your access.",
                })
              }
            >
              Turn on full-service
            </Button>
          </div>
        </Card>
      </Columns>
    );
  }

  // On full-service: manage it.
  const monthly = db.settings.fullServiceCents + (fs.pageManagement ? db.settings.pageManagementCents : 0);
  return (
    <Columns {...rails.clientSettings}>
      <Card title="Full-service" action={fs.paused ? <Badge status="warning">Paused</Badge> : <Badge status="success">Active</Badge>}>
        <div className="flex flex-col gap-4">
          {fs.paused ? (
            <Banner tone="warning" title="Your team's access is paused">We have stopped all work on your account. Resume when you are ready and we will pick up where we left off.</Banner>
          ) : (
            <Banner tone="success">
              <span className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden /> Your account team is managing your LinkedIn. On since {dayIn(fs.since)}.
              </span>
            </Banner>
          )}
          <div className="flex flex-wrap gap-3">
            {fs.paused ? (
              <Button loading={pending("resume")} onClick={() => run("resume", () => act.resumeFullServiceAccess(client.id), "Access resumed. Your team can work again.")}>
                Resume access
              </Button>
            ) : (
              <Button
                variant="secondary"
                loading={pending("pause")}
                onClick={() =>
                  confirm({
                    title: "Pause your team's access?",
                    body: "We stop all work on your account at once, until you resume. Nothing is lost.",
                    confirmLabel: "Pause access",
                    action: () => act.pauseFullServiceAccess(client.id),
                    success: "Access paused. Your team has stopped.",
                  })
                }
              >
                Pause access
              </Button>
            )}
            <Button
              variant="remove"
              loading={pending("end")}
              onClick={() =>
                confirm({
                  title: "End full-service?",
                  body: "You go back to self-serve: you do the LinkedIn actions yourself, with us preparing them.",
                  warning: "Your team stops managing your account, your stored login is cleared, and any Page admin access is removed. You can turn full-service back on later.",
                  confirmLabel: "End full-service",
                  tone: "danger",
                  action: () => act.endFullService(client.id),
                  success: "Full-service ended. You are back on self-serve.",
                })
              }
            >
              End full-service
            </Button>
          </div>
          <p className="text-body-sm text-secondary">
            {money(monthly)} a month on top of your plan{fs.pageManagement ? ", including company Page management" : ""}. See <TextLink href="/contract">Contract</TextLink>.
          </p>
        </div>
      </Card>

      <DelegatedAccessCard />

      <PageCard />

      <Contract />

      <Card title="What your team has done" action={accessLog.length > 0 && <Pill>{plural(accessLog.length, "session")}</Pill>}>
        {accessLog.length ? (
          <Rows>
            {accessLog.map((a) => (
              <Row key={a.id}>
                <span className="flex min-w-0 flex-1 items-start gap-3">
                  <Clock className="mt-0.5 size-4 shrink-0 text-primary-600" aria-hidden />
                  <RowText title={a.action} sub={`${a.who} · ${agoIn(a.at)}${a.minutes ? ` · ${a.minutes} min` : ""}`} />
                </span>
              </Row>
            ))}
          </Rows>
        ) : (
          <p className="text-body-sm text-secondary">Every time your team works on your account, it shows here: who, when and what they did.</p>
        )}
      </Card>
    </Columns>
  );
}
