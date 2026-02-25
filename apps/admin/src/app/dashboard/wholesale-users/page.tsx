'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Trash2, Search, Plus, Mail, Phone, Eye, Download } from 'lucide-react';
import { useWholesalers, useApproveWholesaler, useRevokeWholesaler } from '@/hooks/queries';
import { WholesalerDialog } from '@/components/wholesaler-dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [showDialog, setShowDialog] = useState(false);
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

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(220, 38, 38);
    doc.text('Accessories World', 14, 20);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(13);
    doc.text('Wholesale Users Report', 14, 30);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleDateString()} — ${filteredWholesalers.length} wholesalers`, 14, 38);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (doc as any).autoTable({
      startY: 46,
      head: [['Business Name', 'Contact Person', 'Email', 'Phone', 'Status', 'Joined']],
      body: filteredWholesalers.map((w: Wholesaler) => [
        w.businessName,
        w.contactPerson,
        w.email,
        w.phone ?? '—',
        w.approved ? 'Approved' : 'Pending',
        new Date(w.createdAt).toLocaleDateString(),
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [220, 38, 38] },
    });
    doc.save('wholesale-users.pdf');
  };

  if (isLoading) {
    return <div className="py-12 text-center">Loading wholesalers...</div>;
  }

  const approved = filteredWholesalers.filter((w: Wholesaler) => w.approved);
  const pending = filteredWholesalers.filter((w: Wholesaler) => !w.approved);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Wholesale Users</h1>
        <div className="flex items-center gap-3">
          <Button onClick={exportPDF} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
          <Button
            onClick={() => setShowDialog(true)}
            className="bg-red-600 hover:bg-red-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Wholesaler
          </Button>
        </div>
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
                  onView={() => router.push(`/dashboard/wholesale-users/${wholesaler.id}`)}
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
                onView={() => router.push(`/dashboard/wholesale-users/${wholesaler.id}`)}
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
  onView,
  isLoading,
}: {
  wholesaler: Wholesaler;
  onToggle: () => void;
  onView: () => void;
  isLoading: boolean;
}) {
  const handleEmailClick = () => {
    window.location.href = `mailto:${wholesaler.email}`;
  };

  const handleWhatsAppClick = () => {
    const message = `Hi ${wholesaler.contactPerson}, I'm reaching out from Accessories World`;
    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = wholesaler.phone.replace(/[^\d+]/g, '');
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-lg">{wholesaler.businessName}</h3>
              <p className="text-sm text-gray-600">{wholesaler.contactPerson}</p>
            </div>
            <Badge variant={wholesaler.approved ? 'default' : 'secondary'} className={wholesaler.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
              {wholesaler.approved ? 'Approved' : 'Pending'}
            </Badge>
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
            {wholesaler.address && (
              <div className="col-span-1 md:col-span-2">
                <p className="text-gray-600">
                  <strong>Address:</strong> {wholesaler.address}
                </p>
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
