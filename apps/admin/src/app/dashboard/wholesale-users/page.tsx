'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Trash2, Search } from 'lucide-react';
import { useWholesalers, useApproveWholesaler, useRevokeWholesaler } from '@/hooks/queries';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
  const [search, setSearch] = useState('');
  const { data: wholesalers = [], isLoading, error } = useWholesalers();
  const approveMutation = useApproveWholesaler();
  const revokeMutation = useRevokeWholesaler();

  const handleToggle = (id: string, isApproved: boolean) => {
    if (isApproved) {
      revokeMutation.mutate(id);
    } else {
      approveMutation.mutate(id);
    }
  };

  const filteredWholesalers = (wholesalers || []).filter(
    (w: Wholesaler) =>
      w.businessName.toLowerCase().includes(search.toLowerCase()) ||
      w.email.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return <div className="py-12 text-center">Loading wholesalers...</div>;
  }

  const approved = filteredWholesalers.filter((w: Wholesaler) => w.approved);
  const pending = filteredWholesalers.filter((w: Wholesaler) => !w.approved);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Wholesale Users</h1>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-600">
          Error: {error.message}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Search by business name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Pending Section */}
      {pending.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <div className="p-6">
            <h2 className="font-semibold text-yellow-900 mb-4">
              Pending Approval ({pending.length})
            </h2>
            <div className="space-y-3">
              {pending.map((wholesaler: Wholesaler) => (
                <WholesalerCard
                  key={wholesaler.id}
                  wholesaler={wholesaler}
                  onToggle={() => handleToggle(wholesaler.id, wholesaler.approved)}
                  isLoading={approveMutation.isPending || revokeMutation.isPending}
                />
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Approved Section */}
      <div className="space-y-4">
        <h2 className="font-semibold text-lg">Approved Wholesalers ({approved.length})</h2>
        {approved.length > 0 ? (
          <div className="space-y-3">
            {approved.map((wholesaler: Wholesaler) => (
              <WholesalerCard
                key={wholesaler.id}
                wholesaler={wholesaler}
                onToggle={() => handleToggle(wholesaler.id, wholesaler.approved)}
                isLoading={approveMutation.isPending || revokeMutation.isPending}
              />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center text-gray-500">
            No approved wholesalers
          </Card>
        )}
      </div>
    </div>
  );
}

function WholesalerCard({
  wholesaler,
  onToggle,
  isLoading,
}: {
  wholesaler: Wholesaler;
  onToggle: () => void;
  isLoading: boolean;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{wholesaler.businessName}</h3>
          <p className="text-sm text-gray-600">{wholesaler.contactPerson}</p>
          <div className="mt-3 space-y-1 text-sm">
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
          <Button
            onClick={onToggle}
            disabled={isLoading}
            size="sm"
            variant={wholesaler.approved ? 'default' : 'outline'}
            className={wholesaler.approved ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            {wholesaler.approved ? (
              <>
                <CheckCircle className="h-4 w-4 mr-1" />
                Approved
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-1" />
                Pending
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
