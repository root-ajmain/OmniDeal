import { Router } from 'express';
import { validateCoupon, getCoupons, createCoupon, updateCoupon, deleteCoupon } from '../controllers/couponController.js';
import { adminOnly } from '../middleware/auth.js';

const router = Router();

router.post('/validate', validateCoupon);
router.get('/', adminOnly, getCoupons);
router.post('/', adminOnly, createCoupon);
router.put('/:id', adminOnly, updateCoupon);
router.delete('/:id', adminOnly, deleteCoupon);

export default router;
