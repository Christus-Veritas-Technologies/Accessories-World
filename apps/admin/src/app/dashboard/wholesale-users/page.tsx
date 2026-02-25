'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Mail, Phone, Eye } from 'lucide-react';
import { useWholesalers } from '@/hooks/queries';
import { WholesalerDialog } from '@/components/wholesaler-dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Wholesaler {
  id: string;
  email: string;
  name: string;
  phone: string;
  createdAt: string;
}

export default function WholesaleUsersPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const { data: wholesalers = [], isLoading, error } = useWholesalers();

  const filteredWholesalers = (wholesalers || []).filter(
    (w: Wholesaler) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.email.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return <div className="py-12 text-center">Loading wholesalers...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Wholesale Users</h1>
        <Button
          onClick={() => setShowDialog(true)}
          className="bg-red-600 hover:bg-red-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New Wholesaler
        </Button>
      </div>

      <WholesalerDialog open={showDialog} onOpenChange={setShowDialog} />

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
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Wholesalers List */}
      {filteredWholesalers.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          No wholesalers found
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredWholesalers.map((wholesaler: Wholesaler) => (
            <WholesalerCard
              key={wholesaler.id}
              wholesaler={wholesaler}
              onView={() => router.push(`/dashboard/wholesale-users/${wholesaler.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function WholesalerCard({
  wholesaler,
  onView,
}: {
  wholesaler: Wholesaler;
  onView: () => void;
}) {
  const handleEmailClick = () => {
    window.location.href = `mailto:${wholesaler.email}`;
  };

  const handleWhatsAppClick = () => {
    const message = `Hi ${wholesaler.name}, I'm reaching out from Accessories World`;
    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = wholesaler.phone.replace(/[^\d+]/g, '');
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="mb-2">
            <h3 className="font-semibold text-lg">{wholesaler.name}</h3>
          </div>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <a href={`mailto:${wholesaler.email}`} className="text-blue-600 hover:underline truncate">
                {wholesaler.email}
              </a>
            </div>
            {wholesaler.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <a href={`tel:${wholesaler.phone}`} className="text-blue-600 hover:underline">
                  {wholesaler.phone}
                </a>
              </div>
            )}
            <div className="text-xs text-gray-500">
              <strong>Joined:</strong> {new Date(wholesaler.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onView}
            className="p-2 rounded hover:bg-blue-50 text-blue-600"
            title="View details"
          >
            <Eye className="h-5 w-5" />
          </button>
          <button
            onClick={handleEmailClick}
            className="p-2 rounded hover:bg-blue-50 text-blue-600"
            title="Send email"
          >
            <Mail className="h-5 w-5" />
          </button>
          <button
            onClick={handleWhatsAppClick}
            className="p-2 rounded hover:bg-green-50 text-green-600"
            title="Send WhatsApp message"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.935 1.234l-.346.16-.36-.054-1.435-.364.74-2.702.054-.341-.2-.265A9.901 9.901 0 015.25 2c5.51 0 10 4.49 10 10s-4.49 10-10 10S.25 17.51.25 12s4.49-10 10-10" />
            </svg>
          </button>
        </div>
      </div>
    </Card>
  );
}
