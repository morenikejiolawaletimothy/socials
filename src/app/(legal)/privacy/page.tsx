import { TextLink } from "@/components/ui";

export const metadata = { title: "Privacy policy · Bluecut Socials" };

export default function Page() {
  return (
    <article className="flex flex-col gap-4">
      <h1 className="font-display text-display-2xl text-primary">Privacy policy</h1>
      <p className="text-body text-secondary">We are finishing this page. It will be published here before launch.</p>
      <TextLink href="/" className="self-start">
        Back to Bluecut
      </TextLink>
    </article>
  );
}
