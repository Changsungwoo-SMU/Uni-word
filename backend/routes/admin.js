const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

// 모든 관리자 API는 로그인 확인(verifyToken)과 관리자 확인(isAdmin)을 거쳐야 합니다.
// 1. 단어 추가 (Create)
router.post('/words', verifyToken, isAdmin, async (req, res) => {
    const { word, mean, pos, level } = req.body;

    // 데이터가 잘 들어왔는지 먼저 확인
    if (!word || !mean) {
        return res.status(400).json({ message: '단어와 뜻은 필수 입력 사항입니다.' });
    }

    try {
        await pool.query(
            'INSERT INTO words (word, mean, pos, level) VALUES (?, ?, ?, ?)',
            [word, mean, pos, level]
        );
        res.status(201).json({ message: '단어가 성공적으로 추가되었습니다.' });
    } catch (err) {
        res.status(500).json({ message: '서버 에러가 발생했습니다.', });
    }
});

// 2. 전체 단어 목록 조회 (Read)
router.get('/words', verifyToken, isAdmin, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM words ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: '서버 에러가 발생했습니다.' });
    }
});

// 3. 단어 수정 (Update)
router.put('/words/:id', verifyToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { word, mean, pos, level } = req.body;
    try {
        await pool.query(
            'UPDATE words SET word = ?, mean = ?, pos = ?, level = ? WHERE id = ?',
            [word, mean, pos, level, id]
        );
        res.json({ message: '단어 정보가 수정되었습니다.' });
    } catch (err) {
        res.status(500).json({ message: '서버 에러가 발생했습니다.' });
    }
});

// 4. 단어 삭제 (Delete)
router.delete('/words/:id', verifyToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM words WHERE id = ?', [id]);
        res.json({ message: '단어가 삭제되었습니다.' });
    } catch (err) {
        console.error("실제 에러 내용:", err); // 터미널에 상세 에러 출력
        res.status(500).json({
            message: '서버 에러가 발생했습니다.',
            error: err.message // 클라이언트(Postman)에게도 에러 이유를 알려줌
        });
    }
});

module.exports = router;