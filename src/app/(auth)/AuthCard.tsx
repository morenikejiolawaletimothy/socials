import { Card } from "@/components/ui";

export function AuthCard({ title, description, children }: { title: string; description?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card className="flex flex-col gap-6 sm:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-display-2xl text-primary">{title}</h1>
        {description && <p className="text-body text-secondary">{description}</p>}
      </div>
      {children}
    </Card>
  );
}
