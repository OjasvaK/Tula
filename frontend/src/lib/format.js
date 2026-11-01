export function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** ISO date for columns that are compared row against row. */
export function formatISODate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function formatPercent(fraction, digits = 0) {
  if (fraction == null || Number.isNaN(fraction)) return "—";
  return `${(fraction * 100).toFixed(digits)}%`;
}

const FIELD_LABELS = {
  mrp: "Maximum retail price",
  net_quantity: "Net quantity",
  country_of_origin: "Country of origin",
  consumer_care: "Consumer care",
  manufacturer_address: "Manufacturer address",
  month_year: "Month and year",
};

export function fieldLabel(field) {
  return FIELD_LABELS[field] || field.replace(/_/g, " ");
}
