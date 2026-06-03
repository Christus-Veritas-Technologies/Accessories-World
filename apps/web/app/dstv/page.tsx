"use client";

import { LandingPage, type LandingConfig } from "@/components/landing/landing-page";
import { Tv } from "lucide-react";

const BASE = "https://images.unsplash.com";

const config: LandingConfig = {
  title: "DSTV & OpenView Remotes",
  titleHighlight: "DSTV",
  subtitle:
    "Lost your remote or decoder charger? We have replacement remotes and power adapters for DSTV and OpenView — best prices in Mutare.",
  badge: "DSTV & OpenView accessories · Mutare",
  icon: Tv,

  heroImage: `${BASE}/photo-1560169897-fc0cdbdfa4d5`,

  floatImages: [
    `${BASE}/photo-1560169897-fc0cdbdfa4d5`,
    `${BASE}/photo-1584905066893-7d5c142ba4e1`,
    `${BASE}/photo-1593784991188-c899ca07263b`,
    `${BASE}/photo-1586081467622-7acbbc73da3f`,
    `${BASE}/photo-1560169897-fc0cdbdfa4d5`,
    `${BASE}/photo-1584905066893-7d5c142ba4e1`,
  ],

  productItems: [
    { name: "DSTV Remote Controls", desc: "Compatible with all DSTV decoders" },
    { name: "OpenView Remote Controls", desc: "For OpenView HD decoders" },
    { name: "DSTV Power Adapters", desc: "Replacement chargers for DSTV decoders" },
    { name: "OpenView Power Adapters", desc: "Replacement chargers for OpenView decoders" },
    { name: "Remote Batteries (AA)", desc: "For DSTV and OpenView remotes" },
    { name: "Universal TV Remotes", desc: "Samsung, LG, Hisense & most brands" },
  ],

  waMessage:
    "Hi! I saw your Google ad for DSTV and OpenView accessories. I'm interested — what remotes and chargers do you have available and what are the prices?",

  categories: ["Television accessories"],
};

export default function DSTVPage() {
  return <LandingPage {...config} />;
}
