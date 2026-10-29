import type { Metadata } from "next";
import Link from "next/link";
import { HomeLink } from "@/components/shell/HomeLink";
import { StatusPage } from "@/components/shell/StatusPage";
import { buttonClass } from "@/components/ui";

export const metadata: Metadata = { title: "Page not found · Bluecut Socials" };

export default function NotFound() {
  return (
    <StatusPage
      code="404"
      title="We could not find that page"
      actions={
        <>
          <HomeLink />
          <Link href="/" className={buttonClass("secondary")}>
            Go to the website
          </Link>
        </>
      }
    >
      The link may be old, or the page may have moved. Check the address, or start again from Home.
    </StatusPage>
  );
}
