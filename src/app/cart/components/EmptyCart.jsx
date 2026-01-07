'use client';

import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

export default function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
      <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
        <Icon name="ShoppingCartIcon" size={48} variant="outline" className="text-muted-foreground" />
      </div>
      
      <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
        Your cart is empty
      </h2>
      
      <p className="font-body text-muted-foreground mb-8 max-w-md">
        Looks like you haven&apos;t added any furniture to your cart yet. 
        Start browsing our collection to find your perfect pieces!
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/customer-dashboard"
          className="px-6 py-3 bg-primary text-primary-foreground font-body font-medium rounded-md hover:bg-primary/90 transition-fast inline-flex items-center justify-center gap-2">

          <Icon name="HomeIcon" size={20} variant="outline" />
          <span>Browse Catalog</span>
        </Link>
        
        <Link
          href="/virtual-room-designer"
          className="px-6 py-3 border border-border text-foreground font-body font-medium rounded-md hover:bg-muted transition-fast inline-flex items-center justify-center gap-2">

          <Icon name="PencilSquareIcon" size={20} variant="outline" />
          <span>Design Room</span>
        </Link>
      </div>

      {/* Recent Recommendations */}
      <div className="mt-12 w-full max-w-4xl">
        <h3 className="font-heading text-lg font-semibold text-foreground mb-4 text-left">
          You might like
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
          {
            name: 'Modern Sofa',
            price: 45999,
            image: "https://images.unsplash.com/photo-1634497885778-152eb6fd543d",
            alt: 'Modern gray sofa with wooden legs'
          },
          {
            name: 'Dining Table',
            price: 32999,
            image: "https://images.unsplash.com/photo-1691435212739-41971399e0a8",
            alt: 'Wooden dining table with six chairs'
          },
          {
            name: 'Queen Bed Frame',
            price: 15999,
            image: "https://img.rocket.new/generatedImages/rocket_gen_img_19a59142e-1764752238242.png",
            alt: 'Upholstered queen bed frame in beige'
          }]?.
          map((product, index) =>
          <div key={index} className="bg-surface border border-border rounded-lg p-4 hover:shadow-sm transition-fast">
              <div className="aspect-square bg-muted rounded-md mb-3 overflow-hidden">
                <img
                src={product?.image}
                alt={product?.alt}
                className="w-full h-full object-cover" />

              </div>
              <h4 className="font-heading font-medium text-foreground mb-1">
                {product?.name}
              </h4>
              <p className="font-body text-sm text-primary font-semibold">
                ₱{product?.price?.toLocaleString('en-PH')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>);

}