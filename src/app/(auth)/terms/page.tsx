import { TextLink } from "@/components/ui";
import { AuthCard } from "../AuthCard";

export const metadata = { title: "Terms of service · Bluecut Socials" };

export default function Page() {
  return (
    <AuthCard title="Terms of service" description="We are finishing this page. It will be published here before launch.">
      <TextLink href="/" className="self-start">
        Back to Bluecut
      </TextLink>
    </AuthCard>
  );
}
