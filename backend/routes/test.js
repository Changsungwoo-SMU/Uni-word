const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken } = require('../middlewares/authMiddleware');

// GET /api/test/questions — 테스트 문제 받기
router.get('/questions', verifyToken, async (req, res) => {
    const count = parseInt(req.query.count) || 10;

    try {
        const [rows] = await pool.query(
            'SELECT id, mean, level FROM words ORDER BY RAND() LIMIT ?',
            [count]
        );
        res.json({ success: true, questions: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});

// POST /api/test/submit — 테스트 제출
router.post('/submit', verifyToken, async (req, res) => {
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ success: false, message: '답안 형식이 올바르지 않습니다.' });
    }

    try {
        const wordIds = answers.map(a => a.word_id);
        const [words] = await pool.query(
            'SELECT id, word FROM words WHERE id IN (?)',
            [wordIds]
        );

        const wordMap = {};
        words.forEach(w => { wordMap[w.id] = w.word; });

        let correct_count = 0;
        const details = answers.map(a => {
            const correct_answer = wordMap[a.word_id];
            const is_correct = a.user_answer?.trim().toLowerCase() === correct_answer?.toLowerCase();
            if (is_correct) correct_count++;
            return { word_id: a.word_id, is_correct, correct_answer };
        });

        const total_count = answers.length;
        const score = parseFloat(((correct_count / total_count) * 100).toFixed(1));

        res.json({
            success: true,
            result: { total_count, correct_count, score, details }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});

module.exports = router;