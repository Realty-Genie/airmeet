import express from 'express';
import { protect } from '../middleware/auth.middleware';
const router = express.Router();

router.get('/me', protect, (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Unauthorized"
        })
    }
    res.status(200).json({
        message: "User fetched successfully",
        user: req.user
    })
});

export default router;