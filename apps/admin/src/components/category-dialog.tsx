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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useCreateCategory } from '@/hooks/queries';
import { Loader2, Search } from 'lucide-react';
import * as Icons from 'lucide-react';

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// List of commonly used lucide-react icons for products
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
  'Shoe',
  'ShoppingBag',
  'Gift',
  'Award',
  'Settings',
  'Tool',
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
  'Airpods',
  'Bluetooth',
  'Radio',
  'Tv',
  'Gamepad2',
  'Joystick',
  'BarChart3',
  'TrendingUp',
  'Zap',
  'AlertCircle',
  'CheckCircle',
  'Clock',
  'Droplet',
  'Flame',
  'Cloud',
  'Sun',
  'Moon',
  'Wind',
  'Droplets',
  'Folder',
  'Grid',
  'List',
  'Map',
  'MapPin',
  'Navigation',
  'Compass',
  'Anchor',
  'Eye',
  'EyeOff',
  'Smile',
  'ThumbsUp',
  'Hand',
  'Flag',
  'Bookmark',
  'Layers',
  'Lock',
  'Unlock',
  'Key',
  'Search',
  'Filter',
  'Download',
  'Upload',
  'Share2',
  'Copy',
  'Edit',
  'Trash2',
  'Plus',
  'Minus',
  'MoreVertical',
  'MoreHorizontal',
] as const;

type IconName = typeof PRODUCT_ICONS[number];

// Create icon components map outside of component to avoid re-renders
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

// Small display component to show icon
function IconDisplay({ iconName }: { iconName: IconName }) {
  const IconComponent = getIconComponent(iconName);
  return React.createElement(IconComponent, { className: 'h-4 w-4' });
}

export function CategoryDialog({ open, onOpenChange }: CategoryDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    icon: 'Package' as IconName,
  });
  const [showIconPicker, setShowIconPicker] = useState(false);
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
      setFormData({
        name: '',
        icon: 'Package',
      });
      setIconSearch('');
      setShowIconPicker(false);
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create category'
      );
    }
  };

  // Get the icon component for display
  const selectedIconName = formData.icon as IconName;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
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

            {/* Icon Picker */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold">Icon</label>
              <Popover open={showIconPicker} onOpenChange={setShowIconPicker}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start gap-2"
                    disabled={createCategoryMutation.isPending}
                  >
                    <IconDisplay iconName={selectedIconName} />
                    <span>{formData.icon}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96 sm:w-[28rem] p-4" side="bottom" align="start">
                  <div className="space-y-3">
                    {/* Icon Search */}
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search icons..."
                        value={iconSearch}
                        onChange={(e) => setIconSearch(e.target.value)}
                        className="pl-8"
                      />
                    </div>

                    {/* Icons Grid - Responsive */}
                    <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-60 overflow-y-auto">
                      {filteredIcons.map((iconName) => {
                        return (
                          <button
                            key={iconName}
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                icon: iconName,
                              }));
                              setShowIconPicker(false);
                              setIconSearch('');
                            }}
                            className={`flex items-center justify-center h-10 rounded-md border transition-all hover:scale-110 cursor-pointer ${
                              formData.icon === iconName
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                            title={iconName}
                          >
                            {React.createElement(getIconComponent(iconName as IconName), {
                              className: 'h-5 w-5',
                            })}
                          </button>
                        );
                      })}
                    </div>

                    {filteredIcons.length === 0 && (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        No icons found
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
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
