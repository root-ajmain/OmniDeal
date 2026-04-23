import { Router } from 'express';
import {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct,
  getFeaturedProducts, getNewArrivals, getBestSellers, getDealOfTheDay,
  toggleWishlist, getWishlist,
} from '../controllers/productController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/new-arrivals', getNewArrivals);
router.get('/best-sellers', getBestSellers);
router.get('/deal-of-the-day', getDealOfTheDay);
router.get('/wishlist', protect, getWishlist);
router.get('/:id', getProduct);

router.post('/', adminOnly, createProduct);
router.put('/:id', adminOnly, updateProduct);
router.delete('/:id', adminOnly, deleteProduct);
router.post('/:id/wishlist', protect, toggleWishlist);

export default router;
