"use client";

import { useEffect, useRef, useState } from "react";

const BARS = 24;
const QUIET = Array.from({ length: BARS }, () => 0.15);

/**
 * A live sound wave while voice typing listens: bars that follow the microphone's volume, read in the browser
 * with the Web Audio API (nothing is recorded or sent). Without microphone access it shows a gentle moving wave,
 * and with reduced motion a still one.
 */
export function VoiceWave({ active }: { active: boolean }) {
  const [levels, setLevels] = useState<number[]>(QUIET);
  const frame = useRef(0);

  useEffect(() => {
    if (!active) {
      setLevels(QUIET);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setLevels(Array.from({ length: BARS }, (_, i) => 0.3 + 0.3 * Math.abs(Math.sin(i / 2))));
      return;
    }

    let stopped = false;
    let stream: MediaStream | null = null;
    let audio: AudioContext | null = null;

    // Fallback: a soft wave that drifts, for when the microphone cannot be read.
    const simulate = () => {
      const t = performance.now() / 180;
      setLevels(Array.from({ length: BARS }, (_, i) => 0.2 + 0.5 * Math.abs(Math.sin(t + i / 2.5)) * (0.6 + 0.4 * Math.sin(t / 3 + i))));
      frame.current = requestAnimationFrame(simulate);
    };

    const listen = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (stopped) return;
        audio = new AudioContext();
        const analyser = audio.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.7;
        audio.createMediaStreamSource(stream).connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);
        const draw = () => {
          analyser.getByteFrequencyData(data);
          // Voice sits in the lower bins: spread those across the bars, with a small floor so silence still shows a line.
          setLevels(Array.from({ length: BARS }, (_, i) => Math.max(0.12, data[Math.floor((i / BARS) * data.length * 0.75)] / 255)));
          frame.current = requestAnimationFrame(draw);
        };
        draw();
      } catch {
        if (!stopped) simulate();
      }
    };

    if (typeof navigator.mediaDevices?.getUserMedia === "function") listen();
    else simulate();

    return () => {
      stopped = true;
      cancelAnimationFrame(frame.current);
      stream?.getTracks().forEach((track) => track.stop());
      audio?.close();
    };
  }, [active]);

  return (
    <span className="flex h-6 items-center gap-0.5" aria-hidden>
      {levels.map((l, i) => (
        // Height follows the live level, so it is set inline.
        <span key={i} className="w-0.5 rounded-full bg-primary-600 transition-[height] duration-75" style={{ height: `${Math.round(l * 100)}%` }} />
      ))}
    </span>
  );
}
