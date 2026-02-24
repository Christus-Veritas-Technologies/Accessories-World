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
import { Loader2, Plus, Download, Trash2, DollarSign, TrendingUp } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Sale {
  id: string;
  saleNumber: string;
  revenue: number;
  profit: number;
  quantity: number;
  notes?: string;
  createdAt: string;
}

export default function SalesPage() {
  const [newSaleOpen, setNewSaleOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [amountFilter, setAmountFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: sales, isLoading, error } = useSales() as any;

  // Filter sales
  const filteredSales = useMemo(() => {
    if (!sales) return [];

    return sales.filter((sale: Sale) => {
      const matchesSearch =
        sale.saleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sale.notes && sale.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesAmount =
        !amountFilter || Number(sale.revenue) >= parseFloat(amountFilter);

      return matchesSearch && matchesAmount;
    });
  }, [sales, searchTerm, amountFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate totals
  const totals = useMemo(() => {
    return filteredSales.reduce(
      (acc, sale: Sale) => ({
        revenue: acc.revenue + Number(sale.revenue),
        profit: acc.profit + Number(sale.profit),
        quantity: acc.quantity + sale.quantity,
        count: acc.count + 1,
      }),
      { revenue: 0, profit: 0, quantity: 0, count: 0 }
    );
  }, [filteredSales]);

  // Export as PDF
  const exportAsPDF = () => {
    // Create a new PDF document with Word-like styling
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Sales Report', 14, 22);
    
    // Add summary info
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);
    
    // Reset text color
    doc.setTextColor(0);
    
    // Add summary statistics
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
    
    // Add table
    const tableData = paginatedSales.map((sale: Sale) => [
      sale.saleNumber,
      new Date(sale.createdAt).toLocaleDateString(),
      `$${Number(sale.revenue).toFixed(2)}`,
      `$${Number(sale.profit).toFixed(2)}`,
      sale.quantity.toString(),
      sale.notes || '-',
    ]);
    
    (doc as any).autoTable({
      head: [['Sale #', 'Date', 'Revenue', 'Profit', 'Quantity', 'Notes']],
      body: tableData,
      startY: yPos + 8,
      headStyles: {
        fillColor: [220, 38, 38],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      bodyStyles: {
        textColor: [50, 50, 50],
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { left: 14, right: 14 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 30 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
        4: { cellWidth: 20 },
        5: { cellWidth: 50 },
      },
    });
    
    // Save the PDF
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
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {totals.count}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm font-medium text-gray-600">
              Total Revenue
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ${totals.revenue.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm font-medium text-gray-600">
              Total Profit
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ${totals.profit.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Quantity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {totals.quantity}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Search
              </label>
              <Input
                type="text"
                placeholder="Search sale number or notes..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Minimum Amount
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">$</span>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amountFilter}
                  onChange={(e) => {
                    setAmountFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setAmountFilter('');
                  setCurrentPage(1);
                }}
              >
                Clear Filters
              </Button>
              <Button
                variant="outline"
                gap="2"
                onClick={exportAsPDF}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Sales ({filteredSales.length} total, showing{' '}
            {paginatedSales.length})
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
                      <TableHead>Date</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Profit</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSales.map((sale: Sale) => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-mono text-sm font-semibold text-gray-900">
                          {sale.saleNumber}
                        </TableCell>
                        <TableCell>
                          {new Date(sale.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-semibold text-green-600">
                          ${Number(sale.revenue).toFixed(2)}
                        </TableCell>
                        <TableCell className="font-semibold text-blue-600">
                          ${Number(sale.profit).toFixed(2)}
                        </TableCell>
                        <TableCell>{sale.quantity}</TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {sale.notes ? (
                            <span className="truncate max-w-xs">{sale.notes}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
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
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={
                            currentPage === page
                              ? 'bg-red-600 hover:bg-red-700'
                              : ''
                          }
                        >
                          {page}
                        </Button>
                      )
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
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
