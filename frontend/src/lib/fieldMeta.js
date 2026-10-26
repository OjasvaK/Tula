import {
  IndianRupee,
  Scale,
  Globe2,
  Headset,
  MapPin,
  CalendarClock,
  FileCheck2,
} from "lucide-react";

/**
 * Presentation metadata for each Rule 6 declaration the checker looks for.
 * The authoritative description + legal citation still come from the backend
 * `/rules` endpoint; this only adds an icon, a short "why it matters" line,
 * an example of compliant label text, and common reasons a check fails.
 */
export const FIELD_META = {
  mrp: {
    icon: IndianRupee,
    why: "Buyers must see the all-inclusive maximum price before purchase.",
    example: "MRP ₹120 (incl. of all taxes)",
    commonFailures: [
      "Price printed without the ₹ / Rs. symbol",
      "“MRP” abbreviation missing next to the amount",
      "Faint or glare-washed price text the OCR can't read",
    ],
  },
  net_quantity: {
    icon: Scale,
    why: "Quantity must be declared in standard metric units so buyers can compare.",
    example: "Net Qty: 500 g",
    commonFailures: [
      "Quantity given only in non-standard units (pieces, cups)",
      "Unit letter merged with other text by the OCR",
    ],
  },
  country_of_origin: {
    icon: Globe2,
    why: "Mandatory for imported goods and for marketplace listings generally.",
    example: "Country of Origin: India",
    commonFailures: [
      "Only a flag icon, no text",
      "Phrase worded as “Product of …” which the pattern doesn't catch",
    ],
  },
  consumer_care: {
    icon: Headset,
    why: "A complaint channel (name, phone, or email) must be reachable.",
    example: "Consumer Care: care@brand.com",
    commonFailures: [
      "Only a website URL, no “consumer/customer care” label",
      "Details placed on a separate insert, not the label",
    ],
  },
  manufacturer_address: {
    icon: MapPin,
    why: "The manufacturer, packer, or importer's full address must appear.",
    example: "… Industrial Area, Pune 411019",
    commonFailures: [
      "Address present but PIN code missing or unreadable",
      "6-digit code broken across two lines by the OCR",
    ],
  },
  month_year: {
    icon: CalendarClock,
    why: "The month and year of manufacture or packing must be stated.",
    example: "Mfg: 08/2026",
    commonFailures: [
      "Only a year, no month",
      "Date stamped in DD-MM-YYYY where the day is misread as the month",
    ],
  },
};

export function fieldIcon(field) {
  return (FIELD_META[field] && FIELD_META[field].icon) || FileCheck2;
}
