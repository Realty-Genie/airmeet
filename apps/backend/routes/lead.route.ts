import express from "express";
import { LeadController } from "../controllers/lead.controller";
import { CallController } from "../controllers/call.controller";
import { protect } from "../middleware/auth.middleware";
const router = express.Router();

router.get("/allLeads", protect, LeadController.getAllLeads);
router.get("/getCalls/:leadId", protect, CallController.getCalls);

export default router;
