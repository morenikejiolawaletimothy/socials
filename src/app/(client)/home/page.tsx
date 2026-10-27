import { Placeholder } from "@/components/shell/Placeholder";

export const metadata = { title: "Home · Bluecut Socials" };

export default function Page() {
  return (
    <Placeholder
      title="Home"
      description="Your setup progress, then everything that needs you, newest first."
      layout="clientFeed"
      batch="1.3 and 1.4"
      flows="C1, C17"
    />
  );
}
