import { Placeholder } from "@/components/shell/Placeholder";

export const metadata = { title: "Control · Bluecut Socials" };

export default function Page() {
  return (
    <Placeholder
      title="Control"
      description="What we do for you, how you review, pause, disconnect and activity."
      batch="1.4"
      flows="C11"
      crumbs={[{ label: "Me", href: "/me" }, { label: "Control" }]}
    />
  );
}
