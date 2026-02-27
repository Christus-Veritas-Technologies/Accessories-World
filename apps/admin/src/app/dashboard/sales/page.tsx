'use client';

import { useState, useMemo } from 'react';
import { useSales, useKpis } from '@/hooks/queries';
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
import { Loader2, Plus, DollarSign, Hash } from 'lucide-react';

interface Sale {
  id: string;
  saleNumber: string;
  amount: number;
  customerName?: string;
  customerWhatsapp?: string;
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
  const { data: kpis } = useKpis() as any;

  const filteredSales = useMemo(() => {
    if (!sales) return [];

    return sales.filter((sale: Sale) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        sale.saleNumber.toLowerCase().includes(q) ||
        (sale.customerName && sale.customerName.toLowerCase().includes(q)) ||
        (sale.customerWhatsapp && sale.customerWhatsapp.includes(q));

      const matchesAmount =
        !amountFilter || Number(sale.amount) >= parseFloat(amountFilter);

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

  const retailTotal = useMemo(
    () => filteredSales.reduce((acc: number, sale: Sale) => acc + Number(sale.amount), 0),
    [filteredSales]
  );

  const wholesaleTotal = kpis?.revenue?.total ?? 0;
  const combinedTotal = retailTotal + wholesaleTotal;

  const clearFilters = () => {
    setSearchTerm('');
    setAmountFilter('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || amountFilter || dateFrom || dateTo;

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
            <CardTitle className="flex items-center justify-between text-sm font-medium text-gray-600">
              Retail Sales <DollarSign className="h-4 w-4 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">${retailTotal.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm font-medium text-gray-600">
              Wholesale Sales <DollarSign className="h-4 w-4 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">${Number(wholesaleTotal).toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm font-medium text-gray-600">
              Total Sales <DollarSign className="h-4 w-4 text-red-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">${combinedTotal.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm font-medium text-gray-600">
              Transactions <Hash className="h-4 w-4 text-purple-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{filteredSales.length}</div>
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2 space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Search</label>
              <Input
                type="text"
                placeholder="Sale #, customer name, WhatsApp..."
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
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">From</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">To</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
                />
              </div>
            </div>
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
                      <TableHead>WhatsApp</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSales.map((sale: Sale) => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-mono text-sm font-semibold text-gray-900">
                          {sale.saleNumber}
                        </TableCell>
                        <TableCell className="text-sm text-gray-700">
                          {sale.customerName || <span className="text-gray-400">—</span>}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {sale.customerWhatsapp || <span className="text-gray-400">—</span>}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(sale.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-green-600">
                          ${Number(sale.amount).toFixed(2)}
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
