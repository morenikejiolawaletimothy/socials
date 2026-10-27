import { Placeholder } from "@/components/shell/Placeholder";

export const metadata = { title: "Account · Bluecut Socials" };

export default function Page() {
  return (
    <Placeholder
      title="Account"
      description="Profile, sign-in, notifications and your data."
      batch="1.4"
      flows="C14"
      crumbs={[{ label: "Me", href: "/me" }, { label: "Account" }]}
    />
  );
}
