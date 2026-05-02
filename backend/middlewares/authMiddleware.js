const jwt = require('jsonwebtoken');

// 1. 토큰 유효성 검사 미들웨어
const verifyToken = (req, res, next) => {
    // 헤더에서 토큰 추출 (보통 'Bearer TOKEN_STR' 형식으로 옴)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: '로그인이 필요한 서비스입니다.' });
    }

    try {
        // 토큰 해독 및 검증
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 해독된 유저 정보(id, role)를 req.user에 저장 (다음 단계에서 사용 가능)
        req.user = decoded;

        // 다음 미들웨어나 라우터로 통과!
        next();
    } catch (err) {
        return res.status(403).json({ message: '유효하지 않은 토큰입니다.' });
    }
};

// 2. 관리자 권한 확인 미들웨어
const isAdmin = (req, res, next) => {
    // verifyToken을 먼저 거쳐야 req.user가 존재함
    if (req.user && req.user.role === 'admin') {
        next(); // 관리자면 통과!
    } else {
        return res.status(403).json({ message: '관리자 권한이 없습니다.' });
    }
};

module.exports = { verifyToken, isAdmin };