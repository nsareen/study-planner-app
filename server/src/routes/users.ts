import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.get('/', asyncHandler(userController.getAll));
router.get('/:id', asyncHandler(userController.getById));
router.get('/:id/stats', asyncHandler(userController.getStats));
router.post('/', asyncHandler(userController.create));
router.patch('/:id', asyncHandler(userController.update));

export default router;
