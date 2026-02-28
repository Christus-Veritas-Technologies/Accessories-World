'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageCircle } from 'lucide-react'

interface WhatsAppDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (phoneNumber: string) => Promise<void>
  isLoading?: boolean
}

export function WhatsAppDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: WhatsAppDialogProps) {
  const [phoneNumber, setPhoneNumber] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phoneNumber.trim()) return
    try {
      await onSubmit(phoneNumber)
      setPhoneNumber('')
    } catch (error) {
      console.error('Error submitting order:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Order via WhatsApp</DialogTitle>
          <DialogDescription>
            Enter your phone number to receive your order confirmation via WhatsApp
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-2">
              Phone Number (without country code)
            </label>
            <Input
              id="phone"
              type="tel"
              placeholder="7123456789"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={isLoading}
              required
            />
            <p className="text-xs text-gray-500 mt-1">Format: 7XXXXXXXXX</p>
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !phoneNumber.trim()}
              className="flex gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              {isLoading ? 'Sending...' : 'Send via WhatsApp'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
