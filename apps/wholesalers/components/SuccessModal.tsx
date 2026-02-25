'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface SuccessModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  phoneNumber: string
}

export function SuccessModal({
  open,
  onOpenChange,
  phoneNumber,
}: SuccessModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-center">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <DialogTitle>Order Sent Successfully!</DialogTitle>
          <DialogDescription className="pt-4">
            Your order has been sent to<br />
            <span className="font-semibold text-foreground">{phoneNumber}</span>
            <br />
            Our team will contact you shortly to confirm details.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 justify-center pt-6">
          <Link href="/dashboard">
            <Button variant="outline">
              Back to Dashboard
            </Button>
          </Link>
          <Link href="/dashboard/products">
            <Button>
              Continue Shopping
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  )
}
