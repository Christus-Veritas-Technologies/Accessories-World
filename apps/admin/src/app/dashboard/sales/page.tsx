'use client';

import { useState, useMemo } from 'react';
import { useSales } from '@/hooks/queries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NewSaleDialog } from '@/components/new-sale-dialog';
import { Loader2, Plus, Download, DollarSign, TrendingUp, CheckCircle2 } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Sale {
  id: string;
  saleNumber: string;
  productName?: string;
  customer?: { fullName: string };
  revenue: number;
  profit: number;
  quantity: number;
  invoiceSent: boolean;
  notes?: string;
  createdAt: string;
}

export default function SalesPage() {
  const [newSaleOpen, setNewSaleOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [amountFilter, setAmountFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: sales, isLoading, error } = useSales() as any;

  const filteredSales = useMemo(() => {
    if (!sales) return [];

    return sales.filter((sale: Sale) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        sale.saleNumber.toLowerCase().includes(q) ||
        (sale.productName && sale.productName.toLowerCase().includes(q)) ||
        (sale.customer?.fullName && sale.customer.fullName.toLowerCase().includes(q)) ||
        (sale.notes && sale.notes.toLowerCase().includes(q));

      const matchesAmount =
        !amountFilter || Number(sale.revenue) >= parseFloat(amountFilter);

      const saleDate = new Date(sale.createdAt);
      const matchesDateFrom = !dateFrom || saleDate >= new Date(dateFrom);
      const matchesDateTo = !dateTo || saleDate <= new Date(dateTo + 'T23:59:59');

      return matchesSearch && matchesAmount && matchesDateFrom && matchesDateTo;
    });
  }, [sales, searchTerm, amountFilter, dateFrom, dateTo]);

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totals = useMemo(() => {
    return filteredSales.reduce(
      (acc: any, sale: Sale) => ({
        revenue: acc.revenue + Number(sale.revenue),
        profit: acc.profit + Number(sale.profit),
        quantity: acc.quantity + sale.quantity,
        count: acc.count + 1,
      }),
      { revenue: 0, profit: 0, quantity: 0, count: 0 }
    );
  }, [filteredSales]);

  const clearFilters = () => {
    setSearchTerm('');
    setAmountFilter('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || amountFilter || dateFrom || dateTo;

  const exportAsPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Sales Report', 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);
    doc.setTextColor(0);

    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Summary Statistics', 14, 45);

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const summaryData = [
      ['Total Sales', totals.count.toString()],
      ['Total Revenue', `$${totals.revenue.toFixed(2)}`],
      ['Total Profit', `$${totals.profit.toFixed(2)}`],
      ['Total Quantity', totals.quantity.toString()],
      ['Average Profit per Sale', `$${(totals.profit / totals.count || 0).toFixed(2)}`],
    ];

    let yPos = 52;
    summaryData.forEach(([label, value]) => {
      doc.text(`${label}:`, 14, yPos);
      doc.text(value, 120, yPos);
      yPos += 7;
    });

    const tableData = filteredSales.map((sale: Sale) => [
      sale.saleNumber,
      sale.customer?.fullName || '-',
      sale.productName || '-',
      new Date(sale.createdAt).toLocaleDateString(),
      `$${Number(sale.revenue).toFixed(2)}`,
      `$${Number(sale.profit).toFixed(2)}`,
      sale.quantity.toString(),
      sale.notes || '-',
    ]);

    (doc as any).autoTable({
      head: [['Sale #', 'Customer', 'Product', 'Date', 'Revenue', 'Profit', 'Qty', 'Notes']],
      body: tableData,
      startY: yPos + 8,
      headStyles: {
        fillColor: [220, 38, 38],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      bodyStyles: { textColor: [50, 50, 50] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 14, right: 14 },
    });

    doc.save(`sales-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-12">
          <p className="text-red-600">Error loading sales: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales</h1>
          <p className="text-gray-600 mt-1">Track and manage all sales records</p>
        </div>
        <Button
          className="bg-red-600 hover:bg-red-700 gap-2"
          onClick={() => setNewSaleOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add New Sale
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totals.count}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm font-medium text-gray-600">
              Total Revenue <DollarSign className="h-4 w-4 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">${totals.revenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm font-medium text-gray-600">
              Total Profit <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">${totals.profit.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Quantity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totals.quantity}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filters & Search</CardTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-500">
                Clear filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2 space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Search</label>
              <Input
                type="text"
                placeholder="Sale #, customer, product, notes..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Min Amount</label>
              <div className="flex items-center gap-1">
                <span className="text-gray-500 text-sm">$</span>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amountFilter}
                  onChange={(e) => { setAmountFilter(e.target.value); setCurrentPage(1); }}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date From</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date To</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="outline" className="gap-2" onClick={exportAsPDF}>
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Sales ({filteredSales.length} total, showing {paginatedSales.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : paginatedSales.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No sales found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sale #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Profit</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-center">Invoice</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSales.map((sale: Sale) => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-mono text-sm font-semibold text-gray-900">
                          {sale.saleNumber}
                        </TableCell>
                        <TableCell className="text-sm text-gray-700">
                          {sale.customer?.fullName || <span className="text-gray-400">—</span>}
                        </TableCell>
                        <TableCell className="text-sm text-gray-700 max-w-[140px]">
                          {sale.productName ? (
                            <span className="truncate block" title={sale.productName}>
                              {sale.productName}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(sale.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-green-600">
                          ${Number(sale.revenue).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-blue-600">
                          ${Number(sale.profit).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">{sale.quantity}</TableCell>
                        <TableCell className="text-center">
                          {sale.invoiceSent ? (
                            <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Sent
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 max-w-[140px]">
                          {sale.notes ? (
                            <span className="truncate block" title={sale.notes}>
                              {sale.notes}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 border-t pt-4">
                  <div className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={currentPage === page ? 'bg-red-600 hover:bg-red-700' : ''}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <NewSaleDialog open={newSaleOpen} onOpenChange={setNewSaleOpen} />
    </div>
  );
}
