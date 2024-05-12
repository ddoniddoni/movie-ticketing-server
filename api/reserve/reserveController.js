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
          ScreeningSchedules.start_time,
          ScreeningSchedules.theater_id,
          screeningschedules.id AS schedule_id
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
        const { schedule_id, theater_id } = req.query;
        conn = await pool.getConnection();
        const rows = await conn.query(`
        SELECT s.id AS seat_id, s.seat_number,
            CASE 
            WHEN r.id IS NULL THEN 'A'
            WHEN r.reservation_status = "P" THEN 'P'
            ELSE 'R'
            END AS reservation_status
        FROM
        Seats s LEFT JOIN Reservations r ON s.seat_number = r.seat_number AND r.schedule_id = ?
            WHERE s.theater_id = ?
        ORDER BY LENGTH(s.seat_number), seat_number;
      `, [schedule_id, theater_id]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    } finally {
        if (conn) conn.release();
    }
});

router.post('/reserve', async (req, res) => {
    let conn;
    try {
        const { userId, scheduleId, seatNumber } = req.body;
        conn = await pool.getConnection();

        // 좌석이 이미 예약 진행 중인지 확인하고, 해당 사용자가 이미 예약을 진행 중인지 확인합니다.
        let seatStatus = await conn.query("SELECT user_id, reservation_status FROM reservations WHERE schedule_id=? AND seat_number=?", [scheduleId, seatNumber]);
        console.log(seatStatus);
        if (seatStatus.length > 0) {
            if (seatStatus[0].reservation_status === 'P' && seatStatus[0].user_id !== userId) {
                return res.status(400).json({ message: '이미 예약중인 좌석입니다.' });
            }
        } else {
            // 해당 좌석에 대한 데이터가 없으면 새로운 행을 삽입합니다.
            await conn.query("INSERT INTO reservations (schedule_id, seat_number, reservation_status, user_id) VALUES (?, ?, 'P', ?)", [scheduleId, seatNumber, userId]);
            return res.json({ message: '최종 예약을 누르면 예약 확정 됩니다.' });
        }

        // 좌석 상태를 'processing'으로 업데이트하고, 예약을 진행 중인 사용자의 ID를 저장합니다.
        await conn.query("UPDATE reservations SET reservation_status='P', user_id=? WHERE schedule_id=? AND seat_number=?", [userId, scheduleId, seatNumber]);

        res.json({ message: 'Reservation process started. Please complete within 5 minutes.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        if (conn) conn.release();
    }
});

router.post('/completeReservation', async (req, res) => {
    let conn;
    try {
        const { userId, scheduleId, seatNumber } = req.body;
        conn = await pool.getConnection();

        // 예약 진행 중 상태 확인
        const seatStatus = await conn.query("SELECT reservation_status, user_id FROM reservations WHERE schedule_id=? AND seat_number=?", [scheduleId, seatNumber]);

        if (!seatStatus[0] || seatStatus[0].reservation_status !== 'P' || seatStatus[0].user_id !== userId) {
            return res.status(400).json({ message: 'This seat is not under reservation process by this user.' });
        }

        // 예약 완료 처리
        await conn.query("UPDATE reservations SET reservation_status='R', user_id=? WHERE schedule_id=? AND seat_number=?", [userId, scheduleId, seatNumber]);

        res.json({ message: 'Reservation completed successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        if (conn) conn.release();
    }
});

export default router;