import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { fadeUp } from "../../lib/motion";

function wideScreen() {
  return typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches;
}

/**
 * Scroll-triggered entrance: the element rises into place once as it enters
 * the viewport. `index` staggers siblings. `as` must be a tag name string.
 * On phones and with reduced motion the content is simply there: a reveal on
 * a small screen only delays what the reader scrolled to see.
 */
export function Reveal({ children, as = "div", index = 0, className, amount = 0.01, ...props }) {
  const reduce = useReducedMotion();
  const [wide] = useState(wideScreen);
  if (reduce || !wide) {
    const Tag = as;
    return (
      <Tag className={className} {...props}>
        {children}
      </Tag>
    );
  }
  const Comp = motion[as] || motion.div;
  return (
    <Comp
      variants={fadeUp}
      custom={index}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      className={className}
      {...props}
    >
      {children}
    </Comp>
  );
}
