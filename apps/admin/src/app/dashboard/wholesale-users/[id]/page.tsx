'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useWholesaler } from '@/hooks/queries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Building2, Download, Loader2, Mail, Phone } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

  const exportPDF = () => {
    if (!wholesaler) return;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor(220, 38, 38);
    doc.text('Accessories World', 14, 20);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(13);
    doc.text('Wholesaler Report', 14, 30);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 38);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Wholesaler Details', 14, 52);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const infoLines = [
      ['Business Name', wholesaler.businessName],
      ['Contact Person', wholesaler.contactPerson],
      ['Email', wholesaler.email],
      ['Phone', wholesaler.phone ?? '—'],
      ['Address', wholesaler.address ?? '—'],
      ['Status', wholesaler.approved ? 'Approved' : 'Pending'],
      ['Joined', new Date(wholesaler.createdAt).toLocaleDateString()],
    ];
    infoLines.forEach(([label, value], i) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, 14, 60 + i * 7);
      doc.setFont('helvetica', 'normal');
      doc.text(String(value), 65, 60 + i * 7);
    });

    if (wholesaler.orders?.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Order History', 14, 118);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (doc as any).autoTable({
        startY: 124,
        head: [['Date', 'Order #', 'Status', 'Items', 'Total']],
        body: wholesaler.orders.map((order: Order) => {
          const total = order.items.reduce(
            (s: number, item: OrderItem) => s + Number(item.price) * item.quantity,
            0
          );
          return [
            new Date(order.createdAt).toLocaleDateString(),
            `#${order.orderNumber}`,
            order.status,
            order.items.length,
            `$${total.toFixed(2)}`,
          ];
        }),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [220, 38, 38] },
      });
    }

    doc.save(`wholesaler-${wholesaler.businessName.replace(/\s+/g, '-').toLowerCase()}.pdf`);
  };

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
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Wholesale Users
        </Button>
        <Button onClick={exportPDF} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      {/* Title */}
      <div className="flex items-center gap-3">
        <Building2 className="h-7 w-7 text-red-600" />
        <div>
          <h1 className="text-2xl font-bold">{wholesaler.businessName}</h1>
          <p className="text-sm text-gray-500">{wholesaler.contactPerson}</p>
        </div>
        <Badge className={wholesaler.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
          {wholesaler.approved ? 'Approved' : 'Pending'}
        </Badge>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <a href={`mailto:${wholesaler.email}`} className="text-blue-600 hover:underline">
                {wholesaler.email}
              </a>
            </div>
            {wholesaler.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <a href={`tel:${wholesaler.phone}`} className="text-blue-600 hover:underline">
                  {wholesaler.phone}
                </a>
              </div>
            )}
            {wholesaler.address && (
              <div className="col-span-2">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Address</p>
                <p className="text-gray-700">{wholesaler.address}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Joined</p>
              <p className="text-gray-700">{new Date(wholesaler.createdAt).toLocaleDateString()}</p>
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
