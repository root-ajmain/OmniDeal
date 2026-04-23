import { Router } from 'express';
import { getLiveFlashSale, getUpcomingFlashSale, getAllFlashSales, createFlashSale, updateFlashSale, deleteFlashSale } from '../controllers/flashSaleController.js';
import { adminOnly } from '../middleware/auth.js';

const router = Router();

router.get('/live', getLiveFlashSale);
router.get('/upcoming', getUpcomingFlashSale);
router.get('/', adminOnly, getAllFlashSales);
router.post('/', adminOnly, createFlashSale);
router.put('/:id', adminOnly, updateFlashSale);
router.delete('/:id', adminOnly, deleteFlashSale);

export default router;
