require('dotenv').config();
const express = require('express');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const testRoutes = require('./routes/test');

const app = express();
const PORT = process.env.PORT || 3000;

// JSON 데이터 파싱을 위한 미들웨어 (필수!)
app.use(express.json());

// 라우터 등록
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/test', testRoutes);

app.get('/', (req, res) => {
    res.send('영어 단어 앱 서버 실행 중!');
});

app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});