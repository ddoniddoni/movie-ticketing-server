import { pool } from "../../config/db.js";
import { Router } from 'express';
const router = Router();

router.get("/date/:id", async (req, res) => {
    let conn;
    try {
        const { id } = req.params; // URL에서 id 파라미터를 추출
        conn = await pool.getConnection();
        const rows = await conn.query(`
        SELECT
          Movies.title AS movie_title,
          Theaters.name AS theater_name,
          Theaters.location AS theater_location,
          ScreeningSchedules.screening_date,
          ScreeningSchedules.start_time
        FROM
          ScreeningSchedules
        JOIN Movies ON ScreeningSchedules.movie_id = Movies.id
        JOIN Theaters ON ScreeningSchedules.theater_id = Theaters.id
        WHERE
          ScreeningSchedules.movie_id = ?
        ORDER BY
          ScreeningSchedules.screening_date,
          ScreeningSchedules.start_time;
      `, [id]);

        if (rows.length > 0) {
            res.json(rows); // 일치하는 영화가 있으면 해당 영화 정보를 JSON 형식으로 반환
        } else {
            res.status(404).send('Movie not found'); // 일치하는 영화가 없으면 404 상태 코드로 응답
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error'); // 서버 에러 발생 시 500 상태 코드로 응답
    } finally {
        if (conn) conn.release(); // 데이터베이스 연결 종료
    }
});


router.get('/seat', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT * FROM seat ORDER BY LENGTH(seat_number), seat_number');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    } finally {
        if (conn) conn.release();
    }
});

router.put('/reserve', async (req, res) => {
    const { isReserved, seat_number } = req.body;
    let conn;
    try {
        conn = await pool.getConnection();
        const result = await conn.execute(
            `UPDATE seat SET isReserved = ? WHERE seat_number = ?`,
            [isReserved, seat_number]
        );
        if (result.affectedRows > 0) {
            res.status(200).json({ message: '예약에 성공했습니다.', receivedData: req.body });
        } else {
            res.status(404).send('좌석을 찾을 수 없거나 예약 상태에 변화가 없습니다');
        }
    } catch (err) {
        res.status(500).send('Server Error');
    } finally {
        if (conn) conn.release();
    }
});

export default router;