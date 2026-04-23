import { Router } from 'express';
import { createReturn, getReturnByNumber, getAllReturns, updateReturn } from '../controllers/returnController.js';
import { adminOnly } from '../middleware/auth.js';

const router = Router();

router.post('/', createReturn);
router.get('/track/:number', getReturnByNumber);
router.get('/', adminOnly, getAllReturns);
router.put('/:id', adminOnly, updateReturn);

export default router;
