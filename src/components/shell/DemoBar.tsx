"use client";

import { useRouter } from "next/navigation";
import { resetDemo, setDemoRole, useSession, type Role } from "@/lib/mock";
import { useToast } from "@/components/ui";

const homes: Record<Role, string> = { client: "/home", manager: "/manager", owner: "/admin" };
const labels: Record<Role, string> = { client: "Client", manager: "Manager", owner: "Owner" };

/** Phase 1 only: switch between roles to walk the product. Removed in Phase 2. */
export function DemoBar() {
  const { role } = useSession();
  const router = useRouter();
  const toast = useToast();

  return (
    <div className="bg-dark text-inverse">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2">
        <div className="flex items-center gap-2">
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
          className="rounded-sm px-2 py-1 text-caption text-neutral-300 hover:text-inverse focus-visible:focus-ring"
        >
          Reset demo
        </button>
      </div>
    </div>
  );
}
