"use client";

import { useState } from "react";
import { MessageCircle, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WhatsAppDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (phoneNumber: string) => Promise<void>;
}

export function WhatsAppDialog({
  isOpen,
  onClose,
  onSubmit,
}: WhatsAppDialogProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleaned = phoneNumber.replace(/\D/g, "");
    if (cleaned.length < 10) {
      setError("Please enter a valid phone number (at least 10 digits)");
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(cleaned);
      setPhoneNumber("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send order");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
              <MessageCircle className="w-6 h-6 text-green-600" />
            </div>
            <DialogTitle>WhatsApp Order</DialogTitle>
          </div>
          <DialogDescription>
            Enter your WhatsApp number to complete your order. A sales
            representative will contact you to confirm.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp Number
            </label>
            <div className="flex gap-2">
              <select className="h-10 px-3 rounded-md border border-border bg-background text-gray-600 font-medium">
                <option>+263</option>
              </select>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="712 345 678"
                disabled={isLoading}
                className="flex-1 h-10 px-3 rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-green-500/20 disabled:opacity-50"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Format: 712 345 678 or 71-2345-678
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4" />
                  Send via WhatsApp
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
