const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken } = require('../middlewares/authMiddleware');

// GET /wrongnotes — 오답 단어 목록 조회 (정답률 90% 미만, 오답 횟수 내림차순)
router.get('/', verifyToken, async (req, res) => {
    const userId = req.user.id;

    try {
        const [rows] = await pool.query(`
            SELECT w.id,
                   w.word,
                   w.mean,
                   COUNT(*) AS total,
                   SUM(CASE WHEN ta.is_correct = false THEN 1 ELSE 0 END) AS wrong_count,
                   ROUND((SUM(ta.is_correct) / COUNT(*)) * 100, 1) AS accuracy
            FROM test_answers ta
            JOIN test_results tr ON ta.test_result_id = tr.id
            JOIN words w ON ta.word_id = w.id
            WHERE tr.user_id = ?
            GROUP BY w.id, w.word, w.mean
            HAVING accuracy < 90
            ORDER BY wrong_count DESC
        `, [userId]);

        res.json({ wrong_words: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});

module.exports = router;
