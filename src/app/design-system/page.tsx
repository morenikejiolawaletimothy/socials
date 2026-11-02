import type { Metadata } from "next";
import { Bell, CalendarBlank, Circle, Copy, DownloadSimple, PencilSimple, Trash, UserPlus } from "@phosphor-icons/react/dist/ssr";
import { Badge, Button, Card, CardText, CardTitle, IconButton, Input, Logo, Meta, Pill, ProgressBar, Row, Rows, RowText, Stepper, TextButton, TextLink, Tile, TileAction, TileFooter, TileIcon, Tooltip } from "@/components/ui";
import { InteractiveComponents } from "./Interactive";

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
          <Button variant="cancel">Cancel</Button>
          <Button variant="danger">Delete</Button>
          <Button disabled>Disabled</Button>
        </div>
        <p className="text-body-sm text-secondary">Small, for actions inside a tile or row and in card headers (Add, Upload, Edit). Cancel and Remove turn red on hover.</p>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm" variant="secondary">
            <Circle className="size-4" aria-hidden /> Mark as sent
          </Button>
          <Button size="sm">Save note</Button>
          <Button size="sm" variant="cancel">Cancel</Button>
          <Button size="sm" variant="remove">Remove</Button>
        </div>
      </Section>

      <Section title="Text actions">
        <div className="flex flex-wrap gap-6">
          <TextLink href="/design-system" className="text-body-sm">View all</TextLink>
          <TextButton>
            <Copy className="size-4" aria-hidden /> Copy note
          </TextButton>
          <TextButton>
            <PencilSimple className="size-4" aria-hidden /> Edit
          </TextButton>
        </div>
      </Section>

      <Section title="Pills and meta">
        <p className="text-body-sm text-secondary">Pill counts things in a card header. Meta is one line of key info with a blue icon. Badge is a status.</p>
        <div className="flex flex-wrap items-center gap-4">
          <Pill>6 posts</Pill>
          <Pill>2 of 6 done</Pill>
          <Meta icon={CalendarBlank}>Due Fri 6 Nov</Meta>
          <Badge status="success">Sent</Badge>
        </div>
      </Section>

      <Section title="Tile">
        <p className="text-body-sm text-secondary">An item inside a card. Linked tiles turn light blue on hover; the footer has key info on the left and the action on the right.</p>
        <Card title="Quick tasks" action={<Pill>1 of 3 done</Pill>}>
          <div className="flex flex-col gap-3">
            <Tile href="/design-system">
              <span className="flex items-center gap-4">
                <TileIcon round>
                  <UserPlus className="size-7" aria-hidden />
                </TileIcon>
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-body font-medium text-primary">Connect with 6 people this week</span>
                  <span className="text-body-sm text-secondary">2 of 6 sent · Assigned yesterday</span>
                  <span className="max-w-xs">
                    <ProgressBar value={2} max={6} />
                  </span>
                </span>
              </span>
              <TileFooter>
                <Meta icon={CalendarBlank}>Due Fri 6 Nov</Meta>
                <TileAction>Continue</TileAction>
              </TileFooter>
            </Tile>
            <Tile done>
              <span className="flex items-center justify-between gap-4">
                <span className="text-body font-medium text-primary">Amaka Nwosu</span>
                <Badge status="success">Sent</Badge>
              </span>
            </Tile>
          </div>
        </Card>
      </Section>

      <Section title="Rows">
        <p className="text-body-sm text-secondary">A compact list in one bordered group: settings, invoices, a team, versions. Use Tiles when each item needs a footer or a picture. In a card with no padding, Rows flush fills it edge to edge (activity, messages).</p>
        <Card title="How they review" action={<Pill>3 settings</Pill>}>
          <Rows>
            <Row>
              <RowText title="How often" />
              <span className="text-body-sm text-primary">Once a week</span>
            </Row>
            <Row>
              <RowText title="Google Alert: Lagos fintech" sub="Last item 2 hours ago" />
              <Badge status="success">Working</Badge>
              <IconButton icon={Trash} tone="danger" label="Remove Lagos fintech" />
            </Row>
            <Row>
              <RowText title="Invoice INV-0042" sub="Month 2 · 1 Nov 2026" />
              <span className="text-body-sm font-medium text-primary">$800</span>
              <IconButton icon={DownloadSimple} label="Download invoice INV-0042" />
            </Row>
          </Rows>
        </Card>
      </Section>

      <Section title="Layout rules (client, manager and owner)">
        <ul className="flex list-disc flex-col gap-2 pl-5 text-body-sm text-primary">
          <li>Card header: title left; on the right a Pill (a count), a Meta (a date) or a text link. Never a bare grey caption.</li>
          <li>How something works or what happens next: a Banner at the top of the card (closeable when it only explains). Grey text is for descriptions only.</li>
          <li>Items in a card: Tiles, 12px apart. Picture slot, a 16px title, a 14px grey line, then a TileFooter: Meta left, the action right.</li>
          <li>Compact records: Rows. Owner tables sit in the same bordered frame.</li>
          <li>Actions: text actions are TextLink or TextButton; buttons inside tiles and rows are size sm; Delete and Withdraw use the remove variant; Cancel beside Save uses the cancel variant; icon-only actions are IconButton.</li>
          <li>Sections inside a card: a 16px medium heading over Rows or Tiles.</li>
        </ul>
      </Section>

      <Section title="Badges">
        <div className="flex flex-wrap gap-3">
          <Badge status="success" live>Active</Badge>
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

      <Section title="Tooltip">
        <Card>
          <Tooltip label="Notifications">
            <button
              type="button"
              aria-label="Notifications"
              className="flex size-10 items-center justify-center rounded-full text-secondary hover:text-primary focus-visible:focus-ring"
            >
              <Bell className="size-6" aria-hidden />
            </button>
          </Tooltip>
        </Card>
      </Section>

      <InteractiveComponents />
    </main>
  );
}
