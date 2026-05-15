const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken } = require('../middlewares/authMiddleware');

// GET /leveltest/questions — 수준별 적응형 문제 출제
router.get('/questions', verifyToken, async (req, res) => {
    const userId = req.user.id;

    try {
        const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);
        const pickN = (arr, n) => shuffle(arr).slice(0, Math.min(n, arr.length));

        // 이 유저가 수준별 테스트에서 한 번도 안 본 단어 조회
        const [unseenWords] = await pool.query(`
            SELECT id, mean, level FROM words
            WHERE id NOT IN (
                SELECT DISTINCT ta.word_id
                FROM test_answers ta
                JOIN test_results tr ON ta.test_result_id = tr.id
                WHERE tr.user_id = ?
            )
            ORDER BY RAND()
        `, [userId]);

        // 안 본 단어가 10개 이상이면 그것만 출제
        if (unseenWords.length >= 10) {
            return res.json({
                success: true,
                questions: unseenWords.slice(0, 10),
                mode: 'initial',
                unseenCount: unseenWords.length,
            });
        }

        // 단어별 정답률 기반 중요도 선별
        const [wordStats] = await pool.query(`
            SELECT ta.word_id,
                   COUNT(*) AS total,
                   SUM(ta.is_correct) AS correct
            FROM test_answers ta
            JOIN test_results tr ON ta.test_result_id = tr.id
            WHERE tr.user_id = ?
            GROUP BY ta.word_id
        `, [userId]);

        const [allWords] = await pool.query('SELECT id, mean, level FROM words');

        const statsMap = {};
        wordStats.forEach(s => { statsMap[s.word_id] = (s.correct / s.total) * 100; });

        // 정답률 기준 중요도 분류 (1: 쉬움 ≥90%, 2: 보통 ≥50%, 3: 어려움 <50%)
        const imp1 = [], imp2 = [], imp3 = [];
        allWords.forEach(w => {
            const accuracy = statsMap[w.id] ?? 0;
            if (accuracy >= 90) imp1.push(w);
            else if (accuracy >= 50) imp2.push(w);
            else imp3.push(w);
        });

        // 안 본 단어가 1~9개면 먼저 채우고 나머지를 중요도 기반으로 보충
        const unseenIds = new Set(unseenWords.map(w => w.id));
        const need = 10 - unseenWords.length;

        const seenImp1 = imp1.filter(w => !unseenIds.has(w.id));
        const seenImp2 = imp2.filter(w => !unseenIds.has(w.id));
        const seenImp3 = imp3.filter(w => !unseenIds.has(w.id));

        // 남은 자리를 10%:30%:60% 비율로 채움 (반올림)
        const fill1 = Math.round(need * 0.1) || 0;
        const fill2 = Math.round(need * 0.3);
        const fill3 = need - fill1 - fill2;

        let selected = [
            ...unseenWords,
            ...pickN(seenImp1, fill1),
            ...pickN(seenImp2, fill2),
            ...pickN(seenImp3, fill3),
        ];

        // 여전히 부족하면 나머지에서 보충
        if (selected.length < 10) {
            const selectedIds = new Set(selected.map(w => w.id));
            const remaining = allWords.filter(w => !selectedIds.has(w.id));
            selected = [...selected, ...pickN(remaining, 10 - selected.length)];
        }

        res.json({
            success: true,
            questions: shuffle(selected),
            mode: 'adaptive',
            unseenCount: unseenWords.length,
            distribution: { imp1: imp1.length, imp2: imp2.length, imp3: imp3.length },
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});

// POST /leveltest/submit — 수준별 테스트 제출
router.post('/submit', verifyToken, async (req, res) => {
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ success: false, message: '답안 형식이 올바르지 않습니다.' });
    }

    try {
        // 1. 제출된 word_id 목록으로 DB에서 정답(word) 조회
        const wordIds = answers.map(a => a.word_id);
        const [words] = await pool.query(
            'SELECT id, word FROM words WHERE id IN (?)',
            [wordIds]
        );

        // 2. { word_id: 정답 } 형태로 변환
        const wordMap = {};
        words.forEach(w => { wordMap[w.id] = w.word; });

        // 3. 채점: 대소문자, 앞뒤 공백 무시
        let correct_count = 0;
        const details = answers.map(a => {
            const correct_answer = wordMap[a.word_id];
            const is_correct = a.user_answer?.trim().toLowerCase() === correct_answer?.toLowerCase();
            if (is_correct) correct_count++;
            return { word_id: a.word_id, is_correct, correct_answer, user_answer: a.user_answer };
        });

        const total_count = answers.length;
        const score = parseFloat(((correct_count / total_count) * 100).toFixed(1));
        const user_id = req.user.id;

        // 4. test_results에 회차 결과 저장
        const [result] = await pool.query(
            'INSERT INTO test_results (user_id, total_count, correct_count, score) VALUES (?, ?, ?, ?)',
            [user_id, total_count, correct_count, score]
        );
        const test_result_id = result.insertId;

        // 5. test_answers에 문항별 정오답 저장
        const answerRows = details.map(d => [test_result_id, d.word_id, d.user_answer, d.is_correct]);
        await pool.query(
            'INSERT INTO test_answers (test_result_id, word_id, user_answer, is_correct) VALUES ?',
            [answerRows]
        );

        // 6. 채점 결과 응답
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
