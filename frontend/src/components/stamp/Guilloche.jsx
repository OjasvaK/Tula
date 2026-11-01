import { memo } from "react";

// A hypotrochoid rosette, the security-printing underprint of a stamp.
function rosette(R, r, d, turns, steps) {
  const k = (R - r) / r;
  let path = "";
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2 * turns;
    const x = (R - r) * Math.cos(t) + d * Math.cos(k * t);
    const y = (R - r) * Math.sin(t) - d * Math.sin(k * t);
    path += `${i === 0 ? "M" : "L"}${(x + 60).toFixed(2)} ${(y + 60).toFixed(2)}`;
  }
  return path;
}

const OUTER = rosette(50, 15, 22, 3, 900);
const INNER = rosette(32, 12, 14, 3, 700);

export const Guilloche = memo(function Guilloche({ className, style }) {
  return (
    <svg
      viewBox="0 0 120 120"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className={className}
      style={style}
    >
      <path d={OUTER} fill="none" stroke="currentColor" strokeWidth="0.35" />
      <path d={INNER} fill="none" stroke="currentColor" strokeWidth="0.3" />
    </svg>
  );
});
