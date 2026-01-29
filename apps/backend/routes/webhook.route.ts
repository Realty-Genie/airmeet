import express from 'express';
import { WebhookController } from '../controllers/webhook.controller';

const router = express.Router();

router.post('/', WebhookController.handleRetellWebhook);

export default router;