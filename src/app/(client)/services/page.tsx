"use client";

import { Check } from "@phosphor-icons/react";
import { useState } from "react";
import { Columns } from "@/components/layout/Columns";
import { rails } from "@/components/rails";
import { Badge, Button, Card, Dialog, EmptyState, Pill, Textarea, Tile, TileFooter, useTask } from "@/components/ui";
import { act, useData, useMyClient, type Service } from "@/lib/mock";

/** Services: what comes with the plan, and extra services the client can ask about. Extras are quoted and billed off the platform. */
export default function ServicesPage() {
  const { client } = useMyClient();
  const db = useData();
  const { run, pending } = useTask();
  const [asking, setAsking] = useState<Service | null>(null);
  const [note, setNote] = useState("");
  if (!client) return null;

  const services = (db.services ?? []).filter((s) => s.active);
  const included = services.filter((s) => s.bucket === "included");
  const extra = services.filter((s) => s.bucket === "extra");

  return (
    <Columns {...rails.clientSettings}>
      <Card
        title="Included in your plan"
        action={included.length > 0 ? <Pill>{included.length}</Pill> : undefined}
        info="These come with your plan at no extra cost. Your account manager delivers them as part of your work."
      >
        {included.length ? (
          <ul className="flex flex-col gap-3">
            {included.map((s) => (
              <li key={s.id}>
                <Tile>
                  <span className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-success-bg text-success">
                      <Check className="size-4" aria-hidden />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-body font-medium text-primary">{s.name}</span>
                        <Badge status="success">Included</Badge>
                      </span>
                      <span className="text-body-sm text-secondary">{s.description}</span>
                    </span>
                  </span>
                </Tile>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="Nothing listed yet">Services that come with your plan will show here.</EmptyState>
        )}
      </Card>

      <Card
        title="More services"
        action={extra.length > 0 ? <Pill>{extra.length}</Pill> : undefined}
        info="Extra services you can add when you need them. We agree the work and price with you first, and handle it separately from your plan. Nothing is charged here."
      >
        {extra.length ? (
          <ul className="flex flex-col gap-3">
            {extra.map((s) => (
              <li key={s.id}>
                <Tile>
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="text-body font-medium text-primary">{s.name}</span>
                    <span className="text-body-sm text-secondary">{s.description}</span>
                  </span>
                  <TileFooter>
                    <span className="text-caption text-secondary">Price on request</span>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setAsking(s);
                        setNote("");
                      }}
                    >
                      Request
                    </Button>
                  </TileFooter>
                </Tile>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="No extra services yet">Extra services you can add will show here.</EmptyState>
        )}
      </Card>

      <Dialog
        open={!!asking}
        onClose={() => setAsking(null)}
        title={asking ? `Request ${asking.name}` : "Request a service"}
        info="This sends your interest to the Bluecut team. They will get back to you to agree the work and a price. You are not charged anything here, and nothing is added to your plan."
      >
        <p className="text-body-sm text-secondary">{asking?.description}</p>
        <Textarea
          label="Anything we should know?"
          help="Optional. A line about what you are after helps us come back with the right plan."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="cancel" onClick={() => setAsking(null)}>
            Cancel
          </Button>
          <Button
            loading={pending("request")}
            onClick={async () => {
              if (asking && (await run("request", () => act.requestService(client.id, asking.id, note.trim() || undefined), "Thanks. We have passed this to the Bluecut team, and they will be in touch."))) {
                setAsking(null);
                setNote("");
              }
            }}
          >
            {pending("request") ? "Sending" : "Send request"}
          </Button>
        </div>
      </Dialog>
    </Columns>
  );
}
