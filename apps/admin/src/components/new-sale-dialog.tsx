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
import { Loader2, Plus, Trash2 } from 'lucide-react';

interface MinifiedProduct {
  name: string;
  price: string;
}

interface NewSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewSaleDialog({ open, onOpenChange }: NewSaleDialogProps) {
  const [formData, setFormData] = useState({
    products: [{ name: '', price: '' }] as MinifiedProduct[],
    customerName: '',
    customerPhone: '',
    customerWhatsapp: '',
  });

  const createSaleMutation = useCreateSale();

  const handleProductChange = (index: number, field: keyof MinifiedProduct, value: string) => {
    const newProducts = [...formData.products];
    newProducts[index][field] = value;
    setFormData((prev) => ({ ...prev, products: newProducts }));
  };

  const handleAddProduct = () => {
    setFormData((prev) => ({
      ...prev,
      products: [...prev.products, { name: '', price: '' }],
    }));
  };

  const handleRemoveProduct = (index: number) => {
    if (formData.products.length > 1) {
      setFormData((prev) => ({
        ...prev,
        products: prev.products.filter((_, i) => i !== index),
      }));
    } else {
      toast.error('At least one product is required');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateTotal = () => {
    return formData.products.reduce((sum, product) => {
      const price = parseFloat(product.price) || 0;
      return sum + price;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate products
    if (formData.products.length === 0) {
      toast.error('At least one product is required');
      return;
    }

    for (const product of formData.products) {
      if (!product.name.trim()) {
        toast.error('Product name is required for all items');
        return;
      }
      if (!product.price.trim()) {
        toast.error('Product price is required for all items');
        return;
      }
      const price = parseFloat(product.price);
      if (!Number.isFinite(price) || price <= 0) {
        toast.error('Each product price must be a valid number greater than 0');
        return;
      }
    }

    const total = calculateTotal();
    if (total <= 0) {
      toast.error('Total amount must be greater than 0');
      return;
    }

    try {
      await createSaleMutation.mutateAsync({
        revenue: total,
        customerName: formData.customerName || null,
        customerPhone: formData.customerPhone || null,
        customerWhatsapp: formData.customerWhatsapp || null,
        products: formData.products,
      });

      toast.success('Sale recorded successfully');
      setFormData({
        products: [{ name: '', price: '' }],
        customerName: '',
        customerPhone: '',
        customerWhatsapp: '',
      });
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to record sale');
    }
  };

  const total = calculateTotal();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record New Sale</DialogTitle>
          <DialogDescription>
            Enter product details and optionally the customer info to send a WhatsApp receipt.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Card className="p-4 space-y-4">
            {/* Products Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold">Products *</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddProduct}
                  disabled={createSaleMutation.isPending}
                  className="gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Add Product
                </Button>
              </div>

              {formData.products.map((product, index) => (
                <div key={index} className="flex gap-2 items-end p-3 bg-gray-50 rounded border">
                  <div className="flex-1 space-y-1">
                    <label className="text-xs text-gray-600">Product Name</label>
                    <Input
                      type="text"
                      value={product.name}
                      onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                      placeholder="e.g. Phone Case"
                      disabled={createSaleMutation.isPending}
                    />
                  </div>
                  <div className="w-24 space-y-1">
                    <label className="text-xs text-gray-600">Price</label>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500">$</span>
                      <Input
                        type="number"
                        value={product.price}
                        onChange={(e) => handleProductChange(index, 'price', e.target.value)}
                        placeholder="0.00"
                        disabled={createSaleMutation.isPending}
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveProduct(index)}
                    disabled={createSaleMutation.isPending || formData.products.length === 1}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {/* Total */}
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded border border-blue-200">
                <span className="text-sm font-semibold text-gray-700">Total Amount:</span>
                <span className="text-lg font-bold text-blue-600">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Customer Details */}
            <div className="space-y-2 border-t pt-4">
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
              <label className="block text-sm font-semibold">Phone Number</label>
              <Input
                type="tel"
                name="customerPhone"
                placeholder="e.g. +263771234567"
                value={formData.customerPhone}
                onChange={handleChange}
                disabled={createSaleMutation.isPending}
              />
              <p className="text-xs text-gray-500">Customer's phone number (printed on receipt).</p>
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