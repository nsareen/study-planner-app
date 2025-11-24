import { Router } from 'express';
import { sessionController } from '../controllers/sessionController.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.get('/', asyncHandler(sessionController.getAll));
router.get('/active', asyncHandler(sessionController.getActive));
router.post('/', asyncHandler(sessionController.create));
router.patch('/:id/pause', asyncHandler(sessionController.pause));
router.patch('/:id/resume', asyncHandler(sessionController.resume));
router.patch('/:id/complete', asyncHandler(sessionController.complete));

export default router;
