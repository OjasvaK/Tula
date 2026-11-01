import { useId } from "react";

/** A circular cancellation with wavy cancel lines, struck at the shared angle. */
export function Postmark({ clause, word = "found", className, style }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      viewBox="0 0 230 120"
      aria-hidden="true"
      className={className}
      style={style}
    >
      <defs>
        <path id={`arc-${id}`} d="M 18 60 A 42 42 0 0 1 102 60" />
      </defs>
      <g fill="none" stroke="var(--postmark)">
        <circle cx="60" cy="60" r="52" strokeWidth="3" />
        <circle cx="60" cy="60" r="36" strokeWidth="1.6" />
        {[0, 1, 2, 3].map((i) => (
          <path
            key={i}
            strokeWidth="3"
            d={`M 118 ${30 + i * 20} q 14 -9 28 0 t 28 0 t 28 0 t 28 0`}
          />
        ))}
      </g>
      <text
        fill="var(--postmark)"
        fontFamily="Mukta, sans-serif"
        fontWeight="700"
        fontSize="12.5"
      >
        <textPath href={`#arc-${id}`} startOffset="50%" textAnchor="middle">
          Rule 6 · LMPC 2011
        </textPath>
      </text>
      <text
        x="60"
        y="64"
        textAnchor="middle"
        fill="var(--postmark)"
        fontFamily="Mukta, sans-serif"
        fontWeight="800"
        fontSize="17"
      >
        {clause.replace("R.", "")}
      </text>
      <text
        x="60"
        y="82"
        textAnchor="middle"
        fill="var(--postmark)"
        fontFamily="Mukta, sans-serif"
        fontWeight="600"
        fontSize="12"
      >
        {word}
      </text>
    </svg>
  );
}
