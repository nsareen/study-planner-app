import { Router } from 'express';
import { assignmentController } from '../controllers/assignmentController.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.get('/', asyncHandler(assignmentController.getAll));
router.get('/date-range', asyncHandler(assignmentController.getByDateRange));
router.get('/:id', asyncHandler(assignmentController.getById));
router.post('/', asyncHandler(assignmentController.create));
router.patch('/:id', asyncHandler(assignmentController.update));
router.delete('/:id', asyncHandler(assignmentController.delete));

export default router;
