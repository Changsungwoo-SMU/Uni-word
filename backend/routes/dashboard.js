const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken } = require('../middlewares/authMiddleware');

/**
 * 대시보드 종합 데이터 조회 (GET /dashboard)
 */
router.get('/', verifyToken, async (req, res) => {
    const userId = req.user.id;

    try {
        // 1. [기능 2] 총 테스트 횟수 조회
        const [totalCountResult] = await pool.query(
            `SELECT COUNT(*) AS total_tests FROM test_results WHERE user_id = ?`,
            [userId]
        );
        const totalTests = totalCountResult[0].total_tests;


        // 2. [기능 1] recent_tests: '최근 5회'의 테스트 기록만 추출
        const [recentTestsRaw] = await pool.query(
            `SELECT id, score, taken_at 
             FROM test_results 
             WHERE user_id = ? 
             ORDER BY taken_at DESC 
             LIMIT 5`,
            [userId]
        );
        // 과거 -> 최신 순서로 정렬
        const recent_tests = recentTestsRaw.reverse().map((test, index) => ({
            test_id: test.id,
            display_order: index + 1,
            score: test.score,
            taken_at: test.taken_at
        }));


        // 3. [기능 3] 오답률 통계: 제한 없이 '총 테스트(전체 회차)'에 대한 오답률 계산
        const [allTestsRaw] = await pool.query(
            `SELECT id, total_count, correct_count, taken_at 
             FROM test_results 
             WHERE user_id = ? 
             ORDER BY taken_at ASC`, // 옛날 시험부터 차례대로 정렬
            [userId]
        );

        const wrong_rate_history = allTestsRaw.map((test, index) => {
            const total = test.total_count;
            const correct = test.correct_count;
            const wrong = total - correct;

            // 오답률 계산 (0 나누기 방지)
            const wrongRate = total > 0 ? parseFloat(((wrong / total) * 100).toFixed(1)) : 0;

            return {
                test_id: test.id,
                nth_test: index + 1, // "1회차, 2회차 ... n회차" 전체 넘버링
                wrong_rate: wrongRate, // 해당 회차의 오답률 (%)
                taken_at: test.taken_at
            };
        });


        // 4. [기능 4] memorized_word_count 계산을 위한 전체 문항 데이터 조회
        const [answers] = await pool.query(
            `SELECT ta.word_id, ta.is_correct 
             FROM test_answers ta
             JOIN test_results tr ON ta.test_result_id = tr.id
             WHERE tr.user_id = ?`,
            [userId]
        );

        const wordStats = {};
        answers.forEach(ans => {
            if (!wordStats[ans.word_id]) {
                wordStats[ans.word_id] = { total: 0, correct: 0 };
            }
            wordStats[ans.word_id].total += 1;
            if (ans.is_correct) {
                wordStats[ans.word_id].correct += 1;
            }
        });

        let easyCount = 0; // 수준 '하' (암기 완료 단어)
        Object.keys(wordStats).forEach(wordId => {
            const stat = wordStats[wordId];
            const accuracy = (stat.correct / stat.total) * 100;
            if (accuracy >= 90) {
                easyCount += 1;
            }
        });

        const totalLearnedWords = Object.keys(wordStats).length;


        // 5. 최종 구조화된 응답 반환
        res.json({
            message: "대시보드 데이터 로드 완료",
            data: {
                totalTests: totalTests,               // 총 테스트 횟수
                recent_tests: recent_tests,           // 최신 5회 기록 (점수 중심)
                wrong_rate_history: wrong_rate_history, // 전체 테스트에 대한 오답률 통계 역사 (배열 제한 없음)
                memorized_word_count: easyCount,       // 암기 된 단어 개수 (수준 하)
                totalLearnedWords: totalLearnedWords   // 총 학습 단어 수
            }
        });

    } catch (err) {
        console.error('대시보드 데이터 조회 중 에러 발생:', err);
        res.status(500).json({ message: "대시보드 데이터를 가져오는 중 오류가 발생했습니다." });
    }
});

module.exports = router;