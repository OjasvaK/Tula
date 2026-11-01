import { MAHAKAL_OCR, DHAGA_OCR } from "./specimenOcr";

/**
 * Real specimens: the project's own label photos (backend/sample_data/images)
 * and the text EasyOCR extracted from them (see specimenOcr.js).
 */
export const SPECIMENS = [
  {
    id: "mahakal",
    name: "Siddh Mahakal Bura, 1 kg",
    photo: "/specimen/siddh-mahakal-bura.jpg",
    alt: "Back of a blue Siddh Mahakal Bura sugar pouch; the MRP and packed-on fields are printed but left blank",
    ocr: MAHAKAL_OCR,
    /** Where each declaration sits, or should sit, on this label. */
    crops: {
      mrp: "/specimen/mrp.jpg",
      net_quantity: "/specimen/net_quantity.jpg",
      country_of_origin: null,
      consumer_care: "/specimen/consumer_care.jpg",
      manufacturer_address: "/specimen/manufacturer_address.jpg",
      month_year: "/specimen/month_year.jpg",
    },
  },
  {
    id: "dhaga",
    name: "Dhaga Mishri rock candy, 1 kg",
    photo: "/specimen/dhaga-mishri.jpg",
    alt: "Green Dhaga Mishri rock-candy pouch photographed at an angle under glare",
    ocr: DHAGA_OCR,
    crops: {},
  },
];

/** A written example, not a real label: every declaration in its expected wording. */
export const WRITTEN_EXAMPLE = `MRP ₹120.00 (incl. of all taxes)
Net Qty: 500 g
Country of Origin: India
Mfd. & packed by: Example Foods, Plot 14, MIDC, Pune 411019
Consumer Care: care@example.in
Packed on: 08/2026`;
