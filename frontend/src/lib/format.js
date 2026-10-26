export function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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

export function formatPercent(fraction, digits = 0) {
  if (fraction == null || Number.isNaN(fraction)) return "—";
  return `${(fraction * 100).toFixed(digits)}%`;
}

const FIELD_LABELS = {
  mrp: "Maximum Retail Price",
  net_quantity: "Net Quantity",
  country_of_origin: "Country of Origin",
  consumer_care: "Consumer Care Details",
  manufacturer_address: "Manufacturer / Packer Address",
  month_year: "Month & Year of Manufacture",
};

export function fieldLabel(field) {
  return FIELD_LABELS[field] || field.replace(/_/g, " ");
}
