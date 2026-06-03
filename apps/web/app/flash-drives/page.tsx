"use client";

import { LandingPage, type LandingConfig } from "@/components/landing/landing-page";
import { HardDrive } from "lucide-react";

const BASE = "https://images.unsplash.com";

const config: LandingConfig = {
  title: "Flash Drives",
  titleHighlight: "Flash",
  subtitle:
    "8GB to 64GB — reliable flash drives for storing, sharing and carrying your files. Best prices in Mutare.",
  badge: "USB flash drives · Mutare",
  icon: HardDrive,

  heroImage: `${BASE}/photo-1587145820098-23e484e69816`,

  floatImages: [
    `${BASE}/photo-1587145820098-23e484e69816`,
    `${BASE}/photo-1551818014-7c8ace9c1b5c`,
    `${BASE}/photo-1477949331575-2763034b5fb5`,
    `${BASE}/photo-1589447388175-ac47d31be950`,
    `${BASE}/photo-1587145820098-23e484e69816`,
    `${BASE}/photo-1551818014-7c8ace9c1b5c`,
  ],

  productItems: [
    { name: "8GB Flash Drives", desc: "Great for documents and photos" },
    { name: "16GB Flash Drives", desc: "Good balance of size and price" },
    { name: "32GB Flash Drives", desc: "Fits movies, music and large files" },
    { name: "64GB Flash Drives", desc: "High capacity for big backups" },
    { name: "USB-C Flash Drives", desc: "Works on phones and laptops" },
    { name: "OTG Flash Drives", desc: "Plug directly into Android phones" },
  ],

  waMessage:
    "Hi! I saw your Google ad for flash drives. I'm interested — what sizes and prices do you have available?",

  categories: ["Storage devices"],
};

export default function FlashDrivesPage() {
  return <LandingPage {...config} />;
}
