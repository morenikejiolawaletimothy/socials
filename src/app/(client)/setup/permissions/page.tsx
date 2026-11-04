"use client";

import { useRouter } from "next/navigation";
import { PermissionsForm } from "@/components/client/PermissionsForm";
import { SetupFrame } from "@/components/client/SetupFrame";
import { Banner, Button, useTask } from "@/components/ui";
import { act, useMyClient } from "@/lib/mock";

/** C2 (no API): choose what we prepare (self-serve) or do (full-service). No LinkedIn login or API involved here. */
export default function PermissionsPage() {
  const router = useRouter();
  const { client } = useMyClient();
  const { run, pending } = useTask();
  if (!client) return null;
  const fullService = client.service === "full-service";
  const title = fullService ? "What we do for you" : "What we prepare for you";

  return (
    <SetupFrame title={title} step={title} steps={[title]} current={0}>
      <div className="flex flex-col gap-6">
        <Banner tone="info">Change these any time in Control. Whether your posts need your approval first is set in the last setup step.</Banner>
        <PermissionsForm client={client} />
        <Button
          className="self-start"
          loading={pending("save")}
          onClick={async () => {
            if (await run("save", () => act.completeSetupStep(client.id, "permissions"), fullService ? "Saved. Next, set up secure access." : "Saved. On to your calls.")) router.push(fullService ? "/setup/access" : "/home");
          }}
        >
          Save and continue
        </Button>
      </div>
    </SetupFrame>
  );
}
