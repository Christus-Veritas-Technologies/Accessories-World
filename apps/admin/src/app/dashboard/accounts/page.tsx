'use client';

import { useState } from 'react';
import { Plus, Trash2, Shield, User } from 'lucide-react';
import { useAccounts, useCreateAccount, useDeleteAccount } from '@/hooks/queries';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Account {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  createdAt: string;
}

export default function AccountsPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', isAdmin: false });
  const { data: accounts = [], isLoading, error } = useAccounts();
  const createMutation = useCreateAccount();
  const deleteMutation = useDeleteAccount();

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      { ...form, name: form.name.toLowerCase() },
      {
        onSuccess: () => {
          setForm({ name: '', email: '', isAdmin: false });
          setShowForm(false);
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure? This action cannot be undone.')) return;
    deleteMutation.mutate(id);
  };

  if (isLoading) {
    return <div className="py-12 text-center">Loading accounts...</div>;
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
          <h1 className="text-3xl font-bold">Admin Accounts</h1>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-red-600 hover:bg-red-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Account
        </Button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-600">
          Error: {error.message}
        </div>
      )}

      {createMutation.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-600">
          Error creating account
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <Card className="border-2">
          <form onSubmit={handleCreateAccount} className="p-6 space-y-4">
            <h2 className="font-semibold text-lg">Create New Account</h2>
            <Input
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <Input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isAdmin}
                onChange={(e) => setForm({ ...form, isAdmin: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Make this user an administrator</span>
            </label>
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Account'}
              </Button>
              <Button
                type="button"
                onClick={() => setShowForm(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Accounts Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Name</th>
                <th className="px-6 py-3 text-left font-semibold">Email</th>
                <th className="px-6 py-3 font-semibold">Role</th>
                <th className="px-6 py-3 text-left font-semibold">Created</th>
                <th className="px-6 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.length > 0 ? (
                accounts.map((account: Account) => (
                  <tr key={account.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium">{account.name}</td>
                    <td className="px-6 py-3">{account.email}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-center">
                        {account.isAdmin ? (
                          <Badge className="bg-red-100 text-red-800">
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <User className="h-3 w-3 mr-1" />
                            Staff
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-xs text-gray-500">
                      {new Date(account.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3">
                      <button
                        onClick={() => handleDelete(account.id)}
                        disabled={deleteMutation.isPending}
                        className="rounded p-1 hover:bg-red-50 text-red-600 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No accounts found
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
