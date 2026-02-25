'use client';

import { useState, useMemo } from 'react';
import React from 'react';
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
import { useCreateCategory } from '@/hooks/queries';
import { Loader2, Search } from 'lucide-react';
import * as Icons from 'lucide-react';

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PRODUCT_ICONS = [
  'Package',
  'Headphones',
  'Watch',
  'Glasses',
  'Smartphone',
  'Laptop',
  'Camera',
  'Zap',
  'Home',
  'Heart',
  'Star',
  'Shirt',
  'ShoppingBag',
  'Gift',
  'Award',
  'Settings',
  'Wrench',
  'Hammer',
  'Lightbulb',
  'Battery',
  'Wifi',
  'Volume2',
  'Music',
  'Video',
  'Image',
  'FileText',
  'BookOpen',
  'Briefcase',
  'Cpu',
  'HardDrive',
  'Monitor',
  'Keyboard',
  'Mouse',
  'Tablet',
  'Bluetooth',
  'Radio',
  'Tv',
  'Gamepad2',
  'Joystick',
  'BarChart3',
  'TrendingUp',
  'AlertCircle',
  'CheckCircle',
  'Clock',
  'Droplet',
  'Flame',
  'Cloud',
  'Sun',
  'Moon',
  'Wind',
  'Folder',
  'Grid',
  'List',
  'Map',
  'MapPin',
  'Navigation',
  'Compass',
  'Anchor',
  'Eye',
  'Smile',
  'ThumbsUp',
  'Flag',
  'Bookmark',
  'Layers',
  'Lock',
  'Key',
  'Filter',
  'Download',
  'Upload',
  'Share2',
  'Copy',
  'Edit',
  'Trash2',
  'Plus',
  'Minus',
] as const;

type IconName = typeof PRODUCT_ICONS[number];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const iconComponentsMap: Record<string, any> = {};
PRODUCT_ICONS.forEach((iconName) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const icon = (Icons as any)[iconName];
  iconComponentsMap[iconName] = icon || Icons.Package;
});

const getIconComponent = (iconName: IconName) => {
  return iconComponentsMap[iconName] || Icons.Package;
};

export function CategoryDialog({ open, onOpenChange }: CategoryDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    icon: 'Package' as IconName,
  });
  const [iconSearch, setIconSearch] = useState('');

  const createCategoryMutation = useCreateCategory();

  const filteredIcons = useMemo(() => {
    if (!iconSearch.trim()) return PRODUCT_ICONS;
    return PRODUCT_ICONS.filter((icon) =>
      icon.toLowerCase().includes(iconSearch.toLowerCase())
    );
  }, [iconSearch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      await createCategoryMutation.mutateAsync({
        name: formData.name,
        slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
        icon: formData.icon,
      });

      toast.success('Category created successfully');
      setFormData({ name: '', icon: 'Package' });
      setIconSearch('');
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create category'
      );
    }
  };

  const SelectedIcon = getIconComponent(formData.icon as IconName);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Category</DialogTitle>
          <DialogDescription>
            Add a new product category with a name and icon.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Card className="p-4 space-y-4">
            {/* Category Name */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold">Category Name *</label>
              <Input
                type="text"
                name="name"
                placeholder="e.g., Audio Accessories"
                value={formData.name}
                onChange={handleChange}
                disabled={createCategoryMutation.isPending}
              />
            </div>

            {/* Icon Picker — always visible */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold">Icon</label>
                <span className="flex items-center gap-1.5 text-sm font-medium text-red-600">
                  <SelectedIcon className="h-4 w-4" />
                  {formData.icon}
                </span>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search icons..."
                  value={iconSearch}
                  onChange={(e) => setIconSearch(e.target.value)}
                  className="pl-8"
                  disabled={createCategoryMutation.isPending}
                />
              </div>

              {/* Icons Grid */}
              {filteredIcons.length > 0 ? (
                <div className="grid grid-cols-9 gap-1.5 max-h-44 overflow-y-auto pr-1">
                  {filteredIcons.map((iconName) => {
                    const IconComp = getIconComponent(iconName as IconName);
                    const isSelected = formData.icon === iconName;
                    return (
                      <button
                        key={iconName}
                        type="button"
                        title={iconName}
                        disabled={createCategoryMutation.isPending}
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, icon: iconName }))
                        }
                        className={`flex items-center justify-center h-9 w-9 rounded-md border transition-colors cursor-pointer ${
                          isSelected
                            ? 'border-red-500 bg-red-50 text-red-600 shadow-sm ring-1 ring-red-400'
                            : 'border-gray-200 bg-white text-gray-500 hover:border-red-300 hover:bg-red-50/50 hover:text-red-500'
                        }`}
                      >
                        <IconComp className="h-4 w-4" />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="py-4 text-center text-sm text-gray-500">No icons found</p>
              )}
            </div>

            {createCategoryMutation.error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-600 text-sm">
                {createCategoryMutation.error.message}
              </div>
            )}
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createCategoryMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-red-600 hover:bg-red-700"
              disabled={createCategoryMutation.isPending}
            >
              {createCategoryMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Category'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
