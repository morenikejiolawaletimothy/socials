import { Placeholder } from "@/components/shell/Placeholder";

export const metadata = { title: "Profile · Bluecut Socials" };

export default function Page() {
  return (
    <Placeholder
      title="Profile"
      description="Photo, intro, sign-in and notifications."
      layout="managerSettings"
      batch="1.5"
      flows="M10"
      crumbs={[{ label: "Me", href: "/manager/me" }, { label: "Profile" }]}
    />
  );
}
