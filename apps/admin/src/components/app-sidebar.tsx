"use client"

import { Home, Package, Users, LogOut, LayoutDashboard, DollarSign } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLogout } from "@/hooks/queries"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Products",
    href: "/dashboard/products",
    icon: Package,
  },
  {
    title: "Sales",
    href: "/dashboard/sales",
    icon: DollarSign,
  },
  {
    title: "Accounts",
    href: "/dashboard/accounts",
    icon: Users,
  },
  {
    title: "Wholesale Users",
    href: "/dashboard/wholesale-users",
    icon: LayoutDashboard,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const logoutMutation = useLogout()

  const handleLogout = () => {
    logoutMutation.mutate()
  }

  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between py-2">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="relative w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">AW</span>
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-bold text-gray-900">ACCESSORIES</p>
              <p className="text-xs font-bold text-gray-900">WORLD</p>
            </div>
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-600">Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={isActive ? "bg-red-500 text-white hover:bg-red-600" : ""}
                    >
                      <Link href={item.href} className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="hidden md:inline">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-200">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">{logoutMutation.isPending ? "Logging out..." : "Logout"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
