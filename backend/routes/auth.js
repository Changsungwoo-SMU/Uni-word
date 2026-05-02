const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

// 회원가입 API: POST /auth/signup
router.post('/signup', async (req, res) => {
    const { email, password, name } = req.body;

    try {
        // 1. 이미 존재하는 이메일인지 확인
        const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: '이미 가입된 이메일입니다.' });
        }

        // 2. 비밀번호 암호화 (해싱)
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. DB에 저장 (초기 가입 시 기본 role은 'user')
        await pool.query(
            'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
            [email, hashedPassword, name, 'user']
        );

        res.status(201).json({ message: '회원가입이 완료되었습니다.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 에러가 발생했습니다.' });
    }
});



// 로그인 API: POST /auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. 유저 존재 여부 확인
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: '존재하지 않는 이메일입니다.' });
        }

        const user = users[0];

        // 2. 비밀번호 비교 (입력한 비번 vs DB의 암호화된 비번)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
        }

        // 3. 비밀번호가 맞다면 JWT 토큰 발급
        // 토큰에는 유저의 id와 role을 담아 나중에 권한 확인 시 사용합니다.
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // 1시간 동안 유효
        );

        res.json({
            message: '로그인 성공!',
            token: token,
            user: { id: user.id, name: user.name, role: user.role }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 에러가 발생했습니다.' });
    }
});

module.exports = router;