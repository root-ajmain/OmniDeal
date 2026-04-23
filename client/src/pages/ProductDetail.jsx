import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, Heart, Star, Share2, Check, Minus, Plus, Truck, Shield, RotateCcw, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { productsAPI } from '../utils/api.js';
import { formatPrice, getDiscountPercent } from '../utils/helpers.js';
import useCartStore from '../store/cartStore.js';
import useWishlistStore from '../store/wishlistStore.js';
import useRecentlyViewedStore from '../store/recentlyViewedStore.js';
import ProductImageGallery from '../components/product/ProductImageGallery.jsx';
import ProductReviews from '../components/product/ProductReviews.jsx';
import SuggestedProducts from '../components/product/SuggestedProducts.jsx';
import RecentlyViewed from '../components/product/RecentlyViewed.jsx';
import BackButton from '../components/ui/BackButton.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const addItem = useCartStore(s => s.addItem);
  const { toggle, isWished } = useWishlistStore();
  const addRecentlyViewed = useRecentlyViewedStore(s => s.add);

  const { data, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsAPI.getById(id).then(r => r.data),
  });

  const product = data?.product;
  const suggested = data?.suggested || [];
  const wished = product ? isWished(product._id) : false;

  useEffect(() => {
    if (product) addRecentlyViewed(product);
  }, [product?._id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Skeleton className="h-6 w-24 mb-8" />
        <div className="grid md:grid-cols-2 gap-12">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-6xl mb-4">😕</p>
        <p className="text-slate-400 text-lg">Product not found</p>
        <BackButton label="Go back" className="mt-6 mx-auto" />
      </div>
    );
  }

  const price = product.pricing?.sale || product.pricing?.regular;
  const discount = getDiscountPercent(product.pricing?.regular, product.pricing?.sale);
  const inStock = !product.inventory?.trackInventory || product.inventory?.quantity > 0;

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    navigate('/checkout');
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success('Link copied!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <BackButton className="mb-8" />

      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        {/* Images */}
        <ProductImageGallery images={product.images} />

        {/* Info */}
        <div className="space-y-6">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {product.badges?.map(badge => (
              <span key={badge} className={`badge ${
                badge === 'new' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                badge === 'hot' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                badge === 'sale' ? 'bg-brand-600/20 text-brand-600 border border-brand-600/30' :
                'bg-gold-500/20 text-gold-400 border border-gold-500/30'
              }`}>
                {badge.charAt(0).toUpperCase() + badge.slice(1)}
              </span>
            ))}
            <span className="badge bg-slate-700 text-slate-400">{product.category?.icon} {product.category?.name}</span>
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-900 leading-tight mb-2">
              {product.name}
            </h1>
            {product.sku && <p className="text-slate-500 text-sm">SKU: {product.sku}</p>}
          </div>

          {/* Rating */}
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.round(product.avgRating) ? 'text-gold-500 fill-gold-500' : 'text-slate-600'}`} />
                ))}
              </div>
              <span className="text-brand-600 font-semibold">{product.avgRating}</span>
              <span className="text-slate-500 text-sm">({product.reviewCount} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-end gap-4 py-4 border-y border-gray-100">
            <div>
              <span className="text-4xl font-bold text-brand-600">{formatPrice(price)}</span>
              {product.pricing?.sale && (
                <span className="ml-3 text-xl text-slate-500 line-through">{formatPrice(product.pricing.regular)}</span>
              )}
            </div>
            {discount > 0 && (
              <span className="badge bg-red-500/20 text-red-400 border border-red-500/30 text-sm">
                You save {formatPrice(product.pricing.regular - product.pricing.sale)} ({discount}% OFF)
              </span>
            )}
          </div>

          {/* Short description */}
          {product.shortDescription && (
            <p className="text-slate-400 leading-relaxed">{product.shortDescription}</p>
          )}

          {/* Attributes */}
          {product.attributes?.length > 0 && (
            <div className="space-y-2">
              {product.attributes.map((attr, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="text-slate-500 w-24">{attr.name}:</span>
                  <span className="text-gray-800 font-medium">{attr.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Stock */}
          <div className="flex items-center gap-2">
            {inStock ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 text-sm font-medium">
                  {product.inventory?.quantity <= 10 ? `Only ${product.inventory.quantity} left!` : 'In Stock'}
                </span>
              </>
            ) : (
              <span className="text-red-400 text-sm font-medium">Out of Stock</span>
            )}
          </div>

          {/* Quantity & Add to cart */}
          {inStock && (
            <div className="space-y-3">
              <div className="flex gap-3 items-center">
                <div className="flex items-center bg-gray-100 rounded-xl">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-3 text-slate-500 hover:text-gray-900 transition-colors">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-gray-900 font-semibold w-10 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)} className="p-3 text-slate-500 hover:text-gray-900 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button onClick={handleAddToCart} className="flex-1 btn-secondary py-3">
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
              </div>
              <button onClick={handleBuyNow} className="w-full btn-primary py-3.5 shadow-brand-lg">
                <Zap className="w-5 h-5" />
                Buy Now
              </button>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => { toggle(product._id); toast.success(wished ? 'Removed from wishlist' : 'Added to wishlist!'); }}
              className={`btn-secondary flex-1 py-3 ${wished ? 'text-pink-400 border-pink-500/30 bg-pink-500/10' : ''}`}
            >
              <Heart className="w-5 h-5" fill={wished ? 'currentColor' : 'none'} />
              {wished ? 'Wishlisted' : 'Add to Wishlist'}
            </button>
            <button onClick={handleShare} className="btn-ghost p-3 glass rounded-xl">
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
            {[
              { icon: Truck, label: 'Free Delivery', sub: 'On ৳999+' },
              { icon: Shield, label: 'Secure Pay', sub: '100% safe' },
              { icon: RotateCcw, label: 'Easy Return', sub: '7-day policy' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex flex-col items-center gap-2 p-3 glass rounded-xl text-center">
                <Icon className="w-5 h-5 text-brand-600" />
                <div>
                  <p className="text-gray-700 text-xs font-medium">{label}</p>
                  <p className="text-slate-500 text-xs">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-16">
        <div className="flex gap-1 border-b border-gray-100 mb-8">
          {['description', 'specifications', 'reviews'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium capitalize transition-colors relative ${
                activeTab === tab ? 'text-brand-600' : 'text-slate-500 hover:text-gray-700'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="tab-indicator" className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-500" />
              )}
              {tab === 'reviews' && product.reviewCount > 0 && (
                <span className="ml-1.5 badge bg-brand-600/20 text-brand-600 text-xs">{product.reviewCount}</span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'description' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="prose prose-invert max-w-none">
            <p className="text-slate-400 leading-relaxed text-base whitespace-pre-line">{product.description}</p>
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {product.tags.map(tag => (
                  <span key={tag} className="badge bg-dark-700 text-slate-400 border border-gray-200">#{tag}</span>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'specifications' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1}} className="space-y-3">
            {[
              { label: 'Category', value: product.category?.name },
              { label: 'SKU', value: product.sku || 'N/A' },
              ...product.attributes || [],
            ].map((attr, i) => (
              <div key={i} className="flex items-center py-3 border-b border-gray-100">
                <span className="text-slate-500 w-40 text-sm">{attr.label || attr.name}</span>
                <span className="text-gray-800 text-sm font-medium">{attr.value || attr.name}</span>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'reviews' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ProductReviews
              productId={product._id}
              avgRating={product.avgRating}
              reviewCount={product.reviewCount}
            />
          </motion.div>
        )}
      </div>

      {/* Suggested */}
      <SuggestedProducts products={suggested} title="Similar Products" />

      {/* Recently Viewed */}
      <RecentlyViewed excludeId={product._id} />
    </div>
  );
}
