import type { Metadata } from "next";
import { Badge, Button, Card, CardText, CardTitle, Input, Logo, Stepper } from "@/components/ui";

export const metadata: Metadata = { title: "Design system · Bluecut Socials" };

const colors = [
  ["primary-600", "bg-primary-600"],
  ["primary-700", "bg-primary-700"],
  ["primary-100", "bg-primary-100"],
  ["primary-50", "bg-primary-50"],
  ["bg-page", "bg-page"],
  ["bg-card", "bg-card"],
  ["text-primary", "bg-primary"],
  ["text-secondary", "bg-secondary"],
  ["border", "bg-border"],
  ["border-strong", "bg-border-strong"],
  ["success", "bg-success"],
  ["warning", "bg-warning"],
  ["danger", "bg-danger"],
] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-display-xl text-primary">{title}</h2>
      {children}
    </section>
  );
}

/** Live reference of the coded components. Compare against design-system/ previews. */
export default function DesignSystemPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-12 px-4 py-12 sm:py-16">
      <header className="flex items-center gap-4">
        <Logo size={48} />
        <div>
          <h1 className="font-display text-display-2xl text-primary">Design system</h1>
          <p className="text-body-sm text-secondary">Bluecut Socials components, built from tokens.</p>
        </div>
      </header>

      <Section title="Color">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {colors.map(([name, cls]) => (
            <div key={name} className="flex flex-col gap-2">
              <span className={`h-14 rounded-md border border-border ${cls}`} />
              <span className="font-mono text-caption text-secondary">{name}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Type">
        <div className="flex flex-col gap-3">
          <p className="font-display text-display-3xl">Display 3xl</p>
          <p className="font-display text-display-2xl">Display 2xl</p>
          <p className="font-display text-display-xl">Display xl</p>
          <p className="font-display text-display-lg">Display lg</p>
          <p className="text-body-lg">Body lg. Lead paragraphs and intros.</p>
          <p className="text-body">Body. Default running text.</p>
          <p className="text-body font-medium">Body medium. Button labels and emphasis.</p>
          <p className="text-body-sm text-secondary">Body sm. Help text and dense tables.</p>
          <p className="text-caption text-secondary">Caption. Labels and metadata.</p>
          <p className="font-mono text-mono-sm">mono-sm 0123456789</p>
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap gap-3">
          <Button>Book a call</Button>
          <Button variant="secondary">See the work</Button>
          <Button variant="ghost">Learn more</Button>
          <Button variant="danger">Delete</Button>
          <Button disabled>Disabled</Button>
        </div>
      </Section>

      <Section title="Badges">
        <div className="flex flex-wrap gap-3">
          <Badge status="success">Published</Badge>
          <Badge status="warning">Scheduled</Badge>
          <Badge status="danger">Failed</Badge>
          <Badge status="info">In review</Badge>
          <Badge>Draft</Badge>
        </div>
      </Section>

      <Section title="Inputs">
        <div className="flex max-w-sm flex-col gap-4">
          <Input
            label="Work email"
            placeholder="you@studio.com"
            help="We'll only use this to send your proposal."
          />
          <Input label="Campaign name" error="Enter a campaign name so you can find it later." />
        </div>
      </Section>

      <Section title="Card">
        <Card className="max-w-sm">
          <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-primary-600 font-display text-display-xl text-inverse">
            b
          </div>
          <CardTitle>Grow your socials</CardTitle>
          <CardText className="mb-5">
            Strategy, content and community for brands that want to sound like themselves.
          </CardText>
          <Button>Book a call</Button>
        </Card>
      </Section>

      <Section title="Stepper">
        <Card>
          <Stepper steps={["Your details", "Brand goals", "Choose a plan", "Review"]} current={1} />
        </Card>
      </Section>
    </main>
  );
}
