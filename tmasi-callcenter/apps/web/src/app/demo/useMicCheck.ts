"use client";

import { useEffect, useRef, useState } from "react";
import { friendlyStartError } from "../../lib/test-line.ts";
import { MIC_BLOCKED } from "./useTestLine.ts";

export type MicState = "checking" | "ready" | "prompt" | "denied" | "error";

/** Looks at the microphone permission without asking. When it is already granted, opens a light analyser for the 5-bar meter. */
export function useMicCheck(active: boolean) {
  const [state, setState] = useState<MicState>("checking");
  const [message, setMessage] = useState<string | null>(null);
  const level = useRef(0);

  useEffect(() => {
    if (!active) return;
    let stop = false;
    let stream: MediaStream | null = null;
    let ctx: AudioContext | null = null;
    let timer: ReturnType<typeof setInterval> | null = null;
    let status: PermissionStatus | null = null;

    const open = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (stop) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        ctx = new AudioContext();
        const an = ctx.createAnalyser();
        an.fftSize = 256;
        ctx.createMediaStreamSource(stream).connect(an);
        const buf = new Uint8Array(an.fftSize);
        timer = setInterval(() => {
          an.getByteTimeDomainData(buf);
          let sum = 0;
          for (const b of buf) sum += ((b - 128) / 128) ** 2;
          level.current = Math.min(1, Math.sqrt(sum / buf.length) * 3);
        }, 60);
        setState("ready");
      } catch (e) {
        const name = (e as { name?: string } | null)?.name ?? "";
        if (name === "NotAllowedError" || name === "SecurityError") {
          setState("denied");
          setMessage(MIC_BLOCKED);
        } else {
          setState("error");
          setMessage(friendlyStartError(e));
        }
      }
    };

    const evaluate = (s: PermissionState | "unknown") => {
      if (stop) return;
      if (s === "granted") void open();
      else if (s === "denied") {
        setState("denied");
        setMessage(MIC_BLOCKED);
      } else setState("prompt");
    };

    (async () => {
      try {
        status = await navigator.permissions.query({ name: "microphone" as PermissionName });
        evaluate(status.state);
        status.onchange = () => {
          if (status) evaluate(status.state);
        };
      } catch {
        evaluate("unknown");
      }
    })();

    return () => {
      stop = true;
      if (status) status.onchange = null;
      if (timer) clearInterval(timer);
      stream?.getTracks().forEach((t) => t.stop());
      void ctx?.close().catch(() => undefined);
      level.current = 0;
    };
  }, [active]);

  return { state, message, getLevel: () => level.current };
}
