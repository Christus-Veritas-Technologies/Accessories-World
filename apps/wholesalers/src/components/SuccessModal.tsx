'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
}

export function SuccessModal({ isOpen, onClose, phoneNumber }: SuccessModalProps) {
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  if (!isVisible) return null;

  const formattedPhone = phoneNumber.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        <div className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 rounded-full animate-pulse" />
              <CheckCircle className="w-16 h-16 text-green-500 relative" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Received</h2>
          <p className="text-gray-600 mb-6">
            Your order has been sent to WhatsApp
          </p>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">WhatsApp Number</p>
            <p className="text-lg font-bold text-green-700">+263 {formattedPhone}</p>
          </div>

          <div className="space-y-3 mb-6 text-left">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                <span className="text-xs font-bold text-green-700">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Check your WhatsApp</p>
                <p className="text-sm text-gray-600">Your order details have been sent</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                <span className="text-xs font-bold text-green-700">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Click Confirm</p>
                <p className="text-sm text-gray-600">Confirm your order in the WhatsApp message</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                <span className="text-xs font-bold text-green-700">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Sales support incoming</p>
                <p className="text-sm text-gray-600">Our team will contact you shortly</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 mb-6 px-4">
            Keep this browser window open to receive further updates. Your cart has been cleared.
          </p>

          <Button
            onClick={onClose}
            className="w-full bg-green-500 hover:bg-green-600 text-white"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
