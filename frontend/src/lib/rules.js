/**
 * The six Rule 6 declarations, in the order the sheet prints them.
 * `pattern` mirrors backend/app/rules.yaml exactly (the backend lower-cases
 * the text and searches case-insensitively); keep the two in step.
 */
export const DECLARATIONS = [
  {
    field: "mrp",
    name: "Maximum retail price",
    short: "MRP",
    clause: "R.6(1)(f)",
    reference: "LMPC Rules 2011, Rule 6(1)(f)",
    ink: "var(--blue)",
    requires: "The maximum retail price, inclusive of all taxes.",
    looksFor: "“MRP” or “M.R.P.” followed within a few characters by ₹ or Rs and an amount.",
    pattern: /(mrp|m\.r\.p\.?).{0,15}(₹|rs\.?)\s?\d+(\.\d{1,2})?/i,
  },
  {
    field: "net_quantity",
    name: "Net quantity",
    short: "Net qty",
    clause: "R.6(1)(c)",
    reference: "LMPC Rules 2011, Rule 6(1)(c)",
    ink: "var(--green)",
    requires: "Net quantity in standard units of weight or volume.",
    looksFor: "A number followed by g, gm, gram, kg, ml, l or litre.",
    pattern: /\d+(\.\d+)?\s?(g|kg|ml|l|litre|gram|gm)\b/i,
  },
  {
    field: "country_of_origin",
    name: "Country of origin",
    short: "Origin",
    clause: "R.6(1)(h)",
    reference: "LMPC Rules 2011, Rule 6(1)(h)",
    ink: "var(--sepia)",
    requires: "The country of origin, mandatory for imported goods.",
    looksFor: "“Country of origin” or “Made in” followed by a word.",
    pattern: /(country of origin|made in)\s*[:-]?\s*\w+/i,
  },
  {
    field: "consumer_care",
    name: "Consumer care",
    short: "Care",
    clause: "R.6(1)(e)",
    reference: "LMPC Rules 2011, Rule 6(1)(e)",
    ink: "var(--slate)",
    requires: "Contact details for consumer complaints.",
    looksFor: "“Consumer care”, “Customer care” or “Contact us”.",
    pattern: /(consumer care|customer care|contact us)/i,
  },
  {
    field: "manufacturer_address",
    name: "Manufacturer address",
    short: "Address",
    clause: "R.6(1)(a)",
    reference: "LMPC Rules 2011, Rule 6(1)(a)",
    ink: "var(--blue)",
    requires: "Name and address of the manufacturer, packer or importer.",
    looksFor: "A six-digit PIN code, as evidence of a complete address.",
    pattern: /\d{6}/,
  },
  {
    field: "month_year",
    name: "Month and year",
    short: "Mfg date",
    clause: "R.6(1)(g)",
    reference: "LMPC Rules 2011, Rule 6(1)(g)",
    ink: "var(--green)",
    requires: "Month and year of manufacture, packing or import.",
    looksFor: "A month and four-digit year such as 08/2026 or 08-2026.",
    pattern: /(0[1-9]|1[0-2])[/\-\s](20\d{2})/,
  },
];

export const DECLARATION_BY_FIELD = Object.fromEntries(
  DECLARATIONS.map((d) => [d.field, d])
);

/** Run the six patterns over label text, the way the backend does. */
export function checkText(text) {
  const lower = (text || "").toLowerCase();
  return DECLARATIONS.map((d) => {
    const match = lower.match(d.pattern);
    return {
      field: d.field,
      present: Boolean(match),
      matched_text: match ? match[0] : null,
    };
  });
}

/** The declaration(s) missing most often; ties are reported together, never broken arbitrarily. */
export function topGaps(trends = {}) {
  const count = Math.max(0, ...DECLARATIONS.map((d) => trends[d.field] || 0));
  if (count === 0) return { count: 0, decls: [] };
  return { count, decls: DECLARATIONS.filter((d) => (trends[d.field] || 0) === count) };
}

/** "a", "a and b", "a, b and c". */
export function joinNames(names) {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

const TITLE = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());

/**
 * The value a found declaration actually states, for display on its stamp:
 * "₹120.00" rather than "mrp ₹120.00", "India" rather than "country of
 * origin: india", the care phone or email that follows the care label.
 * Falls back to null when the value cannot be read from the text.
 */
export function declaredValue(field, matched, text = "") {
  if (!matched) return null;
  const m = matched.trim();
  switch (field) {
    case "mrp": {
      const amt = m.match(/(₹|rs\.?)\s?(\d+(\.\d{1,2})?)/i);
      return amt ? `₹${amt[2]}` : null;
    }
    case "net_quantity":
      return m.replace(/\s+/g, " ").replace(/^(\d+(?:\.\d+)?)\s?([a-z]+)$/i, "$1 $2");
    case "country_of_origin": {
      const c = m.replace(/^(country of origin|made in)\s*[:-]?\s*/i, "");
      return c ? TITLE(c) : null;
    }
    case "consumer_care": {
      const lower = text.toLowerCase();
      const at = lower.indexOf(m.toLowerCase());
      const after = at >= 0 ? text.slice(at + m.length, at + m.length + 160) : "";
      const contact = after.match(/[\w.+-]+@[\w-]+\.[\w.]+|\+?\d[\d\s-]{7,}\d/);
      return contact ? contact[0].replace(/\s+/g, " ").slice(0, 16) : null;
    }
    case "manufacturer_address":
    case "month_year":
      return m;
    default:
      return null;
  }
}
