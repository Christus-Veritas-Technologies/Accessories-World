"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { MessageCircle, Phone, Check, Shield, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ProductCard } from "@/components/products/product-card";
import { useProducts, type Product } from "@/hooks/use-products";
import { siteConfig } from "@/lib/site";
import type { StorefrontProduct } from "@/lib/api";

/* ─── types ─────────────────────────────────────────────────── */
export interface LandingConfig {
  title: string;
  titleHighlight?: string; // word(s) to colour red
  subtitle: string;
  badge: string;
  icon: LucideIcon;
  heroImage: string; // Unsplash URL
  floatImages: string[]; // 4-6 small Unsplash URLs
  productItems: { name: string; desc: string }[];
  waMessage: string;
  searchTerm?: string;
  trustPoints?: { icon: LucideIcon; title: string; desc: string }[];
}

/* ─── helpers ────────────────────────────────────────────────── */
const WA_NUM = siteConfig.whatsappNumber.replace(/[^0-9]/g, "");
const PHONE_URL = `tel:${siteConfig.phone.replace(/\s+/g, "")}`;

function buildWaUrl(msg: string) {
  return `https://wa.me/${WA_NUM}?text=${encodeURIComponent(msg)}`;
}

function fireConversion() {
  if (typeof window !== "undefined") {
    const w = window as unknown as { gtag?: (...a: unknown[]) => void };
    w.gtag?.("event", "conversion", {
      send_to: "AW-18040131212/WcBoCJryhKYcEIydmppD",
      value: 1.0,
      currency: "USD",
    });
  }
}

/* ─── useAnimateIn hook (CSS fallback while framer-motion installs) ─ */
function useAnimateIn() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

/* ─── FloatImage ─────────────────────────────────────────────── */
function FloatImage({ src, delay, label }: { src: string; delay: number; label: string }) {
  const { ref, visible } = useAnimateIn();
  return (
    <div
      ref={ref}
      className="relative flex-shrink-0 w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden shadow-lg border border-white/20"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(48px) scale(0.92)",
        transition: `opacity 0.55s ease ${delay}s, transform 0.55s ease ${delay}s`,
      }}
    >
      <Image
        src={`${src}?w=300&q=75&auto=format&fit=crop`}
        alt={label}
        fill
        className="object-cover"
        sizes="144px"
      />
    </div>
  );
}

