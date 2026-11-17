"use client";

// The private TMASI test line: a small state machine over the three approved screens (idle and connecting, live, ended).
import { ConversationProvider } from "@elevenlabs/react";
import "./demo.css";
import { AfterScreen } from "./AfterScreen.tsx";
import { LiveScreen } from "./LiveScreen.tsx";
import { StartScreen } from "./StartScreen.tsx";
import { notoArabic, poppins } from "./fonts.ts";
import { useIsPhone } from "./shared.tsx";
import { useTestLine } from "./useTestLine.ts";

function Demo() {
  const tl = useTestLine();
  const phone = useIsPhone();
  if (tl.phase === "live") return <LiveScreen tl={tl} phone={phone} />;
  if (tl.phase === "ended") return <AfterScreen tl={tl} phone={phone} />;
  return <StartScreen tl={tl} phone={phone} />;
}

export default function DemoPage() {
  return (
    <div className={`${poppins.variable} ${notoArabic.variable}`}>
      <ConversationProvider>
        <Demo />
      </ConversationProvider>
    </div>
  );
}
