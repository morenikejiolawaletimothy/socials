"use client";

import { useRouter } from "next/navigation";
import { act, resetDemo, setDemoRole, useData, useSession, type Role } from "@/lib/mock";
import { useToast } from "@/components/ui";

const homes: Record<Role, string> = { client: "/home", manager: "/manager", owner: "/admin" };
const labels: Record<Role, string> = { client: "Client", manager: "Manager", owner: "Owner" };

// Demo clients, one per state, so every client screen can be seen. Full list in docs/demo-accounts.md.
const demoClients = [
  { userId: "u-chidi", label: "Chidi: active" },
  { userId: "u-sarah", label: "Sarah: free 2 weeks, ending soon" },
  { userId: "u-ngozi", label: "Ngozi: calls booked" },
  { userId: "u-femi", label: "Femi: approve strategy" },
  { userId: "u-david", label: "David: setting up" },
  { userId: "u-kemi", label: "Kemi: paused" },
];

/** Phase 1 only: switch between roles to walk the product. Removed in Phase 2. */
export function DemoBar() {
  const { role } = useSession();
  const router = useRouter();
  const toast = useToast();
  const clientUserId = useData().session.userIds.client;

  return (
    <div className="bg-dark text-inverse">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-2">
        <div className="flex items-center gap-2 sm:order-1">
          <span className="hidden text-caption text-neutral-300 sm:inline">Demo view</span>
          <div role="tablist" aria-label="Demo view" className="flex gap-1">
            {(Object.keys(homes) as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                role="tab"
                aria-selected={role === r}
                onClick={() => {
                  setDemoRole(r);
                  router.push(homes[r]);
                }}
                className={`rounded-sm px-3 py-1 text-caption focus-visible:focus-ring ${role === r ? "bg-neutral-0 text-neutral-900" : "text-neutral-300 hover:text-inverse"}`}
              >
                {labels[r]}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            resetDemo();
            toast("Demo data reset.");
          }}
          className="rounded-sm px-2 py-1 text-caption text-neutral-300 hover:text-inverse focus-visible:focus-ring sm:order-3 sm:ml-auto"
        >
          Reset demo
        </button>
        {role === "client" && (
          <select
            aria-label="Demo client"
            value={clientUserId}
            onChange={(e) => {
              act.setDemoClient(e.target.value);
              router.push("/home");
            }}
            className="w-full rounded-sm bg-neutral-800 px-2 py-1 text-caption text-inverse focus-visible:focus-ring sm:order-2 sm:w-auto"
          >
            {demoClients.map((c) => (
              <option key={c.userId} value={c.userId}>
                {c.label}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
