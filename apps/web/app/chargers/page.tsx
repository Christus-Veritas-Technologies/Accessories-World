"use client";

import { LandingPage, type LandingConfig } from "@/components/landing/landing-page";
import { Zap } from "lucide-react";

const BASE = "https://images.unsplash.com";

const config: LandingConfig = {
  title: "Charging Cables & Chargers",
  titleHighlight: "Chargers",
  subtitle:
    "USB-C, Lightning, Micro-USB — every cable and charger you need for any phone, at the best prices in Mutare.",
  badge: "Phone charging accessories · Mutare",
  icon: Zap,

  heroImage: `${BASE}/photo-1573868388390-2739872961e6`,

  floatImages: [
    `${BASE}/photo-1573868388390-2739872961e6`,
    `${BASE}/photo-1595756630452-736bc8ef3693`,
    `${BASE}/photo-1615086169217-83e1c06c9f4f`,
    `${BASE}/photo-1573868388390-2739872961e6`,
    `${BASE}/photo-1595756630452-736bc8ef3693`,
    `${BASE}/photo-1615086169217-83e1c06c9f4f`,
  ],

  productItems: [
    { name: "USB-C Cables", desc: "Fast charging, braided, durable" },
    { name: "Lightning (iPhone) Cables", desc: "All iPhone & iPad models" },
    { name: "Micro-USB Cables", desc: "Older Android devices" },
    { name: "Wall Chargers", desc: "5W, 18W and 33W fast chargers" },
    { name: "Car Chargers", desc: "Dual-port, quick charge" },
    { name: "Replacement Chargers", desc: "Samsung, Tecno, Itel & more" },
  ],

  waMessage:
    "Hi! I saw your Google ad for charging cables and chargers. I'm interested — what do you have available and what are the prices?",

  searchTerm: "charger",
};

export default function ChargersPage() {
  return <LandingPage {...config} />;
}
