"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Trash2, Search } from "lucide-react";

interface Wholesaler {
  id: string;
  email: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  address: string;
  approved: boolean;
  createdAt: string;
}

export default function WholesaleUsersPage() {
  const [wholesalers, setWholesalers] = useState<Wholesaler[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchWholesalers();
  }, []);

  const fetchWholesalers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/wholesalers`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch wholesalers");
      setWholesalers(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading wholesalers");
    } finally {
      setLoading(false);
    }
  };

  const toggleApproval = async (id: string, approved: boolean) => {
    try {
      const token = localStorage.getItem("admin_token");
      const endpoint = approved ? "revoke" : "approve";
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/wholesalers/${id}/${endpoint}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to update approval");
      const updated = await res.json();
      setWholesalers(
        wholesalers.map((w) => (w.id === id ? updated : w))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating wholesaler");
    }
  };

  const deleteWholesaler = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/wholesalers/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to delete wholesaler");
      setWholesalers(wholesalers.filter((w) => w.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting wholesaler");
    }
  };

  const filteredWholesalers = wholesalers.filter(
    (w) =>
      w.businessName.toLowerCase().includes(search.toLowerCase()) ||
      w.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="py-12 text-center">Loading wholesalers...</div>;

  const approved = filteredWholesalers.filter((w) => w.approved);
  const pending = filteredWholesalers.filter((w) => !w.approved);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Wholesale Users</h1>

      {error && <div className="rounded-lg bg-red-50 p-4 text-red-600">{error}</div>}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by business name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4"
        />
      </div>

      {/* Pending Section */}
      {pending.length > 0 && (
        <div className="space-y-4">
          <div className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4">
            <h2 className="font-semibold text-yellow-900 mb-3">
              Pending Approval ({pending.length})
            </h2>
            <div className="space-y-3">
              {pending.map((wholesaler) => (
                <WholesalerCard
                  key={wholesaler.id}
                  wholesaler={wholesaler}
                  onToggle={() => toggleApproval(wholesaler.id, wholesaler.approved)}
                  onDelete={() => deleteWholesaler(wholesaler.id)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Approved Section */}
      <div className="space-y-4">
        <h2 className="font-semibold text-foreground">
          Approved Wholesalers ({approved.length})
        </h2>
        {approved.length > 0 ? (
          <div className="space-y-3">
            {approved.map((wholesaler) => (
              <WholesalerCard
                key={wholesaler.id}
                wholesaler={wholesaler}
                onToggle={() => toggleApproval(wholesaler.id, wholesaler.approved)}
                onDelete={() => deleteWholesaler(wholesaler.id)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border p-8 text-center text-muted-foreground">
            No approved wholesalers
          </div>
        )}
      </div>
    </div>
  );
}

function WholesalerCard({
  wholesaler,
  onToggle,
  onDelete,
}: {
  wholesaler: Wholesaler;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold">{wholesaler.businessName}</h3>
          <p className="text-sm text-muted-foreground">{wholesaler.contactPerson}</p>
          <div className="mt-2 space-y-1 text-sm">
            <p>
              <strong>Email:</strong> {wholesaler.email}
            </p>
            {wholesaler.phone && (
              <p>
                <strong>Phone:</strong> {wholesaler.phone}
              </p>
            )}
            {wholesaler.address && (
              <p>
                <strong>Address:</strong> {wholesaler.address}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggle}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium flex items-center gap-1 transition-colors ${
              wholesaler.approved
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
            }`}
          >
            {wholesaler.approved ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Approved
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4" />
                Pending
              </>
            )}
          </button>
          <button
            onClick={onDelete}
            className="rounded p-1 hover:bg-red-50 text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
