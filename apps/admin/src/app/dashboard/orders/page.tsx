'use client';

import { useState } from 'react';
import { useAdminOrders } from '@/hooks/queries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Loader, Package, Eye, CheckCircle2, XCircle, Clock } from 'lucide-react';
import Image from 'next/image';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; bg: string; text: string; actions: string[] }> = {
  pending: {
    icon: <Clock className="w-5 h-5" />,
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    actions: ['processing', 'cancelled'],
  },
  processing: {
    icon: <Loader className="w-5 h-5 animate-spin" />,
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    actions: ['shipped', 'cancelled'],
  },
  shipped: {
    icon: <Package className="w-5 h-5" />,
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    actions: ['delivered', 'cancelled'],
  },
  delivered: {
    icon: <CheckCircle2 className="w-5 h-5" />,
    bg: 'bg-green-50',
    text: 'text-green-700',
    actions: [],
  },
  cancelled: {
    icon: <XCircle className="w-5 h-5" />,
    bg: 'bg-red-50',
    text: 'text-red-700',
    actions: [],
  },
};

export default function OrdersPage() {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { data: orders, isLoading, error } = useAdminOrders();

  const filteredOrders =
    statusFilter === 'all'
      ? orders
      : orders.filter((order: Order) => order.status === statusFilter);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(220, 38, 38);
    doc.text('Accessories World', 14, 20);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(13);
    doc.text('Orders Report', 14, 30);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleDateString()} — ${(filteredOrders ?? []).length} orders`, 14, 38);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (doc as any).autoTable({
      startY: 46,
      head: [['Order #', 'Wholesaler', 'Status', 'Items', 'Total', 'Date']],
      body: (filteredOrders ?? []).map((order: Order) => [
        `#${order.orderNumber}`,
        order.customerName,
        order.status,
        order.items.length,
        `$${Number(order.totalAmount).toFixed(2)}`,
        new Date(order.createdAt).toLocaleDateString(),
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [220, 38, 38] },
    });
    doc.save('orders.pdf');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-gray-100">
        <div className="text-center">
          <Loader className="w-12 h-12 text-brand-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-gray-100 px-4">
        <div className="max-w-md text-center">
          <Eye className="w-16 h-16 text-red-600 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Error Loading Orders</h1>
          <p className="text-gray-600 mb-6">Failed to fetch orders</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <img
              src="/logo-aw.jpg"
              alt="Accessories World"
              className="h-10 w-10 object-contain"
            />
            <h1 className="text-3xl font-bold">Orders Management</h1>
          </div>
          <p className="text-muted-foreground">Manage and track all customer orders</p>
        </div>
        <Button onClick={exportPDF} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(
          (status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-brand-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status === 'all' ? ` (${orders.length})` : ` (${orders.filter((o: Order) => o.status === status).length})`}
            </button>
          )
        )}
      </div>

      {filteredOrders && filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-6 text-gray-300" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Orders</h2>
            <p className="text-gray-600">No orders found with this status</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders?.map((order: Order) => {
            const statusConfig = STATUS_CONFIG[order.status];
            return (
              <Card
                key={order.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div
                  className="p-6"
                  onClick={() =>
                    setExpandedOrder(
                      expandedOrder === order.id ? null : order.id
                    )
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4 flex-wrap">
                        <div>
                          <p className="text-sm text-muted-foreground">Order Number</p>
                          <p className="text-lg font-bold text-gray-900">
                            #{order.orderNumber}
                          </p>
                        </div>
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                          {statusConfig.icon}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Customer</p>
                          <p className="font-semibold text-gray-900 truncate">
                            {order.customerName}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total</p>
                          <p className="font-bold text-brand-primary">
                            ZWL {order.totalAmount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Items</p>
                          <p className="font-semibold text-gray-900">
                            {order.items.length}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Quantity</p>
                          <p className="font-semibold text-gray-900">
                            {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Date</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Order Details */}
                  {expandedOrder === order.id && (
                    <div className="mt-6 border-t border-border/50 pt-6 space-y-6">
                      {/* Customer Info */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Customer Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-muted-foreground">Name</p>
                            <p className="font-semibold text-gray-900">
                              {order.customerName}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-semibold text-gray-900 truncate">
                              {order.customerEmail}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-muted-foreground">Phone</p>
                            <p className="font-semibold text-gray-900">
                              {order.customerPhone}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
                        <div className="space-y-3">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                            >
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {item.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Qty: {item.quantity}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-brand-primary">
                                  ZWL {(item.price * item.quantity).toLocaleString()}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  ZWL {item.price.toLocaleString()} each
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Status Update */}
                      {statusConfig.actions.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-4">
                            Update Status
                          </h3>
                          <div className="flex gap-2 flex-wrap">
                            {statusConfig.actions.map((nextStatus) => (
                              <Button
                                key={nextStatus}
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Handle status update
                                  console.log(
                                    `Update order ${order.id} to ${nextStatus}`
                                  );
                                }}
                              >
                                Mark as{' '}
                                {nextStatus.charAt(0).toUpperCase() +
                                  nextStatus.slice(1)}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
