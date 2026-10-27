import { Placeholder } from "@/components/shell/Placeholder";

export const metadata = { title: "Messages · Bluecut Socials" };

export default function Page() {
  return (
    <Placeholder
      title="Messages"
      description="One conversation per client."
      layout="managerMain"
      batch="1.5"
      flows="M9"
    />
  );
}
