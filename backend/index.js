require('dotenv').config();
const express = require('express');
const pool = require('./config/db');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const testRoutes = require('./routes/test');
const wordsRoutes = require('./routes/words');
const levelTestRoutes = require('./routes/leveltest');
const wrongNoteRoutes = require('./routes/wrongnote');
const favoritesRoutes = require('./routes/favorites');
const aiRouter = require('./routes/ai');
const dashboardRoutes = require('./routes/dashboard');
const notificationRoutes = require('./routes/notification');
const notificationService = require('./utils/notificationService');
const { verifyToken } = require('./middlewares/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// JSON 데이터 파싱을 위한 미들웨어 (필수!)
app.use(express.json());

// 라우터 등록
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/test', testRoutes);
app.use('/words', wordsRoutes);
app.use('/leveltest', levelTestRoutes);
app.use('/wrongnotes', wrongNoteRoutes);
app.use('/favorites', favoritesRoutes);
app.use('/ai', aiRouter);
app.use('/dashboard', dashboardRoutes);
app.use('/notifications', notificationRoutes);

app.get('/', (req, res) => {
    res.send('영어 단어 앱 서버 실행 중!');
});

// 홈 화면 진입 시 호출되는 API (프론트엔드에서 메인 페이지 로드 시 호출)
app.get('/home', verifyToken, async (req, res) => {
    try {
        // 1. 24시간 체크 및 알림 생성 실행
        await notificationService.checkAndCreateTestReminder(req.user.id);

        // 2. 신규 취약 단어 알림 체크 (정답률 계산 및 24시간 주기 확인) 추가!
        await notificationService.checkAndCreateWrongVocabReminder(req.user.id);

        // 3. 현재 읽지 않은 최신 테스트 알림이 있는지 확인 (팝업용)
        const [unreadNotifications] = await pool.query(
            "SELECT * FROM notifications WHERE user_id = ? AND type = 'TEST' AND is_read = false ORDER BY created_at DESC LIMIT 1",
            [req.user.id]
        );

        res.json({
            message: "홈 데이터 로드 완료",
            showPopup: unreadNotifications.length > 0, // 팝업을 띄워야 하는지 여부
            popupData: unreadNotifications[0] || null  // 팝업에 표시할 내용
        });
    } catch (err) {
        res.status(500).json({ message: "데이터 로드 중 오류 발생" });
    }
});

app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
