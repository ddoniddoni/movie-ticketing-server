import { Router } from "express";
import { pool } from "../../config/db.js";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
const route = Router();
route.post('/signup', async (req, res) => {
    const { id, password, name } = req.body;
    let conn;
    if (!id || !password) {
        return res.status(400).send('아이디와 비밀번호를 입력해주세요.');
    }
    if (!name) {
        return res.status(400).send("이름을 입력해주세요.")
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10); // 비밀번호 해싱
        conn = await pool.getConnection();

        await conn.execute(
            `INSERT INTO user (id, password, name) VALUES (?, ?, ?)`,
            [id, hashedPassword, name]
        );
        conn.release();
        res.status(201).send('회원가입 성공');
    } catch (error) {
        res.status(500).send('서버 에러');
    }
});
route.post('/login', async (req, res) => {
    const { id, password } = req.body;
    try {
        const rows = await pool.query('SELECT * FROM user WHERE id = ?', [id]);
        if (rows.length > 0) {
            const user = rows[0];

            const isMatch = await bcrypt.compare(password, user.password);

            if (isMatch) {
                const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
                res.json({ message: '로그인 성공', token, loginId: user.id });
            } else {
                res.status(400).json({ message: '비밀번호가 일치하지 않습니다.' });
            }
        } else {
            res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default route;