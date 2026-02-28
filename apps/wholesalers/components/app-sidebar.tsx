"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Package, User, LogOut, Menu, Smartphone } from "lucide-react"
import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003/api"

const navItems = [
  { href: "/dashboard", label: "Products", icon: Package },
  { href: "/dashboard/account", label: "My Account", icon: User },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [businessName, setBusinessName] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    if (!localStorage.getItem("wholesalerToken")) {
      router.replace("/login")
    } else {
      const getBusinessName = () => {
        try {
          const raw = localStorage.getItem("wholesalerUser")
          if (!raw) return null
          return JSON.parse(raw)?.name ?? null
        } catch {
          return null
        }
      }
      setBusinessName(getBusinessName())
    }
  }, [router])

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      const token = localStorage.getItem("wholesalerToken")
      if (token) {
        await fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {})
      }
    } finally {
      localStorage.removeItem("wholesalerToken")
      localStorage.removeItem("wholesalerUser")
      router.push("/login")
    }
  }

  const SidebarContent = () => (
    <>
      <div className="flex h-16 items-center gap-2 border-b border-red-600 px-6 py-4">
        <Smartphone className="h-6 w-6 text-white" />
        <span className="font-bold text-white">Accessories World</span>
      </div>

      <nav className="space-y-1 px-3 py-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-red-600 text-white"
                  : "text-white hover:bg-red-600/80"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="absolute bottom-6 left-3 right-3">
        <Button
          onClick={handleSignOut}
          disabled={signingOut}
          variant="ghost"
          className="w-full justify-start gap-3 rounded-lg px-3 text-white hover:bg-red-600/80 disabled:opacity-50"
        >
          <LogOut className="h-5 w-5" />
          {signingOut ? "Signing out..." : "Sign Out"}
        </Button>
      </div>
    </>
  )

  if (!isMounted) return null

  return (
    <div className="flex h-screen bg-white">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col bg-red-700 text-white lg:flex">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar with Mobile Menu */}
        <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-red-700 p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          {businessName && (
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">{businessName}</p>
              <p className="text-xs text-gray-600">Wholesaler Portal</p>
            </div>
          )}
        </div>

        {/* Desktop Top Bar */}
        <div className="hidden h-16 items-center justify-end border-b border-gray-200 bg-white px-6 lg:flex">
          {businessName && (
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">{businessName}</p>
              <p className="text-xs text-gray-600">Wholesaler Portal</p>
            </div>
          )}
        </div>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Content will be injected here */}
        </main>
      </div>
    </div>
  )
}
