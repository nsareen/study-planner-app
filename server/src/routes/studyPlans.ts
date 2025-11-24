import { Router } from 'express';
import { studyPlanController } from '../controllers/studyPlanController.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.get('/', asyncHandler(studyPlanController.getAll));
router.get('/:id', asyncHandler(studyPlanController.getById));
router.post('/', asyncHandler(studyPlanController.create));
router.post('/:id/activate', asyncHandler(studyPlanController.activate));
router.patch('/:id', asyncHandler(studyPlanController.update));
router.delete('/:id', asyncHandler(studyPlanController.delete));

export default router;
