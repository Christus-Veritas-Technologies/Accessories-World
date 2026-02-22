'use client';

import { useState, useEffect } from 'react';
import { useWholesalerOrders } from '@/hooks/queries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader, Package, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'delivered' | 'cancelled';
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
  processing: { bg: 'bg-blue-50', text: 'text-blue-700' },
  delivered: { bg: 'bg-green-50', text: 'text-green-700' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700' },
};

export default function OrdersPage() {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const { data: orders, isLoading, error } = useWholesalerOrders();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-gray-100">
        <div className="text-center">
          <Loader className="w-12 h-12 text-brand-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-gray-100 px-4">
        <div className="max-w-md text-center">
          <MessageCircle className="w-16 h-16 text-red-600 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Error Loading Orders</h1>
          <p className="text-gray-600 mb-6">Failed to load your order history</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Order History</h1>
        <p className="text-muted-foreground">Track and manage your wholesale orders</p>
      </div>

      {orders && orders.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-6 text-gray-300" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-6">Start by placing your first wholesale order on the Deals page</p>
            <Button className="w-full sm:w-auto">
              <Package className="w-4 h-4 mr-2" />
              Browse Deals
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders?.map((order: Order) => (
            <Card
              key={order.id}
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() =>
                setExpandedOrder(expandedOrder === order.id ? null : order.id)
              }
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Order Number</p>
                        <p className="text-lg font-bold text-gray-900">
                          #{order.orderNumber}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        STATUS_COLORS[order.status].bg
                      } ${STATUS_COLORS[order.status].text}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Amount</p>
                        <p className="font-semibold text-gray-900">
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
                        <p className="text-muted-foreground">Date</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Quantity</p>
                        <p className="font-semibold text-gray-900">
                          {order.items.reduce((sum, item) => sum + item.quantity, 0)} units
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    {expandedOrder === order.id ? (
                      <ChevronUp className="w-6 h-6 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Order Details */}
                {expandedOrder === order.id && (
                  <div className="mt-6 border-t border-border/50 pt-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-semibold text-gray-900">{item.name}</p>
                            <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {item.quantity} × ZWL {item.price.toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              ZWL {(item.quantity * item.price).toLocaleString()} total
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    {order.status === 'delivered' && (
                      <div className="mt-6 flex flex-col sm:flex-row gap-3">
                        <Button variant="outline" className="flex-1">
                          Reorder
                        </Button>
                        <Button className="flex-1">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Contact Support
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
