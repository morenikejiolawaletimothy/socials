"use client";

import { Microphone, Stop } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { Button, Textarea } from "@/components/ui";
import { useDictation } from "@/components/messages/useDictation";
import { VoiceWave } from "@/components/messages/VoiceWave";

/**
 * Record a voice note, then check the written version before sending. Same voice typing as Messages: the words
 * appear as the person speaks, with the blue wave. Without a microphone the demo writes `sample` when they stop.
 */
export function VoiceRecorder({ sample, onChange }: { sample: string; onChange: (transcript: string) => void }) {
  const [state, setState] = useState<"idle" | "recording" | "done">("idle");
  const [seconds, setSeconds] = useState(0);
  const [text, setTextState] = useState("");
  const setText = (t: string) => {
    setTextState(t);
    onChange(t);
  };
  const { listening, toggle } = useDictation({ text, setText, sample });

  useEffect(() => {
    if (state !== "recording") return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [state]);

  // When listening ends (Stop, or the browser gives up), show the written version to check.
  const wasListening = useRef(false);
  useEffect(() => {
    if (wasListening.current && !listening) setState("done");
    wasListening.current = listening;
  }, [listening]);

  if (state === "done") {
    return (
      <Textarea
        label={`Your voice note (${seconds}s), written out`}
        help="Fix anything we heard wrong before you send."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-neutral-25 p-3">
      <div className="flex flex-wrap items-center gap-3">
        {state === "idle" ? (
          <Button
            variant="secondary"
            onClick={() => {
              setState("recording");
              toggle();
            }}
          >
            <Microphone className="size-5" aria-hidden />
            Record a voice note
          </Button>
        ) : (
          <>
            <Button variant="secondary" onClick={toggle} className="!border-primary-600 bg-primary-50 text-primary-600 hover:bg-primary-100 hover:text-primary-700">
              <Stop className="size-5" aria-hidden />
              Stop
            </Button>
            <span className="flex items-center gap-2 text-body-sm text-primary-600" aria-live="polite">
              <VoiceWave active={listening} />
              Listening {seconds}s
            </span>
          </>
        )}
      </div>
      {state === "recording" && text && <p className="text-body-sm text-primary">{text}</p>}
    </div>
  );
}
