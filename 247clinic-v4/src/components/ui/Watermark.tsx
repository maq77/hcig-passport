/* The 24/7 behind "Medical Care Without Leaving Your Resort", moving (the user,
   2026-09-24: "make 247 text in background ... to be animated and moving").
   2026-11-17, the user: "i want '247' on the background to be not driven by scrolling but be moving at
   its own pace". Scrolling no longer moves it: the two rows sit at fixed offsets and each glides on its
   own, slowly, in opposite directions (a CSS keyframe loop, transform only; globals.css .wm-glide).
   Still under reduced motion. No client JS. */
export function Watermark({ text = "24/7", count = 5 }: { text?: string; count?: number }) {
  const words = Array.from({ length: count }, (_, i) => <span key={i}>{text}</span>);
  return (
    <div className="wm" aria-hidden="true">
      <div className="wm-row wm-fill">
        <div className="wm-glide">{words}</div>
      </div>
      <div className="wm-row wm-line">
        <div className="wm-glide rev">{words}</div>
      </div>
    </div>
  );
}
