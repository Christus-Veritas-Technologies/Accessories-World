'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useProduct } from '@/hooks/queries';
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
import { ArrowLeft, Download, Loader2, Package, Star } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  order: {
    id: string;
    orderNumber: string;
    status: string;
    createdAt: string;
    wholesaler: { id: string; businessName: string };
  };
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: product, isLoading, error } = useProduct(id);

  const exportPDF = () => {
    if (!product) return;
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.setTextColor(220, 38, 38);
    doc.text('Accessories World', 14, 20);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(13);
    doc.text('Product Report', 14, 30);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 38);

    // Product info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Product Details', 14, 52);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const infoLines = [
      ['Name', product.name],
      ['Category', product.category?.name ?? '—'],
      ['Retail Price', `$${Number(product.retailPrice).toFixed(2)}`],
      ['Wholesale Price', `$${Number(product.wholesalePrice).toFixed(2)}`],
      ['Retail Discount', `${product.retailDiscount}%`],
      ['Wholesale Discount', `${product.wholesaleDiscount}%`],
      ['Stock', String(product.stock)],
      ['Featured', product.featured ? 'Yes' : 'No'],
      ['Status', product.active ? 'Active' : 'Inactive'],
    ];
    infoLines.forEach(([label, value], i) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, 14, 60 + i * 7);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 60, 60 + i * 7);
    });

    // Wholesale order history
    if (product.orderItems?.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Wholesale Order History', 14, 130);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (doc as any).autoTable({
        startY: 136,
        head: [['Date', 'Order #', 'Wholesaler', 'Qty', 'Unit Price', 'Subtotal', 'Status']],
        body: product.orderItems.map((item: OrderItem) => [
          new Date(item.order.createdAt).toLocaleDateString(),
          `#${item.order.orderNumber}`,
          item.order.wholesaler.businessName,
          item.quantity,
          `$${Number(item.price).toFixed(2)}`,
          `$${(Number(item.price) * item.quantity).toFixed(2)}`,
          item.order.status,
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [220, 38, 38] },
      });
    }

    doc.save(`product-${product.name.replace(/\s+/g, '-').toLowerCase()}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <p className="text-red-600">Product not found.</p>
      </div>
    );
  }

  const totalOrders = product.orderItems?.length ?? 0;
  const totalQtySold = product.orderItems?.reduce((s: number, i: OrderItem) => s + i.quantity, 0) ?? 0;
  const totalRevenue = product.orderItems?.reduce((s: number, i: OrderItem) => s + Number(i.price) * i.quantity, 0) ?? 0;

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Button>
        <Button onClick={exportPDF} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      {/* Title */}
      <div className="flex items-center gap-3">
        <Package className="h-7 w-7 text-red-600" />
        <div>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="text-sm text-gray-500">{product.category?.name}</p>
        </div>
        {product.featured && (
          <Badge className="bg-yellow-100 text-yellow-800 gap-1">
            <Star className="h-3 w-3" />
            Featured
          </Badge>
        )}
        <Badge className={product.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
          {product.active ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Wholesale Orders', value: totalOrders },
          { label: 'Units Sold (Wholesale)', value: totalQtySold },
          { label: 'Wholesale Revenue', value: `$${totalRevenue.toFixed(2)}` },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-red-600">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Product details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4 text-sm">
            {[
              { label: 'Retail Price', value: `$${Number(product.retailPrice).toFixed(2)}` },
              { label: 'Wholesale Price', value: `$${Number(product.wholesalePrice).toFixed(2)}` },
              { label: 'Retail Discount', value: `${product.retailDiscount}%` },
              { label: 'Wholesale Discount', value: `${product.wholesaleDiscount}%` },
              { label: 'Stock', value: product.stock },
              { label: 'SKU', value: product.sku || '—' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
                <p className="font-semibold text-gray-900 mt-0.5">{value}</p>
              </div>
            ))}
          </div>
          {product.description && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Description</p>
              <p className="text-sm text-gray-700 mt-1">{product.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wholesale order history */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Wholesale Order History ({totalOrders})</CardTitle>
        </CardHeader>
        <CardContent>
          {totalOrders === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">No wholesale orders for this product yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Order #</TableHead>
                  <TableHead>Wholesaler</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {product.orderItems.map((item: OrderItem) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(item.order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      #{item.order.orderNumber}
                    </TableCell>
                    <TableCell>{item.order.wholesaler.businessName}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">${Number(item.price).toFixed(2)}</TableCell>
                    <TableCell className="text-right font-semibold">
                      ${(Number(item.price) * item.quantity).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[item.order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {item.order.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
