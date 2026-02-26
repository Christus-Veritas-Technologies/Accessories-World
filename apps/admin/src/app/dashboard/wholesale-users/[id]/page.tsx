'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useWholesaler } from '@/hooks/queries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Phone, Loader2 } from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: { id: string; name: string };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function WholesalerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: wholesaler, isLoading, error } = useWholesaler(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !wholesaler) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <p className="text-red-600">Wholesaler not found.</p>
      </div>
    );
  }

  const totalOrders = wholesaler.orders?.length ?? 0;
  const totalRevenue = wholesaler.orders?.reduce(
    (s: number, order: Order) =>
      s + order.items.reduce((si: number, item: OrderItem) => si + Number(item.price) * item.quantity, 0),
    0
  ) ?? 0;
  const totalItems = wholesaler.orders?.reduce(
    (s: number, order: Order) => s + order.items.reduce((si: number, item: OrderItem) => si + item.quantity, 0),
    0
  ) ?? 0;

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <Button variant="ghost" onClick={() => router.back()} className="gap-2 -ml-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Wholesale Users
      </Button>

      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold">{wholesaler.name}</h1>
        <p className="text-sm text-gray-500">
          Joined {new Date(wholesaler.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Orders', value: totalOrders },
          { label: 'Units Ordered', value: totalItems },
          { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}` },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-red-600">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contact details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <a href={`tel:${wholesaler.phone}`} className="text-blue-600 hover:underline">
                {wholesaler.phone}
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order history */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Order History ({totalOrders})</CardTitle>
        </CardHeader>
        <CardContent>
          {totalOrders === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">No orders placed yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Order #</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wholesaler.orders.map((order: Order) => {
                  const total = order.items.reduce(
                    (s: number, item: OrderItem) => s + Number(item.price) * item.quantity,
                    0
                  );
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-mono text-sm">#{order.orderNumber}</TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{order.items.length}</TableCell>
                      <TableCell className="text-right font-semibold">${total.toFixed(2)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
