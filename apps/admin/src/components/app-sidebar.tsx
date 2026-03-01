"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Package, Users, LogOut, DollarSign, LayoutDashboard, Menu, KeyRound } from "lucide-react"
import { useState } from "react"
import Image from "next/image"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useLogout } from "@/hooks/queries"
import { cn } from "@/lib/utils"
import { ChangePasswordDialog } from "@/components/change-password-dialog"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/sales", label: "Sales", icon: DollarSign },
  { href: "/dashboard/accounts", label: "Accounts", icon: Users },
  { href: "/dashboard/wholesale-users", label: "Wholesale Users", icon: LayoutDashboard },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const logoutMutation = useLogout()

  const handleLogout = () => {
    logoutMutation.mutate()
  }

  const SidebarContent = () => (
    <>
      <div className="flex h-16 items-center gap-2 border-b border-red-600 px-6 py-4">
        <div className="relative w-8 h-8 flex-shrink-0">
          <Image
            src="/logo-aw.jpg"
            alt="Accessories World"
            fill
            className="object-contain"
          />
        </div>
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

      <div className="absolute bottom-6 left-3 right-3 space-y-1">
        <Button
          onClick={() => setShowChangePassword(true)}
          variant="ghost"
          className="w-full justify-start gap-3 rounded-lg px-3 text-white hover:bg-red-600/80"
        >
          <KeyRound className="h-5 w-5" />
          Change Password
        </Button>
        <Button
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          variant="ghost"
          className="w-full justify-start gap-3 rounded-lg px-3 text-white hover:bg-red-600/80 disabled:opacity-50"
        >
          <LogOut className="h-5 w-5" />
          {logoutMutation.isPending ? "Logging out..." : "Logout"}
        </Button>
      </div>
    </>
  )

  return (
    <div className="flex h-screen bg-white">
      {/* Change Password Dialog */}
      <ChangePasswordDialog open={showChangePassword} onOpenChange={setShowChangePassword} />
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
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <h1 className="text-sm font-semibold text-gray-800">Admin Dashboard</h1>
        </div>

        {/* Desktop Top Bar */}
        <div className="hidden h-16 items-center justify-end border-b border-gray-200 bg-white px-6 lg:flex">
          <p className="text-sm font-semibold text-gray-800">Admin Dashboard</p>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Content will be injected here */}
        </main>
      </div>
    </div>
  )
}
