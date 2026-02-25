'use client';

import { useEffect, useState } from 'react';
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
import { useUpdateAccount } from '@/hooks/queries';
import { Loader2 } from 'lucide-react';

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: {
    id: string;
    name: string;
    email: string;
    isAdmin: boolean;
  };
}

export function AccountDialog({ open, onOpenChange, account }: AccountDialogProps) {
  const [form, setForm] = useState({ name: '', email: '', isAdmin: false, password: '' });
  const updateMutation = useUpdateAccount();

  useEffect(() => {
    if (account) {
      setForm({ name: account.name || '', email: account.email || '', isAdmin: !!account.isAdmin, password: '' });
    } else {
      setForm({ name: '', email: '', isAdmin: false, password: '' });
    }
  }, [account, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!form.email.trim()) {
      toast.error('Email is required');
      return;
    }

    const data: any = { name: form.name, email: form.email, isAdmin: form.isAdmin };
    if (form.password && form.password.trim().length > 0) {
      if (form.password.length < 6) {
        toast.error('Password should be at least 6 characters');
        return;
      }
      data.password = form.password;
    }

    try {
      await updateMutation.mutateAsync({ id: account!.id, data });
      toast.success('Account updated');
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update account');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Account</DialogTitle>
          <DialogDescription>Update account details. Leave password blank to keep current password.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold">Name</label>
              <Input
                type="text"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                disabled={updateMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold">Email</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                disabled={updateMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold">New Password</label>
              <Input
                type="password"
                placeholder="Leave blank to keep existing password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                disabled={updateMutation.isPending}
              />
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isAdmin}
                onChange={(e) => setForm((p) => ({ ...p, isAdmin: e.target.checked }))}
                disabled={updateMutation.isPending}
                className="rounded"
              />
              <span className="text-sm">Administrator</span>
            </label>

            {updateMutation.error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-600 text-sm">
                {updateMutation.error instanceof Error ? updateMutation.error.message : 'Failed to update account'}
              </div>
            )}
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={updateMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
