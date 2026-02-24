'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useCreateSale, useCustomers } from '@/hooks/queries';
import { Loader2, Plus } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NewCustomerDialog } from '@/components/new-customer-dialog';

interface NewSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewSaleDialog({ open, onOpenChange }: NewSaleDialogProps) {
  const [formData, setFormData] = useState({
    customerId: '',
    productName: '',
    revenue: '',
    profit: '',
    quantity: '',
    notes: '',
  });
  const [newCustomerOpen, setNewCustomerOpen] = useState(false);

  const { data: customers = [] } = useCustomers() as any;
  const createSaleMutation = useCreateSale();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.revenue.trim()) {
      toast.error('Revenue is required');
      return;
    }

    if (!formData.profit.trim()) {
      toast.error('Profit is required');
      return;
    }

    if (!formData.quantity.trim()) {
      toast.error('Quantity is required');
      return;
    }

    try {
      await createSaleMutation.mutateAsync({
        customerId: formData.customerId || null,
        productName: formData.productName || null,
        revenue: parseFloat(formData.revenue),
        profit: parseFloat(formData.profit),
        quantity: parseInt(formData.quantity, 10),
        notes: formData.notes || null,
      });

      toast.success('Sale recorded successfully');
      setFormData({
        customerId: '',
        productName: '',
        revenue: '',
        profit: '',
        quantity: '',
        notes: '',
      });
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to record sale'
      );
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record New Sale</DialogTitle>
            <DialogDescription>
              Add a new sale with revenue, profit, and quantity information.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Card className="p-4 space-y-4">
              {/* Customer Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold">Customer (Optional)</label>
                <div className="flex gap-2">
                  <Select value={formData.customerId} onValueChange={(value) => setFormData(prev => ({ ...prev, customerId: value }))}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a customer..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No customer</SelectItem>
                      {customers.map((customer: any) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setNewCustomerOpen(true)}
                    disabled={createSaleMutation.isPending}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Product Name */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold">Product(s) Purchased</label>
                <Input
                  type="text"
                  name="productName"
                  placeholder="e.g. Silver Necklace, Gold Ring..."
                  value={formData.productName}
                  onChange={handleChange}
                  disabled={createSaleMutation.isPending}
                />
              </div>

              {/* Revenue */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold">Revenue *</label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">$</span>
                  <Input
                    type="number"
                    name="revenue"
                    placeholder="0.00"
                    value={formData.revenue}
                    onChange={handleChange}
                    disabled={createSaleMutation.isPending}
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              {/* Profit */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold">Profit *</label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">$</span>
                  <Input
                    type="number"
                    name="profit"
                    placeholder="0.00"
                    value={formData.profit}
                    onChange={handleChange}
                    disabled={createSaleMutation.isPending}
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold">Quantity *</label>
                <Input
                  type="number"
                  name="quantity"
                  placeholder="0"
                  value={formData.quantity}
                  onChange={handleChange}
                  disabled={createSaleMutation.isPending}
                  min="1"
                  step="1"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold">Notes</label>
                <Textarea
                  name="notes"
                  placeholder="Add any additional notes about this sale..."
                  value={formData.notes}
                  onChange={handleChange}
                  disabled={createSaleMutation.isPending}
                  rows={3}
                  className="resize-none"
                />
              </div>

              {createSaleMutation.error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-600 text-sm">
                  {createSaleMutation.error.message}
                </div>
              )}
            </Card>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createSaleMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-red-600 hover:bg-red-700"
                disabled={createSaleMutation.isPending}
              >
                {createSaleMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Recording...
                  </>
                ) : (
                  'Record Sale'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <NewCustomerDialog open={newCustomerOpen} onOpenChange={setNewCustomerOpen} />
    </>
  );
}
