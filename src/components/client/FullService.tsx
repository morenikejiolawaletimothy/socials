"use client";

import { ChatsCircle, CheckCircle, Clock, PencilSimpleLine, UsersThree } from "@phosphor-icons/react";
import Link from "next/link";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { Badge, Banner, Button, buttonClass, Card, Pill, Row, Rows, TextLink, useConfirm, useTask } from "@/components/ui";
import { agoIn, dayIn, money, plural } from "@/lib/format";
import { act, useData, useMyClient } from "@/lib/mock";

const included = [
  { text: "We write, schedule and publish everything you approve.", icon: PencilSimpleLine },
  { text: "We research people and conversations and handle the outreach for you.", icon: UsersThree },
  { text: "We reply to comments and messages on your company Page.", icon: ChatsCircle },
  { text: "You approve the plan and the posts. We take the day-to-day off your plate.", icon: CheckCircle },
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
    <Card
      title="Your permission contract"
      action={<TextLink href="/control">Change</TextLink>}
      info="Only you can change these. Your account team follows them exactly and cannot change them for you."
    >
      <div className="flex flex-col gap-4">
        <section className="flex flex-col gap-2">
          <h3 className="text-body font-semibold text-primary">What you let us do</h3>
          <Rows>
            {perms.map(([label, on]) => (
              <Row key={label}>
                <span className="min-w-0 flex-1 text-body-sm text-secondary">{label}</span>
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
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="text-body-sm text-secondary">{o.text}</span>
                    <span className="text-caption text-secondary">{o.kind[0].toUpperCase() + o.kind.slice(1)}</span>
                  </span>
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
    <Card
      title="Delegated access"
      action={ready ? <Badge status={a?.needsRefresh ? "warning" : "success"}>{a?.needsRefresh ? "Needs refresh" : "Ready"}</Badge> : <Badge status="neutral">Not set up</Badge>}
      info={ready ? undefined : "Set up secure access so your team can manage your LinkedIn. You keep your login in a vault we never read, and approve every sign-in on your phone."}
    >
      <div className="flex flex-col gap-4">
        {!ready ? (
          <Link href="/full-service/access" className={`self-start ${buttonClass("primary")}`}>
            Set up delegated access
          </Link>
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
          <p className="text-body text-primary">
            Secure access is on. Your account manager gets in touch with you when they want to access your account, and you approve on your phone before every sign-in. Your password stays in the vault; we never read it.
          </p>
        )}

        {ready && a?.needsRefresh && (
          <Button variant="secondary" className="self-start" loading={pending("refresh")} onClick={() => run("refresh", () => act.refreshDelegatedSession(client.id), "Secure session refreshed. Your team stays connected.")}>
            Refresh secure session
          </Button>
        )}

        {ready && (
          <Button
            variant="secondary"
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
          </Button>
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
  if (!client) return null;
  const fs = client.fullService;
  const fullServicePrice = money(db.settings.fullServiceCents);

  // Not on full-service: explain and turn on (also reachable for self-serve clients who want to upgrade).
  if (client.service !== "full-service" || !fs) {
    const total = db.settings.fullServiceCents;
    return (
      <Columns {...rails.clientSettings}>
        <Card title="Full-service" action={<span className="shrink-0 whitespace-nowrap text-body font-semibold text-primary-600">From {fullServicePrice} a month</span>} info="Hand the work to us. You keep your login, your settings and full control. We never see your password.">
          {/* Sections top to bottom, each under a line: what you get, the price, then the button. */}
          <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-3" aria-labelledby="fs-included">
              <h3 id="fs-included" className="text-body font-semibold text-primary">
                What is included
              </h3>
              <ul className="flex flex-col rounded-md border border-border">
                {included.map(({ text, icon: Icon }) => (
                  <li key={text} className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-b-0">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <span className="text-body-sm text-primary">{text}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="flex flex-col gap-3 border-t border-border pt-6" aria-labelledby="fs-price">
              <h3 id="fs-price" className="text-body font-semibold text-primary">
                What you pay
              </h3>
              <dl className="flex flex-col overflow-hidden rounded-md border border-border">
                <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
                  <dt className="text-body-sm text-secondary">Full-service</dt>
                  <dd className="text-body-sm font-medium text-primary">{fullServicePrice} a month</dd>
                </div>
                <div className="flex items-center justify-between gap-4 bg-neutral-25 px-4 py-3">
                  <dt className="text-body font-semibold text-primary">On top of your plan</dt>
                  <dd className="text-body font-semibold text-primary">{money(total)} a month</dd>
                </div>
              </dl>
            </section>

            <div className="border-t border-border pt-6">
              <Button
                loading={pending("activate")}
                onClick={() =>
                  confirm({
                    title: "Turn on full-service?",
                    body: `We take on the day-to-day. This adds ${money(total)} a month to your plan. You keep full control and can pause or end this any time.`,
                    confirmLabel: "Turn on full-service",
                    action: () => act.activateFullService(client.id),
                    success: "Full-service is on. Next, set up your access.",
                  })
                }
              >
                Turn on full-service
              </Button>
            </div>
          </div>
        </Card>
      </Columns>
    );
  }

  // On full-service: manage it.
  const monthly = db.settings.fullServiceCents + (client.companyPage ? db.settings.pageManagementCents : 0);
  return (
    <Columns {...rails.clientSettings}>
      <Card
        title="Full-service"
        action={fs.paused ? <Badge status="warning">Paused</Badge> : <Badge status="success">Active</Badge>}
        info={fs.paused ? undefined : `Your account team is managing your LinkedIn. On since ${dayIn(fs.since)}.`}
      >
        <div className="flex flex-col gap-4">
          {fs.paused && <Banner tone="warning" title="Your team's access is paused">We have stopped all work on your account. Resume when you are ready and we will pick up where we left off.</Banner>}
          <p className="text-body text-primary">
            {money(monthly)} a month on top of your plan{client.companyPage ? ", including company Page management" : ""}. See <TextLink href="/contract">Contract</TextLink>.
          </p>
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
                  info: "Your team stops managing your account and your stored login is cleared. A company Page add-on, if on, stays and is prepared for you as tasks. You can turn full-service back on later.",
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
        </div>
      </Card>

      <DelegatedAccessCard />

      <Contract />

      <Card title="What your team has done" action={accessLog.length > 0 && <Pill>{plural(accessLog.length, "session")}</Pill>}>
        {accessLog.length ? (
          <Rows>
            {accessLog.map((a) => (
              <Row key={a.id}>
                <span className="flex min-w-0 flex-1 items-start gap-3">
                  <Clock className="mt-0.5 size-4 shrink-0 text-primary-600" aria-hidden />
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="text-body-sm text-secondary">{a.action}</span>
                    <span className="text-caption text-secondary">{`${a.who} · ${agoIn(a.at)}${a.minutes ? ` · ${a.minutes} min` : ""}`}</span>
                  </span>
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
