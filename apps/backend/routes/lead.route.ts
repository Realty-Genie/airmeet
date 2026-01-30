import express from 'express';
import { LeadController } from '../controllers/lead.controller';
import { CallController } from '../controllers/call.controller';
const router = express.Router();

router.get('/allLeads', LeadController.getAllLeads);
router.get('/getCalls/:leadId', CallController.getCalls);


export default router;