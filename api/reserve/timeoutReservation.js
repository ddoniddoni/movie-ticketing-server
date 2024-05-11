export const createTimeoutForReservation = (connection, reservationId, timeout) => {
    setTimeout(() => {
        const query = 'SELECT reservation_status FROM reservations WHERE id = ?';
        connection.query(query, [reservationId], (error, results) => {
            if (error) {
                // 에러 처리
                return;
            }
            if (results.length > 0 && results[0].status === 'P') {
                const updateQuery = 'UPDATE reservations SET status = ? WHERE id = ?';
                connection.query(updateQuery, ['A', reservationId], (updateError) => {
                    if (updateError) {
                        // 에러 처리
                    }
                    // 예약 취소 완료 처리
                });
            }
        });
    }, timeout);
}