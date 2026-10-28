"use client";

import { Microphone, Stop } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Button, Textarea } from "@/components/ui";

/**
 * Record a voice note, then check the written version before sending. Phase 1 fakes the recording and
 * the transcript; Phase 2 records with the browser and transcribes on the server.
 */
export function VoiceRecorder({ sample, onChange }: { sample: string; onChange: (transcript: string) => void }) {
  const [state, setState] = useState<"idle" | "recording" | "done">("idle");
  const [seconds, setSeconds] = useState(0);
  const [text, setText] = useState("");

  useEffect(() => {
    if (state !== "recording") return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [state]);

  if (state === "done") {
    return (
      <Textarea
        label={`Your voice note (${seconds}s), written out`}
        help="Fix anything we heard wrong before you send."
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          onChange(e.target.value);
        }}
      />
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-neutral-25 p-3">
      {state === "idle" ? (
        <Button variant="secondary" onClick={() => setState("recording")}>
          <Microphone className="size-5" aria-hidden />
          Record a voice note
        </Button>
      ) : (
        <>
          <Button
            variant="secondary"
            onClick={() => {
              setState("done");
              setText(sample);
              onChange(sample);
            }}
          >
            <Stop className="size-5" aria-hidden />
            Stop
          </Button>
          <span className="flex items-center gap-2 text-body-sm text-primary" aria-live="polite">
            <span className="size-2 animate-pulse rounded-full bg-danger" aria-hidden />
            Recording {seconds}s
          </span>
        </>
      )}
    </div>
  );
}
