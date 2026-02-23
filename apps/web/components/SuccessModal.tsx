"use client";

import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
}

export function SuccessModal({
  isOpen,
  onClose,
  phoneNumber,
}: SuccessModalProps) {
  const formattedPhone = phoneNumber.replace(
    /(\d{3})(\d{3})(\d{3})/,
    "$1 $2 $3",
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-pulse" />
            <CheckCircle className="w-16 h-16 text-green-500 relative" />
          </div>
        </div>

        <DialogHeader className="text-center">
          <DialogTitle>Order Received</DialogTitle>
          <DialogDescription>
            Your order has been sent to WhatsApp
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert variant="success">
            <AlertDescription>
              <div className="space-y-1">
                <p className="text-xs text-green-700">WhatsApp Number</p>
                <p className="font-bold text-green-700">
                  +263 {formattedPhone}
                </p>
              </div>
            </AlertDescription>
          </Alert>

          <div className="space-y-3 text-left">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-xs font-bold text-green-700">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">
                  Check your WhatsApp
                </p>
                <p className="text-xs text-gray-600">
                  Your order details have been sent
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-xs font-bold text-green-700">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">
                  Click Confirm
                </p>
                <p className="text-xs text-gray-600">
                  Confirm your order in the WhatsApp message
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-xs font-bold text-green-700">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">
                  Sales support incoming
                </p>
                <p className="text-xs text-gray-600">
                  Our team will contact you shortly
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Keep this browser window open to receive further updates. Your cart
            has been cleared.
          </p>

          <Button
            onClick={onClose}
            className="w-full bg-green-500 hover:bg-green-600 text-white"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
