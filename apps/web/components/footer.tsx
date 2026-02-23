import Image from "next/image";
import Link from "next/link";
import { MapPin, Mail, Phone } from "lucide-react";
import { mainNavLinks, siteConfig } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white">
      {/* Main footer content */}
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand section */}
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src="/logo.jpg"
                alt="Accessories World logo"
                width={40}
                height={40}
                className="rounded-lg border border-gray-200 object-cover"
              />
              <span className="text-base font-bold text-black">
                Accessories World
              </span>
            </Link>

            <p className="mt-4 text-sm leading-relaxed text-gray-600">
              Quality accessories at affordable prices. Supporting Zimbabwean families with reliable products and excellent service.
            </p>
          </div>

          {/* Pages section */}
          <div>
            <h3 className="text-sm font-semibold text-black uppercase tracking-wider">
              Pages
            </h3>
            <ul className="mt-4 space-y-2">
              {mainNavLinks.map((item) => (
                <li key={item.href}>
                  {item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-600 hover:text-red-500 transition-colors"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className="text-sm text-gray-600 hover:text-red-500 transition-colors"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact section */}
          <div>
            <h3 className="text-sm font-semibold text-black uppercase tracking-wider">
              Contact
            </h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-red-500 flex-shrink-0" />
                <span className="text-sm text-gray-600">{siteConfig.location}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-red-500 flex-shrink-0" />
                <a
                  href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`}
                  className="text-sm text-gray-600 hover:text-red-500 transition-colors"
                >
                  {siteConfig.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-red-500 flex-shrink-0" />
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="text-sm text-gray-600 hover:text-red-500 transition-colors"
                >
                  {siteConfig.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Hours section */}
          <div>
            <h3 className="text-sm font-semibold text-black uppercase tracking-wider">
              Working Hours
            </h3>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600">Mon - Fri: 8:00 AM - 5:30 PM</p>
              <p className="text-sm text-gray-600">Saturday: 8:00 AM - 3:00 PM</p>
              <p className="text-sm text-gray-600">Sunday: Closed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright section */}
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-xs text-gray-600">
            © {year} Accessories World. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
