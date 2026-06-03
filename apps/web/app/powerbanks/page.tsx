"use client";

import { LandingPage, type LandingConfig } from "@/components/landing/landing-page";
import { BatteryCharging } from "lucide-react";

const BASE = "https://images.unsplash.com";

const config: LandingConfig = {
  title: "Powerbanks",
  titleHighlight: "Power",
  subtitle:
    "Never run out of battery again. Oraimo and other trusted brands — 10,000mAh to 20,000mAh, fast charging. Best prices in Mutare.",
  badge: "Portable powerbanks · Mutare",
  icon: BatteryCharging,

  heroImage: `${BASE}/photo-1585995603413-eb35b5f4a50b`,

  floatImages: [
    `${BASE}/photo-1585995603413-eb35b5f4a50b`,
    `${BASE}/photo-1566554738544-d962991c3fee`,
    `${BASE}/photo-1614399113305-a127bb2ca893`,
    `${BASE}/photo-1644571669401-9ab344866592`,
    `${BASE}/photo-1585995603413-eb35b5f4a50b`,
    `${BASE}/photo-1566554738544-d962991c3fee`,
  ],

  productItems: [
    { name: "Oraimo Powerbanks", desc: "10,000mAh and 20,000mAh available" },
    { name: "10,000mAh Powerbanks", desc: "Slim — gives most phones 2–3 charges" },
    { name: "20,000mAh Powerbanks", desc: "High capacity for long days out" },
    { name: "Fast Charge Powerbanks", desc: "18W and 22.5W quick charge" },
    { name: "Dual-Port Powerbanks", desc: "Charge two devices at once" },
    { name: "Solar Powerbanks", desc: "Solar + USB input, stay charged anywhere" },
  ],

  waMessage:
    "Hi! I saw your Google ad for powerbanks. I'm interested — what brands, capacities and prices do you have?",

  searchTerm: "powerbank",
};

export default function PowerbanksPage() {
  return <LandingPage {...config} />;
}
