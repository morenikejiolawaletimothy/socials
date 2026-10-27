import { Placeholder } from "@/components/shell/Placeholder";

export const metadata = { title: "Your brand · Bluecut Socials" };

export default function Page() {
  return (
    <Placeholder
      title="Your brand"
      description="Photos, voice, documents, Moments and what is off limits."
      layout="clientSettings"
      batch="1.4"
      flows="C15"
      crumbs={[{ label: "Me", href: "/me" }, { label: "Your brand" }]}
    />
  );
}
