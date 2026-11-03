"use client";

import { use } from "react";
import { AssistantTask } from "@/components/client/AssistantTask";

/** C19: an assistant's private link to one quick task. No account, no app menus. */
export default function AssistantTaskPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  return <AssistantTask token={token} />;
}
