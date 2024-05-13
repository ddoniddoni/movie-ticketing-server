import { Router } from 'express';
import { pool } from '../../config/db.js';

const router = Router();

router.get("/timer/start-timer", (req, res) => {
    const timerStartTime = new Date().getTime();
    res.json({ startTime: timerStartTime });
})

export default router;