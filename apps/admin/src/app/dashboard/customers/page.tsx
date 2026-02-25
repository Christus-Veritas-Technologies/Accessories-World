'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomers, useTopBuyers, useDeleteCustomer } from '@/hooks/queries';
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
import { NewCustomerDialog } from '@/components/new-customer-dialog';
import { Download, Eye, Loader2, Plus, Trash2, TrendingUp, Users } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Customer {
  id: string;
  fullName: string;
  whatsapp: string;
  email?: string;
  totalSpent: number;
  salesCount: number;
  productNames: string[];
  createdAt: string;
}

export default function CustomersPage() {
  const router = useRouter();
  const [newCustomerOpen, setNewCustomerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: customers = [], isLoading, error } = useCustomers() as any;
  const { data: topBuyers = [] } = useTopBuyers() as any;
  const deleteCustomerMutation = useDeleteCustomer();

  // Filter customers
  const filteredCustomers = useMemo(() => {
    if (!customers) return [];

    return customers.filter((customer: Customer) => {
      const matchesSearch =
        !searchTerm ||
        customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.whatsapp.includes(searchTerm) ||
        (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesProduct =
        !productFilter ||
        customer.productNames.some((p) =>
          p.toLowerCase().includes(productFilter.toLowerCase())
        );

      const createdAt = new Date(customer.createdAt);
      const matchesDateFrom = !dateFrom || createdAt >= new Date(dateFrom);
      const matchesDateTo = !dateTo || createdAt <= new Date(dateTo + 'T23:59:59');

      return matchesSearch && matchesProduct && matchesDateFrom && matchesDateTo;
    });
  }, [customers, searchTerm, productFilter, dateFrom, dateTo]);

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = async (customerId: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    try {
      await deleteCustomerMutation.mutateAsync(customerId);
      toast.success('Customer deleted successfully');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete customer'
      );
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setProductFilter('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || productFilter || dateFrom || dateTo;

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(220, 38, 38);
    doc.text('Accessories World', 14, 20);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(13);
    doc.text('Customers Report', 14, 30);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleDateString()} — ${filteredCustomers.length} customers`, 14, 38);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (doc as any).autoTable({
      startY: 46,
      head: [['Name', 'WhatsApp', 'Email', 'Total Spent', 'Purchases', 'Joined']],
      body: filteredCustomers.map((c: Customer) => [
        c.fullName,
        c.whatsapp,
        c.email ?? '—',
        `$${Number(c.totalSpent).toFixed(2)}`,
        c.salesCount,
        new Date(c.createdAt).toLocaleDateString(),
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [220, 38, 38] },
    });
    doc.save('customers.pdf');
  };

  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-12">
          <p className="text-red-600">Error loading customers: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-1">Manage your business customers</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={exportPDF} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700 gap-2"
            onClick={() => setNewCustomerOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Top Buyers Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Highest Value Clients
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : topBuyers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No customer data yet</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {topBuyers.map((buyer: any, index: number) => (
                <div key={buyer.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{buyer.fullName}</p>
                      <p className="text-sm text-gray-600">{buyer.whatsapp}</p>
                    </div>
                    <div className="text-lg font-bold text-red-600">#{index + 1}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Spent:</span>
                      <span className="font-semibold text-green-600">
                        ${Number(buyer.totalSpent).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Purchases:</span>
                      <span className="font-semibold">{buyer.salesCount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Search & Filter</CardTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={resetFilters} className="text-gray-500 hover:text-gray-700">
                Clear filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Search</label>
              <Input
                type="text"
                placeholder="Name, WhatsApp, or email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Product Purchased</label>
              <Input
                type="text"
                placeholder="e.g. Necklace, Ring..."
                value={productFilter}
                onChange={(e) => {
                  setProductFilter(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Joined From</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Joined To</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Customers ({filteredCustomers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : paginatedCustomers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No customers found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>WhatsApp</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Products Bought</TableHead>
                      <TableHead className="text-right">Total Spent</TableHead>
                      <TableHead className="text-center">Purchases</TableHead>
                      <TableHead className="text-left">Joined</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedCustomers.map((customer: Customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-semibold text-gray-900">
                          {customer.fullName}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-gray-600">
                          {customer.whatsapp}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {customer.email || '-'}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 max-w-[180px]">
                          {customer.productNames?.length > 0 ? (
                            <span className="truncate block" title={customer.productNames.join(', ')}>
                              {customer.productNames.join(', ')}
                            </span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-green-600">
                          ${Number(customer.totalSpent).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 text-sm font-semibold">
                            {customer.salesCount}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(customer.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/dashboard/customers/${customer.id}`)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(customer.id)}
                              disabled={deleteCustomerMutation.isPending}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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

      <NewCustomerDialog open={newCustomerOpen} onOpenChange={setNewCustomerOpen} />
    </div>
  );
}
