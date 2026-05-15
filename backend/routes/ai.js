const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../config/db');
const { verifyToken } = require('../middlewares/authMiddleware');

const genAI = process.env.GEMINI_API_KEY
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

const exampleLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.' },
});

const parseAiResponse = (responseText) => {
    const fencedMatch = responseText.match(/```(?:\s*json)?\s*([\s\S]*?)```/i);
    const jsonText = fencedMatch ? fencedMatch[1].trim() : responseText.trim();
    const parsed = JSON.parse(jsonText);

    if (!parsed.example_en || !parsed.example_ko) {
        throw new Error('AI 응답에 필요한 예문 필드가 없습니다.');
    }

    return parsed;
};

// [POST] /ai/example - AI 예문 생성 및 캐싱
router.post('/example', exampleLimiter, verifyToken, async (req, res) => {
    try {
        if (!genAI) {
            return res.status(500).json({ message: 'GEMINI_API_KEY가 설정되지 않았습니다.' });
        }

        const { word_id } = req.body;

        if (!word_id) {
            return res.status(400).json({ message: "word_id가 필요합니다." });
        }

        const [words] = await db.query('SELECT * FROM words WHERE id = ?', [word_id]);

        if (words.length === 0) {
            return res.status(404).json({ message: "해당 단어를 찾을 수 없습니다." });
        }

        const wordData = words[0];

        // 캐싱 로직
        if (wordData.example_en && wordData.example_ko) {
            return res.status(200).json({
                message: "기존 예문을 불러왔습니다.",
                word: wordData.word,
                example_en: wordData.example_en,
                example_ko: wordData.example_ko
            });
        }

        const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

        const prompt = `
            토익 영단어인 '${wordData.word}'(뜻: ${wordData.mean}, 품사: ${wordData.pos || '알 수 없음'})를 사용해서 
            이 단어의 토익 기출 예문 1개와 한국어 해석을 생성하세요.
            응답 형식: { "example_en": "string", "example_ko": "string" }
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        let aiData;
        try {
            aiData = parseAiResponse(responseText);
        } catch (parseError) {
            console.error("AI 응답 파싱 실패:", parseError.message);
            return res.status(502).json({ message: "AI 응답 형식이 올바르지 않습니다." });
        }

        // DB 저장
        await db.query(
            'UPDATE words SET example_en = ?, example_ko = ? WHERE id = ?',
            [aiData.example_en, aiData.example_ko, word_id]
        );

        return res.status(200).json({
            message: "AI 예문이 성공적으로 생성되었습니다.",
            word: wordData.word,
            example_en: aiData.example_en,
            example_ko: aiData.example_ko
        });

    } catch (error) {
        console.error("AI 예문 생성 에러:", error.message);
        return res.status(500).json({ message: "서버 내부 에러가 발생했습니다." });
    }
});

module.exports = router;
