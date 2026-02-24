'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { useProducts, useDeleteProduct } from '@/hooks/queries';
import { ProductDialog } from '@/components/product-dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Product {
  id: string;
  name: string;
  sku?: string;
  retailPrice: number;
  wholesalePrice: number;
  retailDiscount: number;
  wholesaleDiscount: number;
  stock: number;
  featured: boolean;
  active: boolean;
  category: { id: string; name: string; slug: string };
}

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const { data: products = [], isLoading, error } = useProducts();
  const deleteProductMutation = useDeleteProduct();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    deleteProductMutation.mutate(id);
  };

  const filteredProducts = (products || []).filter(
    (p: Product) =>
      p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return <div className="py-12 text-center">Loading products...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src="/logo-aw.jpg"
            alt="Accessories World"
            className="h-10 w-10 object-contain"
          />
          <h1 className="text-3xl font-bold">Products</h1>
        </div>
        <Button
          onClick={() => setShowDialog(true)}
          className="bg-red-600 hover:bg-red-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Product
        </Button>
      </div>

      <ProductDialog open={showDialog} onOpenChange={setShowDialog} />

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-600">
          Error loading products: {error.message}
        </div>
      )}

      {deleteProductMutation.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-600">
          Error deleting product
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Products Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Name</th>
                <th className="px-6 py-3 text-right font-semibold">Retail Price</th>
                <th className="px-6 py-3 text-right font-semibold">Wholesale Price</th>
                <th className="px-6 py-3 text-right font-semibold">Stock</th>
                <th className="px-6 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product: Product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.category.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right">
                      ${Number(product.retailPrice).toFixed(2)}
                      {Number(product.retailDiscount) > 0 && (
                        <span className="ml-1 text-xs text-red-600">
                          -{Number(product.retailDiscount).toFixed(1)}%
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-right">
                      ${Number(product.wholesalePrice).toFixed(2)}
                      {Number(product.wholesaleDiscount) > 0 && (
                        <span className="ml-1 text-xs text-red-600">
                          -{Number(product.wholesaleDiscount).toFixed(1)}%
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Badge
                        variant={product.stock < 10 ? 'destructive' : 'secondary'}
                      >
                        {product.stock}
                      </Badge>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <button className="rounded p-1 hover:bg-gray-100">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={deleteProductMutation.isPending}
                          className="rounded p-1 hover:bg-red-50 text-red-600 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
