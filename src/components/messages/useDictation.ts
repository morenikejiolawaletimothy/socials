"use client";

import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/ui";

/* Voice to text: the browser's speech recognition where there is one; a sample sentence otherwise (demo). */
type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

function makeRecognition(): Recognition | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
  const R = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return R ? new R() : null;
}

/**
 * Voice typing, shared by every place that turns speech into text (Messages, voice notes on posts).
 * Words appear in `text` live as the person speaks, after whatever was there. It keeps listening through pauses
 * until `toggle` is pressed again. Without a microphone or speech service (blocked, unsupported) it carries on in
 * demo mode and puts `sample` in when stopped. Pair it with `VoiceWave` for the moving wave.
 */
export function useDictation({ text, setText, sample }: { text: string; setText: (t: string) => void; sample: string }) {
  const toast = useToast();
  const [listening, setListening] = useState(false);
  const recognition = useRef<Recognition | null>(null);
  /** True from pressing the mic until pressing stop, so a browser's pause does not end voice typing. */
  const want = useRef(false);
  const latest = useRef(text);
  latest.current = text;

  // Stop listening when leaving the page.
  useEffect(
    () => () => {
      want.current = false;
      recognition.current?.stop();
    },
    [],
  );

  const toggle = () => {
    if (listening) {
      want.current = false;
      recognition.current?.stop();
      if (!recognition.current) {
        const t = latest.current.trim();
        setText(t ? `${t} ${sample}` : sample);
        setListening(false);
      }
      return;
    }
    const r = makeRecognition();
    recognition.current = r;
    want.current = true;
    setListening(true);
    if (!r) return; // Demo: the sample sentence goes in when they press stop.
    // What was there before speaking; live words show after it and are kept once final.
    let before = latest.current.trim();
    r.lang = "en-GB";
    r.interimResults = true;
    r.continuous = true;
    r.onresult = (e) => {
      let final = "";
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) final += `${res[0]?.transcript ?? ""} `;
        else interim += res[0]?.transcript ?? "";
      }
      if (final.trim()) before = [before, final.trim()].filter(Boolean).join(" ");
      setText([before, interim.trim()].filter(Boolean).join(" "));
    };
    r.onerror = (e) => {
      if (e.error === "no-speech" || e.error === "aborted") return;
      recognition.current = null;
      toast(
        e.error === "not-allowed" || e.error === "service-not-allowed"
          ? "Your browser blocked the microphone, so we will type a sample sentence when you stop. Allow the microphone to use your voice."
          : "Voice typing could not reach your microphone, so we will type a sample sentence when you stop.",
        "danger",
      );
    };
    // Browsers stop listening after a pause; start again until the person presses stop.
    r.onend = () => {
      if (want.current && recognition.current === r) {
        try {
          r.start();
          return;
        } catch {
          /* falls through to stop */
        }
      }
      if (recognition.current === r) setListening(false);
    };
    try {
      r.start();
    } catch {
      recognition.current = null;
      toast("Voice typing is not available here, so we will type a sample sentence when you stop.", "danger");
    }
  };

  return { listening, toggle };
}
