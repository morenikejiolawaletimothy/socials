"use client";

import { GoogleLogo } from "@phosphor-icons/react";
import { Button } from "@/components/ui";

export function GoogleButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <Button variant="secondary" fullWidth onClick={onClick} disabled={loading}>
      <GoogleLogo className="size-5" aria-hidden />
      {loading ? "Connecting to Google" : "Continue with Google"}
    </Button>
  );
}
