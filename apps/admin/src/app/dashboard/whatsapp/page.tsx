'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WhatsAppStatus {
  status: 'connected' | 'disconnected' | 'offline';
  qrCode?: string;
  lastUpdated?: string;
  logs?: string[];
}

export default function WhatsAppPage() {
  const [whatsappStatus, setWhatsappStatus] = useState<WhatsAppStatus>({
    status: 'disconnected',
  });
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);

  const fetchWhatsAppStatus = async () => {
    try {
      const response = await fetch('http://localhost:3004/api/whatsapp/status', {
        credentials: 'include',
      });
      const data = await response.json();
      setWhatsappStatus(data);
      if (data.logs) {
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Failed to fetch WhatsApp status:', error);
      setWhatsappStatus({ status: 'offline' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWhatsAppStatus();
    // Poll every 5 seconds for updates
    const interval = setInterval(fetchWhatsAppStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'disconnected':
        return 'bg-yellow-100 text-yellow-800';
      case 'offline':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return '✅';
      case 'disconnected':
        return '⏳';
      case 'offline':
        return '❌';
      default:
        return '❓';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <MessageCircle className="h-10 w-10 text-green-600" />
          <h1 className="text-3xl font-bold">WhatsApp Integration</h1>
        </div>
        <Button
          onClick={fetchWhatsAppStatus}
          variant="outline"
          className="gap-2"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Connection Status</span>
            <Badge className={getStatusColor(whatsappStatus.status)}>
              <span className="mr-2">{getStatusIcon(whatsappStatus.status)}</span>
              {whatsappStatus.status === 'connected'
                ? 'Connected'
                : whatsappStatus.status === 'disconnected'
                  ? 'Disconnected (Scanning QR)'
                  : 'Offline'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {whatsappStatus.lastUpdated && (
            <p className="text-sm text-gray-600">
              Last updated: {new Date(whatsappStatus.lastUpdated).toLocaleString()}
            </p>
          )}

          {whatsappStatus.status === 'disconnected' && whatsappStatus.qrCode ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-700">
                Scan the QR code below with your WhatsApp mobile device to connect:
              </p>
              <div className="flex justify-center p-6 bg-gray-50 rounded-lg">
                <img
                  src={`data:image/png;base64,${whatsappStatus.qrCode}`}
                  alt="WhatsApp QR Code"
                  className="w-64 h-64"
                />
              </div>
              <p className="text-xs text-gray-500 text-center">
                The QR code will refresh automatically as the session updates
              </p>
            </div>
          ) : whatsappStatus.status === 'connected' ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-green-700">
                ✅ WhatsApp is successfully connected and ready to send messages
              </p>
              <p className="text-xs text-gray-600">
                The agent will send notifications via WhatsApp for new accounts and orders.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium text-red-700">
                ❌ WhatsApp agent server is offline or unreachable
              </p>
              <p className="text-xs text-gray-600">
                Please check that the agent service is running on port 3004
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Logs Card */}
      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto bg-gray-900 rounded-lg p-4">
              {logs.map((log, index) => (
                <p
                  key={index}
                  className="font-mono text-xs text-green-400"
                >
                  {log}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">About WhatsApp Integration</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>
            • Accessories World uses WhatsApp Web to send automated notifications
          </p>
          <p>
            • New admin accounts receive credentials via WhatsApp
          </p>
          <p>
            • New wholesaler accounts receive connection details via WhatsApp
          </p>
          <p>
            • Order status updates are sent to customer phone numbers
          </p>
          <p>
            • The connection uses web.js library and requires a valid WhatsApp account
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
