'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, MessageCircle, Share2, ArrowLeft, Star, Loader } from 'lucide-react';
import { useProductDetail } from '@/hooks/queries';
import { useCart } from '@/store/cart';
import { WhatsAppDialog } from '@/components/WhatsAppDialog';
import { SuccessModal } from '@/components/SuccessModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ReviewProps {
  id: string;
  rating: number;
  author: string;
  comment: string;
  date: string;
}

const SAMPLE_REVIEWS: ReviewProps[] = [
  {
    id: '1',
    rating: 5,
    author: 'John M.',
    comment: 'Excellent product! Arrived quickly and works perfectly. Highly recommended.',
    date: '2 weeks ago',
  },
  {
    id: '2',
    rating: 4,
    author: 'Sarah K.',
    comment: 'Great quality for the price. Minor shipping delay but worth the wait.',
    date: '1 month ago',
  },
  {
    id: '3',
    rating: 5,
    author: 'Alex T.',
    comment: 'Best accessories store in Zimbabwe. Keep up the great work!',
    date: '1 month ago',
  },
];

const RELATED_PRODUCTS = [
  { id: '1', name: 'USB-C Cable', price: 2500, image: '/placeholder-1.jpg', rating: 4.5 },
  { id: '2', name: 'Screen Protector', price: 1200, image: '/placeholder-2.jpg', rating: 4.8 },
  { id: '3', name: 'Phone Stand', price: 1800, image: '/placeholder-3.jpg', rating: 4.6 },
];

export default function ProductDetail({ params }: { params: { slug: string } }) {
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successPhoneNumber, setSuccessPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: product, isLoading, error } = useProductDetail(params.slug);
  const { addItem, getWhatsAppMessage, clearCart } = useCart();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin border-4 border-gray-200 border-t-brand-primary rounded-full h-12 w-12 mx-auto mb-4" />
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-gray-100 px-4">
        <div className="max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
            <MessageCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Product Not Found</h1>
          <p className="text-lg text-gray-600 mb-6">We couldn't find this product.</p>
          <Link href="/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.image || '/placeholder.jpg',
    });
    setQuantity(1);
  };

  const handleCompleteOrder = async (phoneNumber: string) => {
    setIsSubmitting(true);
    try {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.image || '/placeholder.jpg',
      });

      const message = getWhatsAppMessage();
      const response = await fetch('/api/whatsapp/send-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: `263${phoneNumber}`,
          message,
        }),
      });

      if (!response.ok) throw new Error('Failed to send WhatsApp message');

      setSuccessPhoneNumber(phoneNumber);
      setShowSuccessModal(true);
      clearCart();
      setShowWhatsAppDialog(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    setSuccessPhoneNumber('');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-border/50 bg-gradient-to-r from-gray-50 to-white px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <Link href="/products" className="inline-flex items-center gap-2 text-brand-primary hover:text-brand-primary-dark transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="flex flex-col gap-4">
            <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl overflow-hidden border border-border/50">
              <Image
                src={product.image || '/placeholder.jpg'}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="flex-1 h-12 rounded-xl border border-border/50 flex items-center justify-center hover:bg-red-50 transition-colors"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-brand-primary text-brand-primary' : 'text-gray-400'}`} />
              </button>
              <button className="flex-1 h-12 rounded-xl border border-border/50 flex items-center justify-center hover:bg-gray-50 transition-colors">
                <Share2 className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col gap-8">
            <div>
              <p className="text-sm text-brand-primary font-medium mb-2">Premium Accessories</p>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">(247 reviews)</span>
              </div>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Pricing */}
            <Card>
              <CardContent className="pt-8">
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl font-bold text-brand-primary">
                    ZWL {product.price.toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground">Incl. VAT</span>
                </div>
                <p className="text-sm text-green-600 font-medium mb-6">In Stock (12+ available)</p>

                {/* Quantity Selector */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-gray-700 block mb-2">Quantity</label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-10 w-10 rounded-lg border border-border/50 flex items-center justify-center hover:bg-gray-50"
                    >
                      −
                    </button>
                    <span className="text-lg font-semibold w-8 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="h-10 w-10 rounded-lg border border-border/50 flex items-center justify-center hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleAddToCart}
                    className="w-full h-12"
                  >
                    Add to Cart
                  </Button>
                  <Button
                    onClick={() => setShowWhatsAppDialog(true)}
                    variant="whatsapp"
                    className="w-full h-12"
                    disabled={isSubmitting}
                  >
                    <MessageCircle className="w-5 h-5" />
                    Complete Order on WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Key Features */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Key Features</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-3 text-gray-600">
                  <div className="w-2 h-2 rounded-full bg-brand-primary" />
                  Premium quality materials
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <div className="w-2 h-2 rounded-full bg-brand-primary" />
                  2-year warranty included
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <div className="w-2 h-2 rounded-full bg-brand-primary" />
                  Fast & secure delivery
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 border-t border-border/50 pt-16">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Customer Reviews</h2>
            <p className="text-gray-600">See what our customers think about this product</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SAMPLE_REVIEWS.map((review) => (
              <Card key={review.id}>
                <CardContent className="pt-8">
                  <div className="flex items-center gap-2 mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="font-semibold text-gray-900 mb-2">{review.author}</p>
                  <p className="text-gray-600 mb-4">{review.comment}</p>
                  <p className="text-sm text-muted-foreground">{review.date}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16 border-t border-border/50 pt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {RELATED_PRODUCTS.map((related) => (
              <Link key={related.id} href={`/products/${related.id}`}>
                <Card className="h-full hover:shadow-xl transition-shadow duration-300 cursor-pointer">
                  <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-50 rounded-t-2xl overflow-hidden">
                    <Image
                      src={related.image}
                      alt={related.name}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-gray-900 mb-2">{related.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-brand-primary">ZWL {related.price.toLocaleString()}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm text-gray-600">{related.rating}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <WhatsAppDialog
        isOpen={showWhatsAppDialog}
        onClose={() => setShowWhatsAppDialog(false)}
        onSubmit={handleCompleteOrder}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        phoneNumber={successPhoneNumber}
      />
    </div>
  );
}
