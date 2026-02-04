import express from 'express';
import { LeadController } from '../controllers/lead.controller';
import { protect } from '../middleware/auth.middleware';
const router = express.Router();

router.get('/allLeads', protect, LeadController.getAllLeads);


export default router;