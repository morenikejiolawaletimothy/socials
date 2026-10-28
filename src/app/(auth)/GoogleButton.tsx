"use client";

import Image from "next/image";
import { Button } from "@/components/ui";

/** Google's own multicolour "G", as Google's sign-in guidelines require. The one brand mark not taken from Phosphor. */
export function GoogleButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <Button variant="secondary" fullWidth onClick={onClick} loading={loading}>
      {!loading && <Image src="/brand/google-g.svg" alt="" width={20} height={20} />}
      {loading ? "Connecting to Google" : "Continue with Google"}
    </Button>
  );
}
