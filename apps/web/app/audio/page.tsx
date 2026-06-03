"use client";

import { LandingPage, type LandingConfig } from "@/components/landing/landing-page";
import { Headphones } from "lucide-react";

const BASE = "https://images.unsplash.com";

const config: LandingConfig = {
  title: "Speakers & Earbuds",
  titleHighlight: "Earbuds",
  subtitle:
    "Bluetooth speakers, TWS earbuds and wired earphones — quality audio for every phone and every budget in Mutare.",
  badge: "Audio accessories · Mutare",
  icon: Headphones,

  heroImage: `${BASE}/photo-1608043152269-423dbba4e7e1`,

  floatImages: [
    `${BASE}/photo-1608043152269-423dbba4e7e1`,
    `${BASE}/photo-1572569511254-d8f925fe2cbb`,
    `${BASE}/photo-1589256469067-ea99122bbdc4`,
    `${BASE}/photo-1590658268037-6bf12165a8df`,
    `${BASE}/photo-1507878566509-a0dbe19677a5`,
    `${BASE}/photo-1606220588913-b3aacb4d2f46`,
  ],

  productItems: [
    { name: "Kimiso Speakers", desc: "Loud, clear sound with great bass" },
    { name: "Bluetooth Speakers", desc: "Portable, wireless, rechargeable" },
    { name: "TWS Earbuds (Earpods)", desc: "Wireless, lightweight, clear sound" },
    { name: "Wired Earphones (3.5mm)", desc: "For phones with a headphone jack" },
    { name: "USB-C Earphones", desc: "For newer Android phones" },
    { name: "In-Ear Earphones", desc: "Noise-isolating, great for calls" },
  ],

  waMessage:
    "Hi! I saw your Google ad for speakers and earbuds. I'm interested — what do you have available and what are the prices?",

  searchTerm: "speaker",
};

export default function AudioPage() {
  return <LandingPage {...config} />;
}
