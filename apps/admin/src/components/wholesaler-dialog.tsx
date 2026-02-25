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
import { useCreateWholesaler } from '@/hooks/queries';
import { Loader2 } from 'lucide-react';

interface WholesalerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WholesalerDialog({ open, onOpenChange }: WholesalerDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const createWholesalerMutation = useCreateWholesaler();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('Phone number is required');
      return;
    }

    try {
      await createWholesalerMutation.mutateAsync({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      });

      toast.success('✅ Wholesaler created! Credentials sent via email & WhatsApp');
      setFormData({
        name: '',
        email: '',
        phone: '',
      });
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create wholesaler'
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Wholesaler</DialogTitle>
          <DialogDescription>
            Create a new wholesaler account. Password will be auto-generated and sent via email & WhatsApp.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Card className="p-4 space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold">Name *</label>
              <Input
                type="text"
                name="name"
                placeholder="e.g., John Doe"
                value={formData.name}
                onChange={handleChange}
                disabled={createWholesalerMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold">Email *</label>
              <Input
                type="email"
                name="email"
                placeholder="e.g., john@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={createWholesalerMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold">Phone Number * (WhatsApp)</label>
              <Input
                type="tel"
                name="phone"
                placeholder="e.g., +263784923973"
                value={formData.phone}
                onChange={handleChange}
                disabled={createWholesalerMutation.isPending}
              />
            </div>

            {createWholesalerMutation.error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-600 text-sm">
                {createWholesalerMutation.error.message}
              </div>
            )}
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createWholesalerMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-red-600 hover:bg-red-700"
              disabled={createWholesalerMutation.isPending}
            >
              {createWholesalerMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Wholesaler'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
