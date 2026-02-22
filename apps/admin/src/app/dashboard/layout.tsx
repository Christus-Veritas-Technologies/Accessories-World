"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Package,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Smartphone,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/accounts", label: "Accounts", icon: Users },
  {
    href: "/dashboard/wholesale-users",
    label: "Wholesale Users",
    icon: Users,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          open ? "translate-x-0" : "-translate-x-full"
        } fixed left-0 top-0 z-40 h-full w-64 bg-brand-primary text-white transition-transform duration-300 lg:relative lg:translate-x-0`}
      >
        <div className="flex h-16 items-center justify-between border-b border-brand-primary-light px-6">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Smartphone className="h-6 w-6" />
            <span>Accessories World</span>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-1 px-3 py-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-primary-light"
                    : "hover:bg-brand-primary-light/50"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-3 right-3">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-brand-primary-light/50">
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 flex h-16 items-center border-b border-border bg-background px-6">
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="ml-auto text-sm font-semibold text-muted-foreground">
            Admin Dashboard
          </h1>
        </div>

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>

      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}
