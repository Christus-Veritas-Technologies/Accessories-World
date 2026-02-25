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
    businessName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    generatePassword: true,
  });

  const createWholesalerMutation = useCreateWholesaler();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.businessName.trim()) {
      toast.error('Business name is required');
      return;
    }
    if (!formData.contactPerson.trim()) {
      toast.error('Contact person name is required');
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
        businessName: formData.businessName,
        contactPerson: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        address: formData.address || undefined,
        generatePassword: formData.generatePassword,
      });

      toast.success('🎉 Wholesaler created and activated! Account ready to use.\n✉️ Credentials sent via email & WhatsApp');
      setFormData({
        businessName: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        generatePassword: true,
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Wholesaler</DialogTitle>
          <DialogDescription>
            Create a new wholesale user account. They will receive welcome credentials via email and WhatsApp.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6 space-y-4">
            {/* Business Information */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold">Business Name *</label>
              <Input
                type="text"
                name="businessName"
                placeholder="e.g., ABC Traders"
                value={formData.businessName}
                onChange={handleChange}
                disabled={createWholesalerMutation.isPending}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold">Contact Person *</label>
                <Input
                  type="text"
                  name="contactPerson"
                  placeholder="e.g., John Doe"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  disabled={createWholesalerMutation.isPending}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold">Email *</label>
                <Input
                  type="email"
                  name="email"
                  placeholder="e.g., john@abc.co.zw"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={createWholesalerMutation.isPending}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold">Phone Number * (with WhatsApp)</label>
                <Input
                  type="tel"
                  name="phone"
                  placeholder="e.g., +263784923973"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={createWholesalerMutation.isPending}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold">Address</label>
                <Input
                  type="text"
                  name="address"
                  placeholder="e.g., 123 Main Street, Harare"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={createWholesalerMutation.isPending}
                />
              </div>
            </div>

            {/* Password Settings */}
            <div className="space-y-3 border-t pt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="generatePassword"
                  checked={formData.generatePassword}
                  onChange={handleChange}
                  disabled={createWholesalerMutation.isPending}
                  className="w-4 h-4 border border-gray-300 rounded cursor-pointer"
                />
                <span className="text-sm font-medium">Generate Random Password (8 characters)</span>
              </label>
              <p className="text-xs text-gray-500 ml-7">
                If enabled, a secure random password will be generated and sent to the wholesaler via email and WhatsApp.
              </p>
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
