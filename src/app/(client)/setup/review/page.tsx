"use client";

import { useRouter } from "next/navigation";
import { ReviewForm } from "@/components/client/ReviewForm";
import { SetupFrame } from "@/components/client/SetupFrame";
import { useToast } from "@/components/ui";
import { act, useMyClient } from "@/lib/mock";

/** C5 Set how you review. The last setup step. */
export default function ReviewSetupPage() {
  const router = useRouter();
  const toast = useToast();
  const { client } = useMyClient();
  if (!client) return null;

  return (
    <SetupFrame title="Set how you review" step="How you review" steps={[]} current={0}>
      <p className="text-body-sm text-secondary">Decide how involved you want to be. You can change any of this later in Control.</p>
      <ReviewForm
        initial={client.review}
        saveLabel="Save and finish setup"
        onSave={async (r) => {
          await act.saveReview(client.id, r);
          act.completeSetupStep(client.id, "review");
          toast("Setup is done. Your first 2 weeks have started.");
          router.push("/home");
        }}
      />
    </SetupFrame>
  );
}
