import { Router } from 'express';
import { pool } from '../../config/db.js';

const router = Router();

router.get('/user/:id', async (req, res) => {
    const { id } = req.params;
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT * FROM reservations WHERE user_id = ? AND reservation_status = "R" ', [id]);
        console.log(rows);
        if (rows.length > 0) {
        } else {
            return res.json("예약 내역이 없습니다");
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;