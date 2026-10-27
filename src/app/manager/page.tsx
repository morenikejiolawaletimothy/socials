"use client";

import { useState } from "react";
import { Segmented } from "@/components/ui";
import { Placeholder } from "@/components/shell/Placeholder";

export default function ManagerHome() {
  const [view, setView] = useState<"feed" | "board">("feed");
  return (
    <Placeholder title="Home" description="What to do next, across all your clients." batch="1.5" flows="M1">
      <Segmented
        label="Task view"
        value={view}
        onChange={setView}
        options={[
          { value: "feed", label: "Feed" },
          { value: "board", label: "Board" },
        ]}
      />
    </Placeholder>
  );
}
