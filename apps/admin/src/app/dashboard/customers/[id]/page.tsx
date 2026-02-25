'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomer } from '@/hooks/queries';
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
import { ArrowLeft, CheckCircle2, Download, Loader2, User } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Sale {
  id: string;
  saleNumber: string;
  productName?: string;
  quantity: number;
  revenue: number;
  profit: number;
  invoiceSent: boolean;
  notes?: string;
  createdAt: string;
}

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: customer, isLoading, error } = useCustomer(id);

  const exportPDF = () => {
    if (!customer) return;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor(220, 38, 38);
    doc.text('Accessories World', 14, 20);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(13);
    doc.text('Customer Report', 14, 30);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 38);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Customer Details', 14, 52);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const infoLines = [
      ['Full Name', customer.fullName],
      ['WhatsApp', customer.whatsapp],
      ['Email', customer.email ?? '—'],
      ['Joined', new Date(customer.createdAt).toLocaleDateString()],
    ];
    infoLines.forEach(([label, value], i) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, 14, 60 + i * 7);
      doc.setFont('helvetica', 'normal');
      doc.text(String(value), 55, 60 + i * 7);
    });

    if (customer.sales?.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Purchase History', 14, 96);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (doc as any).autoTable({
        startY: 102,
        head: [['Date', 'Sale #', 'Product', 'Qty', 'Revenue', 'Profit', 'Invoice']],
        body: customer.sales.map((sale: Sale) => [
          new Date(sale.createdAt).toLocaleDateString(),
          `#${sale.saleNumber}`,
          sale.productName ?? '—',
          sale.quantity,
          `$${Number(sale.revenue).toFixed(2)}`,
          `$${Number(sale.profit).toFixed(2)}`,
          sale.invoiceSent ? 'Sent' : '—',
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [220, 38, 38] },
      });
    }

    doc.save(`customer-${customer.fullName.replace(/\s+/g, '-').toLowerCase()}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <p className="text-red-600">Customer not found.</p>
      </div>
    );
  }

  const totalSpent = customer.sales?.reduce((s: number, sale: Sale) => s + Number(sale.revenue), 0) ?? 0;
  const totalProfit = customer.sales?.reduce((s: number, sale: Sale) => s + Number(sale.profit), 0) ?? 0;
  const purchaseCount = customer.sales?.length ?? 0;

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Customers
        </Button>
        <Button onClick={exportPDF} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      {/* Title */}
      <div className="flex items-center gap-3">
        <User className="h-7 w-7 text-red-600" />
        <div>
          <h1 className="text-2xl font-bold">{customer.fullName}</h1>
          <p className="text-sm text-gray-500 font-mono">{customer.whatsapp}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Spent', value: `$${totalSpent.toFixed(2)}` },
          { label: 'Total Profit', value: `$${totalProfit.toFixed(2)}` },
          { label: 'Purchases', value: purchaseCount },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-red-600">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Customer details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Customer Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {[
              { label: 'Full Name', value: customer.fullName },
              { label: 'WhatsApp', value: customer.whatsapp },
              { label: 'Email', value: customer.email ?? '—' },
              { label: 'Joined', value: new Date(customer.createdAt).toLocaleDateString() },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
                <p className="font-semibold text-gray-900 mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Purchase history */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Purchase History ({purchaseCount})</CardTitle>
        </CardHeader>
        <CardContent>
          {purchaseCount === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">No purchases recorded yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Sale #</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                  <TableHead className="text-center">Invoice</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.sales.map((sale: Sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(sale.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-mono text-sm">#{sale.saleNumber}</TableCell>
                    <TableCell>{sale.productName ?? '—'}</TableCell>
                    <TableCell className="text-right">{sale.quantity}</TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      ${Number(sale.revenue).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right text-gray-600">
                      ${Number(sale.profit).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      {sale.invoiceSent ? (
                        <Badge className="bg-green-100 text-green-700 gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Sent
                        </Badge>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
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
