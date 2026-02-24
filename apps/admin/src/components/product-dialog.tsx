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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateProduct, useCategories } from '@/hooks/queries';
import { Loader2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDialog({ open, onOpenChange }: ProductDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sku: '',
    categoryId: '',
    retailPrice: '',
    wholesalePrice: '',
    retailDiscount: '0',
    wholesaleDiscount: '0',
    stock: '',
    featured: false,
    description: '',
  });

  const createProductMutation = useCreateProduct();
  const { data: categories = [] } = useCategories();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (!formData.sku.trim()) {
      toast.error('SKU is required');
      return;
    }
    if (!formData.retailPrice) {
      toast.error('Retail price is required');
      return;
    }
    if (!formData.wholesalePrice) {
      toast.error('Wholesale price is required');
      return;
    }
    if (formData.stock === '') {
      toast.error('Stock quantity is required');
      return;
    }

    try {
      await createProductMutation.mutateAsync({
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        sku: formData.sku,
        categoryId: formData.categoryId || undefined,
        retailPrice: parseFloat(formData.retailPrice),
        wholesalePrice: parseFloat(formData.wholesalePrice),
        retailDiscount: parseFloat(formData.retailDiscount) || 0,
        wholesaleDiscount: parseFloat(formData.wholesaleDiscount) || 0,
        stock: parseInt(formData.stock),
        featured: formData.featured,
        description: formData.description || undefined,
      });

      toast.success('Product created successfully');
      setFormData({
        name: '',
        slug: '',
        sku: '',
        categoryId: '',
        retailPrice: '',
        wholesalePrice: '',
        retailDiscount: '0',
        wholesaleDiscount: '0',
        stock: '',
        featured: false,
        description: '',
      });
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create product'
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Create a new product with details including pricing and inventory information.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6 space-y-4">
            {/* Basic Information */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold">Product Name *</label>
              <Input
                type="text"
                name="name"
                placeholder="e.g., Premium Car Seat Cover"
                value={formData.name}
                onChange={handleChange}
                disabled={createProductMutation.isPending}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold">SKU *</label>
                <Input
                  type="text"
                  name="sku"
                  placeholder="e.g., CSC-001"
                  value={formData.sku}
                  onChange={handleChange}
                  disabled={createProductMutation.isPending}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold">Category</label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => handleSelectChange('categoryId', value)}
                  disabled={createProductMutation.isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat: Category) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold">Pricing</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-gray-600">Retail Price * ($)</label>
                  <Input
                    type="number"
                    name="retailPrice"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    value={formData.retailPrice}
                    onChange={handleChange}
                    disabled={createProductMutation.isPending}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-600">Wholesale Price * ($)</label>
                  <Input
                    type="number"
                    name="wholesalePrice"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    value={formData.wholesalePrice}
                    onChange={handleChange}
                    disabled={createProductMutation.isPending}
                  />
                </div>
              </div>
            </div>

            {/* Discounts */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold">Discounts (%)</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-gray-600">Retail Discount (%)</label>
                  <Input
                    type="number"
                    name="retailDiscount"
                    placeholder="0"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.retailDiscount}
                    onChange={handleChange}
                    disabled={createProductMutation.isPending}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-600">Wholesale Discount (%)</label>
                  <Input
                    type="number"
                    name="wholesaleDiscount"
                    placeholder="0"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.wholesaleDiscount}
                    onChange={handleChange}
                    disabled={createProductMutation.isPending}
                  />
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold">Stock Quantity *</label>
              <Input
                type="number"
                name="stock"
                placeholder="0"
                min="0"
                value={formData.stock}
                onChange={handleChange}
                disabled={createProductMutation.isPending}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold">Description</label>
              <textarea
                name="description"
                placeholder="Product description (optional)"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                disabled={createProductMutation.isPending}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Options */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  disabled={createProductMutation.isPending}
                  className="w-4 h-4 border border-gray-300 rounded cursor-pointer"
                />
                <span className="text-sm font-medium">Featured Product</span>
              </label>
            </div>

            {createProductMutation.error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-600 text-sm">
                {createProductMutation.error.message}
              </div>
            )}
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createProductMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-red-600 hover:bg-red-700"
              disabled={createProductMutation.isPending}
            >
              {createProductMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Product'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
