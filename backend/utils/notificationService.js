const pool = require('../config/db');

const notificationService = {
    /**
     * 사용자의 마지막 테스트 시각을 체크하여 24시간이 지났으면 알림 생성
     */
    checkAndCreateTestReminder: async (userId) => {
        try {
            // 1. 가장 최근 테스트 결과 가져오기
            const [lastTest] = await pool.query(
                'SELECT taken_at FROM test_results WHERE user_id = ? ORDER BY taken_at DESC LIMIT 1',
                [userId]
            );

            // 테스트 기록이 없는 경우는 제외
            if (lastTest.length === 0) return;

            const lastDate = new Date(lastTest[0].taken_at);
            const now = new Date();
            const diffHours = (now - lastDate) / (1000 * 60 * 60);

            // 2. 24시간이 지났는지 확인
            if (diffHours >= 24) {
                // 3. 중복 알림 방지: 읽지 않은 동일한 유형의 알림이 이미 있는지 확인 후 삽입
                await pool.query(
                    `INSERT INTO notifications (user_id, type, message, link_to) 
                    SELECT ?, 'TEST', '마지막 테스트 이후 24시간이 지났습니다. 복습 테스트를 진행해볼까요?', '/test'
                    WHERE NOT EXISTS (
                        SELECT 1 FROM notifications 
                        WHERE user_id = ? AND type = 'TEST' AND is_read = false
                    )`,
                    [userId, userId]
                );
            }
        } catch (err) {
            console.error('알림 생성 서비스 에러:', err);
        }
    },
    /**
     * 사용자의 오답 기록을 바탕으로 정답률을 계산하여,
     * 24시간에 한 번씩 취약 단어 복습 알림을 생성합니다.
     */
    checkAndCreateWrongVocabReminder: async (userId) => {
        try {
            // 1. 24시간 주기 체크: 오늘 이미 생성된 'WRONG_VOCAB' 알림이 있는지 확인
            const [existingNotification] = await pool.query(
                `SELECT created_at FROM notifications 
                WHERE user_id = ? AND type = 'WRONG_VOCAB' 
                ORDER BY created_at DESC LIMIT 1`,
                [userId]
            );

            if (existingNotification.length > 0) {
                const lastCreated = new Date(existingNotification[0].created_at);
                const now = new Date();
                const diffHours = (now - lastCreated) / (1000 * 60 * 60);

                // 마지막 취약단어 알림이 발송된 지 24시간이 지나지 않았다면 함수 종료
                if (diffHours < 24) return;
            }

            // 2. 사용자의 모든 문항별 정오답 기록과 단어 정보 가져오기
            // test_results와 test_answers, words 테이블을 조인합니다.
            const [answers] = await pool.query(
                `SELECT ta.word_id, w.word, ta.is_correct 
                FROM test_answers ta 
                JOIN test_results tr ON ta.test_result_id = tr.id 
                JOIN words w ON ta.word_id = w.id 
                WHERE tr.user_id = ?`,
                [userId]
            );

            // 풀었던 문제 기록이 아예 없다면 알림을 생성하지 않음
            if (answers.length === 0) return;

            // 3. 단어별 정답률 계산을 위한 맵(Map) 데이터 구축
            // 구조: { 단어ID: { word: 'apple', total: 총푼횟수, correct: 맞은횟수 } }
            const wordStats = {};
            answers.forEach(ans => {
                if (!wordStats[ans.word_id]) {
                    wordStats[ans.word_id] = { word: ans.word, total: 0, correct: 0 };
                }
                wordStats[ans.word_id].total += 1;
                if (ans.is_correct) {
                    wordStats[ans.word_id].correct += 1;
                }
            });

            // 4. 팀원의 규칙을 그대로 적용하여 보통/어려움(정답률 < 90%) 단어 분류
            const weakWords = []; // 취약 단어들을 담을 배열

            Object.keys(wordStats).forEach(wordId => {
                const stat = wordStats[wordId];
                const accuracy = (stat.correct / stat.total) * 100;

                // 정답률이 90% 미만인 경우(보통 50~90%, 어려움 <50% 합산) 취약 단어로 취합
                if (accuracy < 90) {
                    weakWords.push({ id: wordId, word: stat.word });
                }
            });

            // 취약 단어가 하나도 없다면 종료
            if (weakWords.length === 0) return;

            // 5. 취약 단어 중 랜덤으로 1개 추출
            const randomIndex = Math.floor(Math.random() * weakWords.length);
            const selectedWord = weakWords[randomIndex];

            // 6. 알림 생성 문구 및 경로 설정
            const message = `혹시 '${selectedWord.word}'의 뜻을 기억하시나요? 취약 단어 복습하러 가기!`;
            const linkTo = '/wrongnotes';

            // 중복 생성 방지 쿼리 (미확인된 동일 유형 알림이 없을 때만 인서트)
            await pool.query(
                `INSERT INTO notifications (user_id, type, message, link_to) 
                SELECT ?, 'WRONG_VOCAB', ?, ? 
                WHERE NOT EXISTS (
                    SELECT 1 FROM notifications 
                    WHERE user_id = ? AND type = 'WRONG_VOCAB' AND is_read = false 
                )`,
                [userId, message, linkTo, userId]
            );

        } catch (err) {
            console.error('취약단어 알림 생성 중 에러 발생:', err);
        }
    }
};

module.exports = notificationService;