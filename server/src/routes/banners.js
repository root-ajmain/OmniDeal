import { Router } from 'express';
import { getBanners, getAllBanners, createBanner, updateBanner, deleteBanner } from '../controllers/bannerController.js';
import { adminOnly } from '../middleware/auth.js';

const router = Router();

router.get('/', getBanners);
router.get('/all', adminOnly, getAllBanners);
router.post('/', adminOnly, createBanner);
router.put('/:id', adminOnly, updateBanner);
router.delete('/:id', adminOnly, deleteBanner);

export default router;
