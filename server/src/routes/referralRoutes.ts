import { Router } from 'express';
import { ReferralController } from '../controllers/referralController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/stats', authMiddleware, ReferralController.getStats);
router.get('/history', authMiddleware, ReferralController.getHistory);

export default router;