/* ─── main component ─────────────────────────────────────────── */
export function LandingPage({
  title,
  titleHighlight,
  subtitle,
  badge,
  icon: Icon,
  heroImage,
  floatImages,
  productItems,
  waMessage,
  searchTerm,
  trustPoints,
}: LandingConfig) {
  const waUrl = buildWaUrl(waMessage);

  function handleWa() {
    fireConversion();
    window.open(waUrl, "_blank");
  }

  /* fetch real products ─ search or trending */
  const { data: productsData, isLoading } = useProducts({
    search: searchTerm,
    limit: 6,
  });

  const products = productsData?.items ?? [];

  const defaultTrust = [
    { icon: Shield, title: "Quality guaranteed", desc: "Every item is tested before it reaches you" },
    { icon: Zap, title: "Best prices in Mutare", desc: "Affordable without cutting corners" },
    { icon: MessageCircle, title: "Fast WhatsApp reply", desc: "Message us and get a response in minutes" },
  ];
  const trust = trustPoints ?? defaultTrust;

  return (
    <div className="min-h-screen bg-white pb-20 sm:pb-0">

      {/* ── HERO BANNER ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-500 to-red-600">
        {/* subtle grid texture */}
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-10 items-center">

            {/* left: copy */}
            <div>
              <span className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-5">
                <Icon className="h-4 w-4" />
                {badge}
              </span>
              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold text-white leading-tight mb-4">
                {titleHighlight
                  ? title.split(titleHighlight).map((part, i, arr) => (
                      <span key={i}>
                        {part}
                        {i < arr.length - 1 && (
                          <span className="text-yellow-300">{titleHighlight}</span>
                        )}
                      </span>
                    ))
                  : title}
              </h1>
              <p className="text-red-100 text-lg sm:text-xl mb-8 max-w-md leading-relaxed">
                {subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleWa}
                  className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-7 py-3.5 rounded-xl text-base transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  <MessageCircle className="h-5 w-5" />
                  Order via WhatsApp
                </button>
                <a
                  href={PHONE_URL}
                  className="inline-flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 text-white font-semibold px-7 py-3.5 rounded-xl text-base transition-all border border-white/30"
                >
                  <Phone className="h-5 w-5" />
                  {siteConfig.phone}
                </a>
              </div>
              <p className="text-red-200 text-sm mt-5">📍 43 First Street, Mutare — walk in or order online</p>
            </div>

            {/* right: hero image */}
            <div className="relative hidden lg:block h-80 xl:h-96 rounded-2xl overflow-hidden shadow-2xl border border-white/20">
              <Image
                src={`${heroImage}?w=900&q=85&auto=format&fit=crop`}
                alt={title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1200px) 50vw, 600px"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-red-900/20" />
            </div>
          </div>
        </div>
      </section>

      {/* ── FLOATING PRODUCT IMAGES ── */}
      <section className="bg-gray-50 py-8 border-b border-gray-100 overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-5 text-center">
            What we have in stock
          </p>
          <div className="flex gap-4 overflow-x-auto pb-2 justify-start sm:justify-center scrollbar-hide">
            {floatImages.map((src, i) => (
              <FloatImage key={src} src={src} delay={i * 0.08} label={`${title} ${i + 1}`} />
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCT CHECKLIST (what we carry) ── */}
      <section className="py-12 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="text-xl font-bold text-black mb-6 text-center">Everything in this category</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {productItems.map((item) => (
              <div key={item.name} className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="mt-0.5 h-5 w-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Check className="h-3 w-3 text-red-500" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-black leading-snug">{item.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE PRODUCTS FROM DATABASE ── */}
      {(isLoading || products.length > 0) && (
        <section className="py-14 bg-gray-50 border-t border-gray-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-8 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-black mb-2">Shop Now</h2>
              <p className="text-gray-500">Click a product to enquire — we&apos;ll reply on WhatsApp</p>
            </div>
            {isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-72 rounded-xl bg-gray-200 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p as unknown as StorefrontProduct} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── TRUST ── */}
      <section className="py-14 bg-white border-t border-gray-100">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="grid sm:grid-cols-3 gap-8 mb-12">
            {trust.map((t) => (
              <div key={t.title} className="text-center">
                <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-red-50 flex items-center justify-center">
                  <t.icon className="h-6 w-6 text-red-500" />
                </div>
                <h3 className="font-semibold text-black mb-1 text-sm">{t.title}</h3>
                <p className="text-sm text-gray-500">{t.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-8 sm:p-10 text-center text-white shadow-lg">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Ready to order?</h2>
            <p className="text-red-100 mb-7 max-w-md mx-auto">
              WhatsApp us now and we&apos;ll sort you out — usually within minutes.
            </p>
            <button
              onClick={handleWa}
              className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <MessageCircle className="h-5 w-5" />
              Chat on WhatsApp
            </button>
            <p className="text-red-200 text-sm mt-4">📍 43 First Street, Mutare</p>
          </div>
        </div>
      </section>

      {/* ── STICKY MOBILE CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-200 px-4 py-3 flex gap-3 sm:hidden z-50 shadow-lg">
        <button
          onClick={handleWa}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-green-500 text-white font-semibold py-3 rounded-xl text-sm"
        >
          <MessageCircle className="h-4 w-4" /> WhatsApp Us
        </button>
        <a
          href={PHONE_URL}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-red-500 text-white font-semibold py-3 rounded-xl text-sm"
        >
          <Phone className="h-4 w-4" /> Call Us
        </a>
      </div>
    </div>
  );
}
