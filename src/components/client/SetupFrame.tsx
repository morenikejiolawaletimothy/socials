import { Breadcrumbs, Card, Stepper } from "@/components/ui";

/** Setup steps (C2 to C5) sit in one focused column, with the flow's own Stepper and a way back to Home. */
export function SetupFrame({ title, step, steps, current, children }: { title: string; step: string; steps: string[]; current: number; children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <Card title={title} eyebrow={<Breadcrumbs items={[{ label: "Home", href: "/home" }, { label: "Set up" }, { label: step }]} />}>
        <div className="flex flex-col gap-8">
          {steps.length > 1 && <Stepper steps={steps} current={current} />}
          {children}
        </div>
      </Card>
    </div>
  );
}
