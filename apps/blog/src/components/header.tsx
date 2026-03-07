"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { SITE_TITLE } from "@/lib/consts";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/articles", label: "Articles" },
  { href: "/about", label: "About" },
];

function isActive(pathname: string, href: string): boolean {
  return href === pathname || (href !== "/" && pathname.startsWith(href));
}

export function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
      if (!e.matches) setIsOpen(false);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const close = () => setIsOpen(false);

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "white",
          borderBottom: "1px solid rgb(229,231,235)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            maxWidth: "1280px",
            margin: "0 auto",
            height: "80px",
            padding: "0 1rem",
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              flexShrink: 0,
            }}
          >
            <Image
              src="/logo-aw.jpg"
              alt="Accessories World"
              width={40}
              height={40}
              style={{ objectFit: "cover", borderRadius: "0.5rem", border: "1px solid rgb(229,231,235)" }}
              priority
            />
            <div>
              <p style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "rgb(17,24,39)", lineHeight: 1.2 }}>
                {SITE_TITLE}
              </p>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "rgb(107,114,128)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Blog
              </p>
            </div>
          </Link>

          {/* Desktop Navigation  only rendered when not mobile */}
          {!isMobile && (
            <nav style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              {navLinks.map(({ href, label }) => {
                const active = isActive(pathname, href);
                return (
                  <Link
                    key={href}
                    href={href}
                    style={{
                      display: "inline-block",
                      textDecoration: "none",
                      padding: "0.5rem 0.75rem",
                      fontSize: "0.875rem",
                      fontWeight: active ? 600 : 500,
                      color: active ? "#DC2626" : "rgb(75,85,99)",
                      backgroundColor: active ? "rgb(254,242,242)" : "transparent",
                      borderRadius: "0.375rem",
                      transition: "all 0.15s",
                    }}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Desktop CTA  only rendered when not mobile */}
          {!isMobile && (
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.75rem", borderLeft: "1px solid rgb(229,231,235)", paddingLeft: "1.5rem" }}
            >
              <a
                href="tel:+263784923973"
                style={{
                  display: "inline-block",
                  padding: "0.5rem 1rem",
                  border: "1px solid rgb(229,231,235)",
                  color: "rgb(75,85,99)",
                  borderRadius: "0.375rem",
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  textDecoration: "none",
                }}
              >
                Call Us
              </a>
              <a
                href="https://accessoriesworldmutare.co.zw"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  padding: "0.5rem 1rem",
                  background: "#DC2626",
                  color: "white",
                  borderRadius: "0.375rem",
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  textDecoration: "none",
                }}
              >
                Shop Now
              </a>
            </div>
          )}

          {/* Mobile Hamburger  only rendered when mobile */}
          {isMobile && (
            <button
              onClick={() => setIsOpen((v) => !v)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
              style={{
                background: "none",
                border: "1px solid rgb(229,231,235)",
                borderRadius: "0.375rem",
                padding: "0.5rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgb(55,65,81)",
                flexShrink: 0,
              }}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>
      </header>

      {/* Mobile Slide-in Panel  only rendered when mobile and open */}
      {isMobile && isOpen && (
        <div
          style={{
            position: "fixed",
            top: "80px",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99,
            background: "white",
            borderTop: "1px solid rgb(229,231,235)",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
          }}
        >
          <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.25rem", padding: "1rem" }}>
            {navLinks.map(({ href, label }) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={close}
                  style={{
                    display: "block",
                    textDecoration: "none",
                    padding: "0.875rem 1rem",
                    fontSize: "0.9375rem",
                    fontWeight: active ? 600 : 500,
                    color: active ? "#DC2626" : "rgb(55,65,81)",
                    backgroundColor: active ? "rgb(254,242,242)" : "transparent",
                    borderRadius: "0.5rem",
                    transition: "all 0.15s",
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div style={{ padding: "1rem", borderTop: "1px solid rgb(229,231,235)", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <a
              href="tel:+263784923973"
              onClick={close}
              style={{
                display: "block",
                textAlign: "center",
                padding: "0.875rem 1rem",
                border: "1px solid rgb(229,231,235)",
                color: "rgb(55,65,81)",
                borderRadius: "0.5rem",
                fontWeight: 600,
                fontSize: "0.9375rem",
                textDecoration: "none",
              }}
            >
              Call Us
            </a>
            <a
              href="https://accessoriesworldmutare.co.zw"
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
              style={{
                display: "block",
                textAlign: "center",
                padding: "0.875rem 1rem",
                background: "#DC2626",
                color: "white",
                borderRadius: "0.5rem",
                fontWeight: 600,
                fontSize: "0.9375rem",
                textDecoration: "none",
              }}
            >
              Shop Now
            </a>
          </div>
        </div>
      )}
    </>
  );
}
