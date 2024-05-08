import { pool } from "../../config/db.js";
import { Router } from 'express';
const router = Router();
router.get('/movies', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT * FROM movies');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    } finally {
        if (conn) conn.release();
    }
});

router.get('/movies/movie/:id', async (req, res) => {
    let conn;
    try {
        const { id } = req.params; // URL에서 id 파라미터를 추출
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT * FROM movies WHERE id = ?', [id]);

        if (rows.length > 0) {
            res.json(rows[0]); // 일치하는 영화가 있으면 해당 영화 정보를 JSON 형식으로 반환
        } else {
            res.status(404).send('Movie not found'); // 일치하는 영화가 없으면 404 상태 코드로 응답
        }
        conn.release();
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error'); // 서버 에러 발생 시 500 상태 코드로 응답
    } finally {
        if (conn) conn.release(); // 데이터베이스 연결 종료
    }
});

export default router;