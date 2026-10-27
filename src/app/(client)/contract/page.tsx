import { Placeholder } from "@/components/shell/Placeholder";

export const metadata = { title: "Contract · Bluecut Socials" };

export default function Page() {
  return (
    <Placeholder
      title="Contract"
      description="Your plan, dates, payments and invoices."
      layout="clientSettings"
      batch="1.4"
      flows="C13"
      crumbs={[{ label: "Me", href: "/me" }, { label: "Contract" }]}
    />
  );
}
