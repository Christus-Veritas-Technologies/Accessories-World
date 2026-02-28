import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 w-full">
        <div className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-gray-200 bg-white px-4 lg:hidden">
          <SidebarTrigger className="h-6 w-6" />
          <h1 className="text-sm font-semibold">Dashboard</h1>
        </div>
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
