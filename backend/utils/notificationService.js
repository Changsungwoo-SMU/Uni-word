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
    }
};

module.exports = notificationService;