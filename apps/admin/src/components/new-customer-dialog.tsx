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
import { useCreateCustomer } from '@/hooks/queries';
import { Loader2 } from 'lucide-react';

interface NewCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewCustomerDialog({ open, onOpenChange }: NewCustomerDialogProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    whatsapp: '',
    email: '',
  });

  const createCustomerMutation = useCreateCustomer();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      toast.error('Full name is required');
      return;
    }

    if (!formData.whatsapp.trim()) {
      toast.error('WhatsApp number is required');
      return;
    }

    try {
      await createCustomerMutation.mutateAsync({
        fullName: formData.fullName,
        whatsapp: formData.whatsapp,
        email: formData.email || null,
      });

      toast.success('Customer created successfully');
      setFormData({
        fullName: '',
        whatsapp: '',
        email: '',
      });
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create customer'
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogDescription>
            Create a new customer record with their contact information.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Card className="p-4 space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold">Full Name *</label>
              <Input
                type="text"
                name="fullName"
                placeholder="Enter customer name"
                value={formData.fullName}
                onChange={handleChange}
                disabled={createCustomerMutation.isPending}
              />
            </div>

            {/* WhatsApp */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold">WhatsApp Number *</label>
              <Input
                type="tel"
                name="whatsapp"
                placeholder="+1234567890"
                value={formData.whatsapp}
                onChange={handleChange}
                disabled={createCustomerMutation.isPending}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold">Email (Optional)</label>
              <Input
                type="email"
                name="email"
                placeholder="customer@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={createCustomerMutation.isPending}
              />
            </div>

            {createCustomerMutation.error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-600 text-sm">
                {createCustomerMutation.error.message}
              </div>
            )}
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createCustomerMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-red-600 hover:bg-red-700"
              disabled={createCustomerMutation.isPending}
            >
              {createCustomerMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Add Customer'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
