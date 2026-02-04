import express from 'express';
import { CallController } from '../controllers/call.controller.ts';
import { protect } from '../middleware/auth.middleware';
const router = express.Router();

router.post("/createCall", protect, CallController.createCall)
router.post("/scheduleCall", protect, CallController.scheduleCall)
router.get('/getCalls/:leadId', protect, CallController.getCalls)
router.post('/batchCall', protect, CallController.createBatchCall)

export default router;