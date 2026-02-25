'use client';

import { useState, useEffect } from 'react';
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
import { useCreateProduct, useUpdateProduct, useCategories } from '@/hooks/queries';
import { Loader2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  retailPrice: number;
  wholesalePrice: number;
  retailDiscount: number;
  wholesaleDiscount: number;
  stock: number;
  featured: boolean;
  active: boolean;
  category: { id: string; name: string; slug: string };
}

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
}

const emptyForm = {
  name: '',
  categoryId: '',
  retailPrice: '',
  wholesalePrice: '',
  retailDiscount: '0',
  wholesaleDiscount: '0',
  stock: '',
  featured: false,
  description: '',
};

export function ProductDialog({ open, onOpenChange, product }: ProductDialogProps) {
  const [formData, setFormData] = useState(emptyForm);

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  const isEdit = !!product;
  const isPending = createProductMutation.isPending || updateProductMutation.isPending;
  const mutationError = createProductMutation.error || updateProductMutation.error;

  // Sync form when dialog opens: populate for edit, reset for create
  useEffect(() => {
    if (open && product) {
      setFormData({
        name: product.name,
        categoryId: product.category?.id ?? '',
        retailPrice: String(product.retailPrice),
        wholesalePrice: String(product.wholesalePrice),
        retailDiscount: String(product.retailDiscount),
        wholesaleDiscount: String(product.wholesaleDiscount),
        stock: String(product.stock),
        featured: product.featured,
        description: product.description ?? '',
      });
    } else if (!open) {
      setFormData(emptyForm);
    }
  }, [open, product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Product name is required');
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

    const payload = {
      name: formData.name,
      categoryId: formData.categoryId || undefined,
      retailPrice: parseFloat(formData.retailPrice),
      wholesalePrice: parseFloat(formData.wholesalePrice),
      retailDiscount: parseFloat(formData.retailDiscount) || 0,
      wholesaleDiscount: parseFloat(formData.wholesaleDiscount) || 0,
      stock: parseInt(formData.stock),
      featured: formData.featured,
      description: formData.description || undefined,
    };

    try {
      if (isEdit) {
        await updateProductMutation.mutateAsync({ id: product.id, data: payload });
        toast.success('Product updated successfully');
      } else {
        await createProductMutation.mutateAsync({
          ...payload,
          slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
        });
        toast.success('Product created successfully');
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : `Failed to ${isEdit ? 'update' : 'create'} product`
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the product details below.'
              : 'Create a new product with details including pricing and inventory information.'}
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
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold">Category</label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => handleSelectChange('categoryId', value)}
                disabled={isPending || categoriesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={categoriesLoading ? 'Loading categories...' : 'Select a category'} />
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
                    disabled={isPending}
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
                    disabled={isPending}
                  />
                </div>
              </div>
            </div>

            {/* Discounts */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold">Discounts (%)</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-gray-600">Retail Discount</label>
                  <Input
                    type="number"
                    name="retailDiscount"
                    placeholder="0"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.retailDiscount}
                    onChange={handleChange}
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-600">Wholesale Discount</label>
                  <Input
                    type="number"
                    name="wholesaleDiscount"
                    placeholder="0"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.wholesaleDiscount}
                    onChange={handleChange}
                    disabled={isPending}
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
                disabled={isPending}
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
                disabled={isPending}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Featured */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  disabled={isPending}
                  className="w-4 h-4 border border-gray-300 rounded cursor-pointer"
                />
                <span className="text-sm font-medium">Featured Product</span>
              </label>
            </div>

            {mutationError && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-600 text-sm">
                {mutationError.message}
              </div>
            )}
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-red-600 hover:bg-red-700"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEdit ? 'Saving...' : 'Creating...'}
                </>
              ) : isEdit ? (
                'Save Changes'
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
