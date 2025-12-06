import { Router } from 'express';
import { PurchaseController } from '../controllers/purchaseController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/', authMiddleware, PurchaseController.createPurchase);
router.get('/history', authMiddleware, PurchaseController.getPurchaseHistory);

export default router;