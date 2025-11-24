import { Router } from 'express';
import { syncController } from '../controllers/syncController.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.post('/push', asyncHandler(syncController.push));
router.get('/pull', asyncHandler(syncController.pull));
router.get('/status', asyncHandler(syncController.getStatus));

export default router;
