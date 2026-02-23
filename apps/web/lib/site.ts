export const siteConfig = {
  name: "Accessories World",
  tagline: "Every Accessory at an Affordable Price",
  description:
    "Accessories World gives Zimbabwean families quality phone and gadget accessories at fair prices.",
  location: "49-51 Second Street, Mutare, Zimbabwe",
  phone: "+263 78 492 3973",
  email: "info@accessoriesworld.co.zw",
  whatsappNumber: "+263784923973",
};

export const mainNavLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/products", label: "Products" },
  { href: "/contact", label: "Contact" },
] as const;

export const homeHighlights = [
  {
    title: "Trusted quality",
    description:
      "We stock accessories we can stand behind, from chargers and cables to speakers and smart gadgets.",
  },
  {
    title: "Good local support",
    description:
      "Our team helps you pick the right item for your phone, your budget, and your daily use.",
  },
  {
    title: "Fast response",
    description:
      "Call, WhatsApp, or visit us in Mutare and get practical help without long waiting times.",
  },
] as const;

export const aboutValues = [
  {
    title: "Affordability",
    description:
      "We work to keep prices fair so more people can access quality accessories.",
  },
  {
    title: "Honest service",
    description:
      "We give clear advice and real product information before you buy.",
  },
  {
    title: "Community focus",
    description:
      "We are a Zimbabwean business serving students, families, and growing local businesses.",
  },
] as const;
