const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken } = require('../middlewares/authMiddleware');

// 유저의 즐겨찾기(default) 그룹 조회 또는 생성
async function getOrCreateDefaultGroup(userId) {
    const [[existing]] = await pool.query(
        'SELECT id FROM word_groups WHERE user_id = ? AND is_default = true',
        [userId]
    );
    if (existing) return existing.id;
    const [result] = await pool.query(
        'INSERT INTO word_groups (user_id, name, is_default) VALUES (?, ?, true)',
        [userId, '즐겨찾기']
    );
    return result.insertId;
}

// 그룹이 해당 유저 소유인지 확인
async function getGroup(groupId, userId) {
    const [[group]] = await pool.query(
        'SELECT * FROM word_groups WHERE id = ? AND user_id = ?',
        [groupId, userId]
    );
    return group;
}

// GET /favorites/groups — 내 그룹 목록 (단어 수 포함)
router.get('/groups', verifyToken, async (req, res) => {
    const userId = req.user.id;
    await getOrCreateDefaultGroup(userId);

    try {
        const [groups] = await pool.query(`
            SELECT g.id, g.name, g.is_default, g.created_at,
                   COUNT(i.id) AS word_count
            FROM word_groups g
            LEFT JOIN word_group_items i ON i.group_id = g.id
            WHERE g.user_id = ?
            GROUP BY g.id
            ORDER BY g.is_default DESC, g.created_at ASC
        `, [userId]);

        res.json({ groups });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});

// POST /favorites/groups — 새 그룹 생성
router.post('/groups', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const { name } = req.body;

    if (!name?.trim()) {
        return res.status(400).json({ success: false, message: '그룹 이름을 입력해주세요.' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO word_groups (user_id, name, is_default) VALUES (?, ?, false)',
            [userId, name.trim()]
        );
        res.status(201).json({ success: true, group: { id: result.insertId, name: name.trim(), is_default: false } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});

// PATCH /favorites/groups/:id — 그룹 이름 수정 (커스텀 그룹만)
router.patch('/groups/:id', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const groupId = parseInt(req.params.id);
    const { name } = req.body;

    if (!name?.trim()) {
        return res.status(400).json({ success: false, message: '그룹 이름을 입력해주세요.' });
    }

    try {
        const group = await getGroup(groupId, userId);
        if (!group) return res.status(404).json({ success: false, message: '그룹을 찾을 수 없습니다.' });
        if (group.is_default) return res.status(403).json({ success: false, message: '기본 즐겨찾기 그룹은 수정할 수 없습니다.' });

        await pool.query('UPDATE word_groups SET name = ? WHERE id = ?', [name.trim(), groupId]);
        res.json({ success: true, group: { id: groupId, name: name.trim() } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});

// DELETE /favorites/groups/:id — 그룹 삭제 (커스텀 그룹만, 속한 단어도 cascade)
router.delete('/groups/:id', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const groupId = parseInt(req.params.id);

    try {
        const group = await getGroup(groupId, userId);
        if (!group) return res.status(404).json({ success: false, message: '그룹을 찾을 수 없습니다.' });
        if (group.is_default) return res.status(403).json({ success: false, message: '기본 즐겨찾기 그룹은 삭제할 수 없습니다.' });

        await pool.query('DELETE FROM word_groups WHERE id = ?', [groupId]);
        res.json({ success: true, message: '그룹이 삭제되었습니다.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});

// GET /favorites/groups/:id/words — 그룹 내 단어 조회
router.get('/groups/:id/words', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const groupId = parseInt(req.params.id);

    try {
        const group = await getGroup(groupId, userId);
        if (!group) return res.status(404).json({ success: false, message: '그룹을 찾을 수 없습니다.' });

        const [words] = await pool.query(`
            SELECT w.id, w.word, w.mean, w.pos, w.level, i.added_at
            FROM word_group_items i
            JOIN words w ON w.id = i.word_id
            WHERE i.group_id = ?
            ORDER BY i.added_at DESC
        `, [groupId]);

        res.json({ group_id: groupId, group_name: group.name, words });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});

// POST /favorites/groups/:id/words — 그룹에 단어 추가
router.post('/groups/:id/words', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const groupId = parseInt(req.params.id);
    const { word_id } = req.body;

    if (!word_id) return res.status(400).json({ success: false, message: 'word_id가 필요합니다.' });

    try {
        const group = await getGroup(groupId, userId);
        if (!group) return res.status(404).json({ success: false, message: '그룹을 찾을 수 없습니다.' });

        await pool.query(
            'INSERT IGNORE INTO word_group_items (group_id, word_id) VALUES (?, ?)',
            [groupId, word_id]
        );
        res.status(201).json({ success: true, message: '단어가 추가되었습니다.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});

// DELETE /favorites/groups/:id/words/:wordId — 그룹에서 단어 제거
router.delete('/groups/:id/words/:wordId', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const groupId = parseInt(req.params.id);
    const wordId = parseInt(req.params.wordId);

    try {
        const group = await getGroup(groupId, userId);
        if (!group) return res.status(404).json({ success: false, message: '그룹을 찾을 수 없습니다.' });

        await pool.query(
            'DELETE FROM word_group_items WHERE group_id = ? AND word_id = ?',
            [groupId, wordId]
        );
        res.json({ success: true, message: '단어가 제거되었습니다.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});

// POST /favorites/star/:wordId — 즐겨찾기(default) 토글 (별 버튼)
router.post('/star/:wordId', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const wordId = parseInt(req.params.wordId);

    try {
        const defaultGroupId = await getOrCreateDefaultGroup(userId);

        const [[existing]] = await pool.query(
            'SELECT id FROM word_group_items WHERE group_id = ? AND word_id = ?',
            [defaultGroupId, wordId]
        );

        if (existing) {
            await pool.query(
                'DELETE FROM word_group_items WHERE group_id = ? AND word_id = ?',
                [defaultGroupId, wordId]
            );
            res.json({ success: true, starred: false, message: '즐겨찾기에서 제거되었습니다.' });
        } else {
            await pool.query(
                'INSERT INTO word_group_items (group_id, word_id) VALUES (?, ?)',
                [defaultGroupId, wordId]
            );
            res.json({ success: true, starred: true, message: '즐겨찾기에 추가되었습니다.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});

module.exports = router;
