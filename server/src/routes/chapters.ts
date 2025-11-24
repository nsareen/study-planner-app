import { Router } from 'express';
import { chapterController } from '../controllers/chapterController.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.get('/', asyncHandler(chapterController.getAll));
router.get('/stats/:userId', asyncHandler(chapterController.getStats));
router.get('/:id', asyncHandler(chapterController.getById));
router.post('/', asyncHandler(chapterController.create));
router.patch('/:id', asyncHandler(chapterController.update));
router.delete('/:id', asyncHandler(chapterController.delete));

export default router;
