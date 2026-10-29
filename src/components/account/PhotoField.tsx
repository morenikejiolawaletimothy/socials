"use client";

import { useRef } from "react";
import { Avatar, Button, useTask, useToast } from "@/components/ui";
import { photoProblem, toAvatar } from "@/lib/image";
import { act, type User } from "@/lib/mock";

/** Profile photo: change it, or remove it (with Undo). Shown to the people you work with. */
export function PhotoField({ user, name }: { user: User; name: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const { run, pending } = useTask();

  return (
    <div className="flex items-center gap-4">
      <Avatar name={name} src={user.photo} size="xl" />
      <input
        ref={ref}
        type="file"
        aria-label="Choose a photo"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        tabIndex={-1}
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          const problem = photoProblem(f);
          if (problem) return toast(problem, "danger");
          await run(
            "photo",
            async () => act.setPhoto(user.id, await toAvatar(f)),
            "Photo updated.",
          );
        }}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" loading={pending("photo")} onClick={() => ref.current?.click()}>
          {pending("photo") ? "Uploading" : user.photo ? "Change photo" : "Add a photo"}
        </Button>
        {user.photo && (
          <Button
            variant="ghost"
            loading={pending("remove")}
            onClick={() => {
              const old = user.photo;
              run("remove", () => act.setPhoto(user.id, undefined), { text: "Photo removed.", action: { label: "Undo", onClick: () => run("undo", () => act.setPhoto(user.id, old), "Photo is back.") } });
            }}
          >
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}
