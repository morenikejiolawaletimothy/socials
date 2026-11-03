"use client";

import { use } from "react";
import { AssistantFormPage } from "@/components/client/AssistantFormPage";

/** C19: edit an assistant. */
export default function EditAssistantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <AssistantFormPage id={id} />;
}
