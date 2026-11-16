"use client";

import { Card, TextLink } from "@/components/ui";

/** Left-rail card: quick links to the client's brand assets and strategy. From the Figma Home. */
export function ResourcesCard() {
  return (
    <Card title="Resources">
      <ul className="flex flex-col gap-3">
        <li>
          <TextLink href="/brand" className="text-body-sm">Brand assets and strategy</TextLink>
        </li>
        <li>
          <TextLink href="/strategy" className="text-body-sm">Your strategy</TextLink>
        </li>
      </ul>
    </Card>
  );
}
