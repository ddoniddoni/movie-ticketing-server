import { Router } from 'express';
import { pool } from '../../config/db.js';

const router = Router();

router.get('/user/:id', async (req, res) => {
    let conn;
    const { id } = req.params;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT m.title, s.screening_date, s.start_time, r.seat_number, t.name FROM reservations r JOIN screeningschedules s ON r.schedule_id = s.id JOIN movies m ON s.movie_id = m.id JOIN theaters t ON s.theater_id = t.id WHERE r.user_id=? AND r.reservation_status = "R"', [id]);
        if (rows.length > 0) {
            res.json(rows);
        } else {
            res.json("예약 내역이 없습니다");
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    } finally {
        if (conn) conn.release();
    }
});

export default router;