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
import { useChangePassword } from '@/hooks/queries';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordDialog({
  open,
  onOpenChange,
}: ChangePasswordDialogProps) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const changePasswordMutation = useChangePassword();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.currentPassword.trim()) {
      toast.error('Current password is required');
      return;
    }

    if (!formData.newPassword.trim()) {
      toast.error('New password is required');
      return;
    }

    if (formData.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      toast.success('Password changed successfully');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to change password');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Update your account password. Choose a strong password with at least 8 characters.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Current Password
            </label>
            <Input
              type="password"
              name="currentPassword"
              placeholder="Enter your current password"
              value={formData.currentPassword}
              onChange={handleChange}
              disabled={changePasswordMutation.isPending}
              required
            />
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <Input
              type="password"
              name="newPassword"
              placeholder="Enter your new password"
              value={formData.newPassword}
              onChange={handleChange}
              disabled={changePasswordMutation.isPending}
              required
            />
            <p className="text-xs text-gray-500">Minimum 8 characters</p>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <Input
              type="password"
              name="confirmPassword"
              placeholder="Re-enter your new password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={changePasswordMutation.isPending}
              required
            />
          </div>

          {/* Error Message */}
          {changePasswordMutation.error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex gap-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{changePasswordMutation.error.message}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={changePasswordMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-brand-primary hover:bg-brand-primary-light"
              disabled={changePasswordMutation.isPending}
            >
              {changePasswordMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Password'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
