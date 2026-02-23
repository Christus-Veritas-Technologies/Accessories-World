"use client";

import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  Eye,
  AlertCircle,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useKpis } from "@/hooks/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface KPIData {
  revenue: { total: number; monthly: number };
  views: { weekly: number; monthly: number };
  mostViewedProducts: Array<{ product: { name: string }; views: number }>;
  topSellingProducts: Array<{ product: { name: string }; totalSold: number }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
    wholesaler: string;
    createdAt: string;
  }>;
  lowStockProducts: Array<{ id: string; name: string; stock: number; sku: string }>;
}

export default function Dashboard() {
  const router = useRouter();
  const { data: kpis, isLoading, error } = useKpis() as any;

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${document.cookie
            .split("; ")
            .find((row) => row.startsWith("adminToken="))
            ?.split("=")[1]}`,
        },
      });
    } catch (err) {
      console.error("Logout error:", err);
    }

    // Clear auth
    document.cookie = "adminToken=; path=/; max-age=0";
    localStorage.removeItem("adminSession");
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="space-y-6">
          <div className="h-10 bg-gray-200 rounded animate-pulse w-48" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Error loading dashboard: {error.message}</p>
        </div>
      </div>
    );
  }

  if (!kpis) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src="/logo-aw.jpg"
            alt="Accessories World"
            className="h-12 w-12 object-contain"
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back to Accessories World Admin</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Revenue"
          value={`$${kpis.revenue.total.toFixed(2)}`}
          icon={TrendingUp}
          color="bg-red-100 text-red-600"
        />
        <KPICard
          title="Monthly Revenue"
          value={`$${kpis.revenue.monthly.toFixed(2)}`}
          icon={ShoppingCart}
          color="bg-green-100 text-green-600"
        />
        <KPICard
          title="Weekly Views"
          value={kpis.views.weekly.toLocaleString()}
          icon={Eye}
          color="bg-blue-100 text-blue-600"
        />
        <KPICard
          title="Monthly Views"
          value={kpis.views.monthly.toLocaleString()}
          icon={Package}
          color="bg-purple-100 text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Most Viewed Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-red-500" />
              Most Viewed Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {kpis.mostViewedProducts?.length > 0 ? (
                kpis.mostViewedProducts.slice(0, 5).map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-700">{item.product.name}</span>
                    <Badge variant="secondary">{item.views} views</Badge>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No views yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-red-500" />
              Top Selling Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {kpis.topSellingProducts?.length > 0 ? (
                kpis.topSellingProducts.slice(0, 5).map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-700">{item.product.name}</span>
                    <Badge variant="secondary">{item.totalSold} sold</Badge>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No sales yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {kpis.lowStockProducts?.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertCircle className="h-5 w-5" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {kpis.lowStockProducts.map((product: any) => (
                <p key={product.id} className="text-sm text-red-800">
                  <strong>{product.name}</strong> ({product.sku}): {product.stock}{' '}
                  remaining
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-red-500" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Order #</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Wholesaler</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Amount</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {kpis.recentOrders?.length > 0 ? (
                  kpis.recentOrders.map((order: any) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{order.orderNumber}</td>
                      <td className="px-4 py-3 text-gray-900">{order.wholesaler}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        ${order.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge
                          variant={
                            order.status === 'DELIVERED'
                              ? 'default'
                              : order.status === 'CANCELLED'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {order.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      No orders yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function KPICard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  icon: any;
  color: string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-600 font-medium">{title}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`rounded-lg p-3 ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
