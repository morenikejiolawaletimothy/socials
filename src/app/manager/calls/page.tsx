import { Placeholder } from "@/components/shell/Placeholder";

export const metadata = { title: "Calls and availability · Bluecut Socials" };

export default function Page() {
  return (
    <Placeholder
      title="Calls and availability"
      description="Your open slots and booked calls."
      layout="managerSettings"
      batch="1.5"
      flows="M10"
      crumbs={[{ label: "Me", href: "/manager/me" }, { label: "Calls and availability" }]}
    />
  );
}
