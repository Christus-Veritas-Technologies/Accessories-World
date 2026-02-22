'use client';

import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { useKpis } from '@/hooks/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
  const { data: kpis, isLoading, error } = useKpis() as any;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 py-12 text-center">
        Error loading KPIs: {error.message}
      </div>
    );
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
        <Card>
          <CardHeader>
            <CardTitle>Most Viewed Products</CardTitle>
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
            <CardTitle>Top Selling Products</CardTitle>
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
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-900">
              <AlertCircle className="h-5 w-5" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {kpis.lowStockProducts.map((product: any) => (
                <p key={product.id} className="text-sm text-yellow-800">
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
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left font-semibold">Order #</th>
                  <th className="px-4 py-2 text-left font-semibold">Wholesaler</th>
                  <th className="px-4 py-2 text-right font-semibold">Amount</th>
                  <th className="px-4 py-2 text-center font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {kpis.recentOrders?.length > 0 ? (
                  kpis.recentOrders.map((order: any) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono text-xs">{order.orderNumber}</td>
                      <td className="px-4 py-2">{order.wholesaler}</td>
                      <td className="px-4 py-2 text-right font-semibold">
                        ${order.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-center">
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
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="mt-2 text-2xl font-bold">{value}</p>
          </div>
          <div className={`rounded-lg p-3 ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
