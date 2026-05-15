const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken } = require('../middlewares/authMiddleware');

// GET /words — 학습자/관리자 모두 조회 가능 (로그인만 필수)
// PBI-2: "학습자로서 50개 이상의 검증된 토익 단어장을 제공받고 싶다"
router.get('/', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, word, mean, pos, level FROM words ORDER BY id'
        );
        res.json(rows);
    } catch (err) {
        console.error('GET /words error:', err);
        res.status(500).json({ message: '서버 에러가 발생했습니다.' });
    }
});

module.exports = router;
