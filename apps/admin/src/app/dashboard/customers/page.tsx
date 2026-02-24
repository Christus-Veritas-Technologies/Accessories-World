'use client';

import { useState, useMemo } from 'react';
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
import { Loader2, Plus, Trash2, TrendingUp, Users } from 'lucide-react';
import { toast } from 'sonner';

interface Customer {
  id: string;
  fullName: string;
  whatsapp: string;
  email?: string;
  totalSpent: number;
  salesCount: number;
  createdAt: string;
}

export default function CustomersPage() {
  const [newCustomerOpen, setNewCustomerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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
        customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.whatsapp.includes(searchTerm) ||
        (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesSearch;
    });
  }, [customers, searchTerm]);

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
        <Button
          className="bg-red-600 hover:bg-red-700 gap-2"
          onClick={() => setNewCustomerOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {/* Top Buyers Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Top Buyers
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

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="text"
            placeholder="Search by name, WhatsApp, or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
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
                      <TableHead className="text-right">Total Spent</TableHead>
                      <TableHead className="text-center">Purchases</TableHead>
                      <TableHead className="text-left">Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
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
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(customer.id)}
                            disabled={deleteCustomerMutation.isPending}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
