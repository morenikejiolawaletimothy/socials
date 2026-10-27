import { TextLink } from "@/components/ui";
import { AuthCard } from "../AuthCard";

export const metadata = { title: "Privacy policy · Bluecut Socials" };

export default function Page() {
  return (
    <AuthCard title="Privacy policy" description="We are finishing this page. It will be published here before launch.">
      <TextLink href="/" className="self-start">
        Back to Bluecut
      </TextLink>
    </AuthCard>
  );
}
