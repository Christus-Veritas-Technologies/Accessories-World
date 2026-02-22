"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Shield, User } from "lucide-react";

interface Account {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  createdAt: string;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", isAdmin: false });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/accounts`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch accounts");
      setAccounts(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading accounts");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/accounts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );
      if (!res.ok) throw new Error("Failed to create account");
      const newAccount = await res.json();
      setAccounts([newAccount, ...accounts]);
      setForm({ name: "", email: "", isAdmin: false });
      setShowForm(false);
      alert(
        "Account created! A password has been generated and sent to their email."
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating account");
    }
  };

  const deleteAccount = async (id: string) => {
    if (!confirm("Are you sure? This action cannot be undone.")) return;
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/accounts/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to delete account");
      setAccounts(accounts.filter((a) => a.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting account");
    }
  };

  if (loading) return <div className="py-12 text-center">Loading accounts...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Accounts</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-white hover:bg-brand-primary-light"
        >
          <Plus className="h-5 w-5" />
          Add Account
        </button>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-4 text-red-600">{error}</div>}

      {/* Create Form */}
      {showForm && (
        <form
          onSubmit={handleCreateAccount}
          className="rounded-lg border border-border bg-card p-6 space-y-4"
        >
          <h2 className="font-semibold">Create New Account</h2>
          <input
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-border px-3 py-2"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-lg border border-border px-3 py-2"
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
            <button
              type="submit"
              className="rounded-lg bg-brand-primary px-4 py-2 text-white hover:bg-brand-primary-light"
            >
              Create Account
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-border px-4 py-2 hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Accounts Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3 text-left">Created</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {accounts.length > 0 ? (
              accounts.map((account) => (
                <tr key={account.id} className="border-b border-border hover:bg-muted/50">
                  <td className="px-6 py-3 font-medium">{account.name}</td>
                  <td className="px-6 py-3">{account.email}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-center gap-1">
                      {account.isAdmin ? (
                        <>
                          <Shield className="h-4 w-4 text-brand-primary" />
                          <span className="text-xs font-semibold text-brand-primary">
                            Admin
                          </span>
                        </>
                      ) : (
                        <>
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Staff</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-xs text-muted-foreground">
                    {new Date(account.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => deleteAccount(account.id)}
                      className="rounded p-1 hover:bg-red-50 text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                  No accounts found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
