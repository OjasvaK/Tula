/** Shared entrance motion for the landing page. App screens do not perform entrances. */

export const EASE_OUT = [0.23, 1, 0.32, 1];

export const fadeUp = {
  hidden: { opacity: 0, transform: "translateY(24px)" },
  show: (i = 0) => ({
    opacity: 1,
    transform: "translateY(0px)",
    transition: { delay: i * 0.075, duration: 0.6, ease: EASE_OUT },
  }),
};
