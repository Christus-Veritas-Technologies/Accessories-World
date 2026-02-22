"use client";

import { useEffect, useState } from "react";
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  Eye,
  AlertCircle,
} from "lucide-react";

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
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/kpis`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch KPIs");
        setKpis(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading KPIs");
      } finally {
        setLoading(false);
      }
    };

    fetchKpis();
  }, []);

  if (loading) {
    return <div className="text-center py-12">Loading KPIs...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-12">{error}</div>;
  }

  if (!kpis) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Revenue"
          value={`$${kpis.revenue.total.toFixed(2)}`}
          icon={TrendingUp}
          color="bg-blue-100 text-blue-600"
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
          color="bg-purple-100 text-purple-600"
        />
        <KPICard
          title="Monthly Views"
          value={kpis.views.monthly.toLocaleString()}
          icon={Eye}
          color="bg-orange-100 text-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Most Viewed Products */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Most Viewed Products</h2>
          <div className="space-y-3">
            {kpis.mostViewedProducts.length > 0 ? (
              kpis.mostViewedProducts.slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span>{item.product.name}</span>
                  <span className="font-semibold text-brand-primary">
                    {item.views} views
                  </span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No views yet</p>
            )}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Top Selling Products</h2>
          <div className="space-y-3">
            {kpis.topSellingProducts.length > 0 ? (
              kpis.topSellingProducts.slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span>{item.product.name}</span>
                  <span className="font-semibold text-brand-primary">
                    {item.totalSold} sold
                  </span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No sales yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {kpis.lowStockProducts.length > 0 && (
        <div className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="mb-3 font-semibold text-yellow-900">Low Stock Alert</h2>
              <div className="space-y-2">
                {kpis.lowStockProducts.map((product) => (
                  <p key={product.id} className="text-sm text-yellow-800">
                    <strong>{product.name}</strong> ({product.sku}): {product.stock} remaining
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2 text-left">Order #</th>
                <th className="px-4 py-2 text-left">Wholesaler</th>
                <th className="px-4 py-2 text-right">Amount</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {kpis.recentOrders.length > 0 ? (
                kpis.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border hover:bg-muted/50">
                    <td className="px-4 py-2 font-mono">{order.orderNumber}</td>
                    <td className="px-4 py-2">{order.wholesaler}</td>
                    <td className="px-4 py-2 text-right">${order.totalAmount.toFixed(2)}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
                          order.status === "DELIVERED"
                            ? "bg-green-100 text-green-800"
                            : order.status === "CANCELLED"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
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
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-bold">{value}</p>
        </div>
        <div className={`rounded-lg p-3 ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
