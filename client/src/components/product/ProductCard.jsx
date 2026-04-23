import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import useCartStore from '../../store/cartStore.js';
import useWishlistStore from '../../store/wishlistStore.js';
import { formatPrice, getFeaturedImage, getDiscountPercent } from '../../utils/helpers.js';

export default function ProductCard({ product }) {
  const addItem = useCartStore(s => s.addItem);
  const { toggle, isWished } = useWishlistStore();
  const wished = isWished(product._id);

  const image = getFeaturedImage(product.images);
  const price = product.pricing?.sale || product.pricing?.regular;
  const discount = getDiscountPercent(product.pricing?.regular, product.pricing?.sale);

  const handleAddToCart = (e) => {
    e.preventDefault();
    addItem(product);
    toast.success(`${product.name} added to cart!`);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    toggle(product._id);
    toast.success(wished ? 'Removed from wishlist' : 'Added to wishlist!');
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group card"
    >
      <Link to={`/product/${product.slug || product._id}`} className="block">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.badges?.includes('new') && (
              <span className="badge bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">New</span>
            )}
            {product.badges?.includes('hot') && (
              <span className="badge bg-orange-500/20 text-orange-500 border border-orange-500/30">Hot</span>
            )}
            {discount > 0 && (
              <span className="badge bg-brand-600/20 text-brand-600 border border-brand-600/30">-{discount}%</span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            className={`absolute top-2 right-2 w-8 h-8 glass rounded-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 ${wished ? 'text-pink-500' : 'text-slate-400 hover:text-pink-400'}`}
          >
            <Heart className={`w-4 h-4 ${wished ? 'fill-pink-500' : ''}`} />
          </button>

          {/* Quick add overlay */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-3">
            <button
              onClick={handleAddToCart}
              className="w-full btn-primary py-2 text-sm shadow-brand"
            >
              Add to Cart
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-slate-500 text-xs mb-1">{product.category?.name}</p>
          <h3 className="text-gray-800 text-sm font-medium line-clamp-2 group-hover:text-brand-700 transition-colors mb-2">
            {product.name}
          </h3>

          {/* Rating */}
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < Math.round(product.avgRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                ))}
              </div>
              <span className="text-xs text-slate-400">({product.reviewCount})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="price-tag text-base">{formatPrice(price)}</span>
            {product.pricing?.sale && (
              <span className="price-original">{formatPrice(product.pricing.regular)}</span>
            )}
          </div>

          {/* Stock warning */}
          {product.inventory?.quantity <= 5 && product.inventory?.quantity > 0 && (
            <p className="text-orange-400 text-xs mt-1">Only {product.inventory.quantity} left!</p>
          )}
          {product.inventory?.quantity === 0 && (
            <p className="text-red-400 text-xs mt-1">Out of stock</p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
