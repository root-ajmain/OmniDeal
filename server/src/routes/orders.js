import { Router } from 'express';
import {
  createOrder, getMyOrders, getOrder, trackOrder, trackByPhone,
  getAllOrders, updateOrderStatus,
} from '../controllers/orderController.js';
import { protect, adminOnly, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.post('/', optionalAuth, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/track/:orderNumber', trackOrder);
router.get('/track-phone/:phone', trackByPhone);
router.get('/:id', getOrder);

// Admin
router.get('/', adminOnly, getAllOrders);
router.put('/:id/status', adminOnly, updateOrderStatus);

export default router;
