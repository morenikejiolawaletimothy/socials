"use client";

import { CalendarBlank } from "@phosphor-icons/react";
import Link from "next/link";
import { Avatar, Banner, Card, useConfirm } from "@/components/ui";
import { dayTime, fullName } from "@/lib/format";
import { act, useMyClient } from "@/lib/mock";

const callName = { goals: "Goals call", strategy: "Strategy call", "check-in": "Check-in call" };

/** Right-column card on client pages: the person who runs their account, and the next call. */
export function ManagerCard() {
  const { manager, managerUser, calls } = useMyClient();
  const confirm = useConfirm();
  const next = calls.find((c) => c.status === "booked" && new Date(c.at).getTime() > Date.now() - 30 * 60_000);

  return (
    <Card title="Your account manager">
      {manager && managerUser ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Avatar name={fullName(managerUser)} src={managerUser.photo} size="lg" />
            <div className="flex min-w-0 flex-col">
              <span className="text-body font-medium text-primary">{fullName(managerUser)}</span>
              <span className="text-body-sm text-secondary">Account manager</span>
            </div>
          </div>
          <p className="text-body-sm text-secondary">{manager.intro}</p>
          {next && (
            <div className="flex items-start gap-3 rounded-md bg-neutral-25 p-3">
              <CalendarBlank className="mt-0.5 size-5 shrink-0 text-primary-600" aria-hidden />
              <div className="flex flex-col gap-1">
                <span className="text-body font-medium text-primary">{callName[next.kind]}</span>
                <span className="text-body-sm text-secondary">{dayTime(next.at)}, 30 minutes</span>
                {next.kind === "check-in" ? (
                  <button
                    type="button"
                    onClick={() =>
                      confirm({
                        title: "Cancel your check-in call?",
                        body: `${managerUser?.firstName} is told and the time is freed up.`,
                        warning: "To talk another time, message your manager and they will offer a new time.",
                        confirmLabel: "Cancel call",
                        cancelLabel: "Keep it",
                        tone: "danger",
                        action: () => act.cancelCall(next.id),
                        success: "Call cancelled. Your manager is told.",
                      })
                    }
                    className="self-start rounded-sm text-body-sm font-medium text-primary-600 hover:underline focus-visible:focus-ring"
                  >
                    Cancel call
                  </button>
                ) : (
                  <Link href={`/setup/calls${next.kind === "strategy" ? "?step=2" : ""}`} className="self-start rounded-sm text-body-sm font-medium text-primary-600 hover:underline focus-visible:focus-ring">
                    Move to another time
                  </Link>
                )}
              </div>
            </div>
          )}
          <Link
            href="/messages"
            className="self-start rounded-md border border-border-strong px-4 py-2 text-body-sm font-medium text-primary-700 hover:bg-primary-50 focus-visible:focus-ring"
          >
            Message {managerUser.firstName}
          </Link>
        </div>
      ) : (
        <Banner tone="info">We are choosing the right manager for you. You will see them here soon.</Banner>
      )}
    </Card>
  );
}
