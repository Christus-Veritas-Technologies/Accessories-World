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
import { useCreateSale } from '@/hooks/queries';
import { Loader2 } from 'lucide-react';

interface NewSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewSaleDialog({ open, onOpenChange }: NewSaleDialogProps) {
  const [formData, setFormData] = useState({
    revenue: '', // ✅ rename amount -> revenue to match backend ReceiptData
    customerName: '',
    customerWhatsapp: '',
  });

  const createSaleMutation = useCreateSale();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.revenue.trim()) {
      toast.error('Amount is required');
      return;
    }

    const revenueNumber = Number(formData.revenue);
    if (!Number.isFinite(revenueNumber) || revenueNumber <= 0) {
      toast.error('Enter a valid amount greater than 0');
      return;
    }

    try {
      await createSaleMutation.mutateAsync({
        revenue: revenueNumber, // ✅ send revenue to backend
        customerName: formData.customerName || null,
        customerWhatsapp: formData.customerWhatsapp || null,
      });

      toast.success('Sale recorded successfully');
      setFormData({ revenue: '', customerName: '', customerWhatsapp: '' });
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to record sale');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col max-w-md">
        <DialogHeader>
          <DialogTitle>Record New Sale</DialogTitle>
          <DialogDescription>
            Enter the amount paid and optionally the customer details to send a WhatsApp receipt.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Card className="p-4 space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold">Amount Paid *</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">$</span>
                <Input
                  type="number"
                  name="revenue" // ✅ was "amount"
                  placeholder="0.00"
                  value={formData.revenue}
                  onChange={handleChange}
                  disabled={createSaleMutation.isPending}
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold">Customer Name</label>
              <Input
                type="text"
                name="customerName"
                placeholder="e.g. Jane Doe"
                value={formData.customerName}
                onChange={handleChange}
                disabled={createSaleMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold">WhatsApp Number</label>
              <Input
                type="tel"
                name="customerWhatsapp"
                placeholder="e.g. +263771234567"
                value={formData.customerWhatsapp}
                onChange={handleChange}
                disabled={createSaleMutation.isPending}
              />
              <p className="text-xs text-gray-500">A receipt will be sent via WhatsApp if provided.</p>
            </div>

            {createSaleMutation.error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-600 text-sm">
                {createSaleMutation.error.message}
              </div>
            )}
          </Card>

          <div className="flex justify-end gap-3 pt-1 border-t">
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
  );
}