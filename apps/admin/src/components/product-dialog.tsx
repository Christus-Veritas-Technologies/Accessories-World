'use client';

import { useState, useEffect, useRef } from 'react';
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
import { Loader2, Upload, X } from 'lucide-react';

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
  featured: boolean;
  active: boolean;
  category: { id: string; name: string; slug: string };
  images?: { url: string; alt?: string }[];
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
  featured: false,
  description: '',
};

export function ProductDialog({ open, onOpenChange, product }: ProductDialogProps) {
  const [formData, setFormData] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  const isEdit = !!product;
  const isPending = createProductMutation.isPending || updateProductMutation.isPending || isUploading;
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
        featured: product.featured,
        description: product.description ?? '',
      });
      setExistingImageUrl(product.images?.[0]?.url ?? null);
    } else if (!open) {
      setFormData(emptyForm);
      setImageFile(null);
      setImagePreview(null);
      setExistingImageUrl(null);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleClearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setExistingImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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

    let imageUrl: string | undefined = existingImageUrl ?? undefined;

    if (imageFile) {
      setIsUploading(true);
      try {
        const form = new FormData();
        form.append('file', imageFile);
        const res = await fetch('/api/upload', { method: 'POST', body: form });
        if (!res.ok) throw new Error('Image upload failed');
        const data = await res.json() as { url: string };
        imageUrl = data.url;
      } catch {
        toast.error('Failed to upload image. Please try again.');
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    const payload = {
      name: formData.name,
      categoryId: formData.categoryId || undefined,
      retailPrice: parseFloat(formData.retailPrice),
      wholesalePrice: parseFloat(formData.wholesalePrice),
      retailDiscount: parseFloat(formData.retailDiscount) || 0,
      wholesaleDiscount: parseFloat(formData.wholesaleDiscount) || 0,
      featured: formData.featured,
      description: formData.description || undefined,
      ...(imageUrl && { imageUrl }),
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

  const displayImage = imagePreview ?? existingImageUrl;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the product details below.'
              : 'Create a new product with details including pricing information.'}
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

            {/* Product Image */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold">Product Image</label>
              <div className="flex items-center gap-4">
                {/* Preview */}
                {displayImage ? (
                  <div className="relative w-20 h-20 rounded-md border border-gray-200 overflow-hidden flex-shrink-0">
                    {isUploading ? (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-red-600" />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleClearImage}
                        disabled={isPending}
                        className="absolute top-1 right-1 z-10 rounded-full bg-white shadow p-0.5 hover:bg-red-50"
                        title="Remove image"
                      >
                        <X className="h-3 w-3 text-gray-600" />
                      </button>
                    )}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={displayImage} alt="Product preview" className="w-full h-full object-cover" />
                  </div>
                ) : null}

                {/* Upload button */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isPending}
                    className="hidden"
                    id="product-image-input"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {displayImage ? 'Replace image' : 'Upload image'}
                  </Button>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP — max 10MB</p>
                </div>
              </div>
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
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : isPending ? (
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
