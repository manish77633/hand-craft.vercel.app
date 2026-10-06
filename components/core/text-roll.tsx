import type { CSSProperties } from "react";

// CSS-only character roll: no animation runtime or scroll listeners.
export function TextRoll({ children }: { children: string }) {
  return <span className="text-roll" aria-label={children}>
    <span className="sr-only">{children}</span>
    <span aria-hidden="true">{Array.from(children).map((character, index) =>
      <span className="text-roll-character" key={index} style={{ "--roll-delay": `${index * .05}s` } as CSSProperties}>
        <span className="text-roll-original">{character === " " ? "\u00a0" : character}</span>
        <span className="text-roll-copy">{character === " " ? "\u00a0" : character}</span>
      </span>
    )}</span>
  </span>;
}
