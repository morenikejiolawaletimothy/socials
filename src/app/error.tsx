"use client";

import { useEffect } from "react";
import { StatusPage } from "@/components/shell/StatusPage";
import { Button } from "@/components/ui";
import { HomeLink } from "@/components/shell/HomeLink";

/** Shown when a page fails to load. Phase 2 also reports the error to monitoring. */
export default function PageError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <StatusPage
      title="Something went wrong on our side"
      actions={
        <>
          <Button onClick={reset}>Try again</Button>
          <HomeLink variant="secondary" />
        </>
      }
    >
      Nothing you did caused this, and nothing was lost. Try again, and if it keeps happening, tell your manager in Messages.
    </StatusPage>
  );
}
