// POST /test/submit — 테스트 제출
router.post('/submit', verifyToken, async (req, res) => {
    const { answers } = req.body; // 사용자가 제출한 답안 배열

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

        // 2. { word_id: 정답 } 형태로 변환해서 빠르게 조회할 수 있게 준비
        const wordMap = {};
        words.forEach(w => { wordMap[w.id] = w.word; });

        // 3. 채점: 사용자 답안과 정답 비교 (대소문자, 앞뒤 공백 무시)
        let correct_count = 0;
        const details = answers.map(a => {
            const correct_answer = wordMap[a.word_id];
            const is_correct = a.user_answer?.trim().toLowerCase() === correct_answer?.toLowerCase();
            if (is_correct) correct_count++;
            return { word_id: a.word_id, is_correct, correct_answer, user_answer: a.user_answer };
        });

        const total_count = answers.length;
        const score = parseFloat(((correct_count / total_count) * 100).toFixed(1));
        const user_id = req.user.id; // verifyToken이 토큰 해석 후 req.user에 유저 정보 저장

        // 4. test_results에 테스트 회차 결과 저장
        const [result] = await pool.query(
            'INSERT INTO test_results (user_id, total_count, correct_count, score) VALUES (?, ?, ?, ?)',
            [user_id, total_count, correct_count, score]
        );
        const test_result_id = result.insertId; // 방금 저장된 행의 id

        // 5. test_answers에 문항별 정오답 한 번에 저장 (bulk insert)
        const answerRows = details.map(d => [test_result_id, d.word_id, d.user_answer, d.is_correct]);
        await pool.query(
            'INSERT INTO test_answers (test_result_id, word_id, user_answer, is_correct) VALUES ?',
            [answerRows]
        );

        // 6. 채점 결과 응답
        res.json({
            success: true,
            result: { test_result_id, total_count, correct_count, score, details }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});