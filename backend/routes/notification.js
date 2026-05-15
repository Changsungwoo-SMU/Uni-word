const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken } = require('../middlewares/authMiddleware');

// 모든 알림 기능은 로그인이 필요함
router.use(verifyToken);

/**
 * 1. 알림 목록 조회 (종 모양 클릭 시)
 * GET /notifications
 */
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: '알림 조회 중 오류가 발생했습니다.' });
    }
});

/**
 * 2. 알림 읽음 처리
 * PATCH /notifications/:id/read
 */
router.patch('/:id/read', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query(
            'UPDATE notifications SET is_read = true WHERE id = ? AND user_id = ?',
            [id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '알림을 찾을 수 없거나 권한이 없습니다.' });
        }
        res.json({ message: '알림이 읽음 처리되었습니다.' });
    } catch (err) {
        res.status(500).json({ message: '알림 업데이트 중 오류가 발생했습니다.' });
    }
});

module.exports = router;