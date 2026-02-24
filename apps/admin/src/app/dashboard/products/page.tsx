'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProducts, useDeleteProduct, useCategories } from '@/hooks/queries';
import { ProductDialog } from '@/components/product-dialog';
import { CategoryDialog } from '@/components/category-dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ITEMS_PER_PAGE = 10;

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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const { data: products = [], isLoading, error } = useProducts();
  const { data: categories = [] } = useCategories();
  const deleteProductMutation = useDeleteProduct();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    deleteProductMutation.mutate(id);
  };

  const filteredProducts = (products || []).filter(
    (p: Product) =>
      p.name.toLowerCase().includes(search.toLowerCase()) &&
      (selectedCategory === 'all' || p.category?.id === selectedCategory)
  );

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset to page 1 when search or category changes
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

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
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowCategoryDialog(true)}
            variant="outline"
            className="border-red-600 text-red-600 hover:bg-red-50"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Category
          </Button>
          <Button
            onClick={() => setShowProductDialog(true)}
            className="bg-red-600 hover:bg-red-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      <ProductDialog open={showProductDialog} onOpenChange={setShowProductDialog} />
      <CategoryDialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog} />

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

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filters */}
        {categories.length > 0 ? (
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Button
              onClick={() => handleCategoryChange('all')}
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              className={selectedCategory === 'all' ? 'bg-red-600 hover:bg-red-700' : ''}
              size="sm"
            >
              All
            </Button>
            {categories.map((cat: any) => (
              <Button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                className={selectedCategory === cat.id ? 'bg-red-600 hover:bg-red-700' : ''}
                size="sm"
              >
                {cat.name}
              </Button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              className="bg-red-600 hover:bg-red-700"
              size="sm"
              disabled
            >
              All Products
            </Button>
          </div>
        )}
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
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((product: Product) => (
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
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredProducts.length > 0 && (
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} products
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm font-medium">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
