import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from './lib/api';

const LEVEL_LABEL = { 1: '하', 2: '중', 3: '상' };
const LEVEL_COLOR = {
  1: 'bg-blue-50 text-blue-600',
  2: 'bg-yellow-50 text-yellow-600',
  3: 'bg-red-50 text-red-600',
};

function LevelTest() {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // 'start' | 'playing' | 'result'
  const [phase, setPhase] = useState('start');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const startTest = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const data = await api.get('/leveltest/questions');
      const qs = data.questions || [];
      if (qs.length === 0) {
        setErrorMsg('출제할 단어가 없습니다. 관리자에게 문의해주세요.');
        return;
      }
      setQuestions(qs);
      setCurrentIndex(0);
      setUserAnswer('');
      setAnswers([]);
      setResult(null);
      setPhase('playing');
    } catch (err) {
      setErrorMsg(err.message || '문제를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (phase === 'playing' && inputRef.current) inputRef.current.focus();
  }, [phase, currentIndex]);

  // ===== 시작 화면 =====
  if (phase === 'start') {
    return (
      <div className="max-w-md mx-auto mt-12 px-4">
        <div className="bg-white border border-gray-100 rounded-3xl shadow-xl p-10">
          <p className="text-purple-600 font-semibold text-sm mb-2 uppercase tracking-wide text-center">
            LEVEL TEST
          </p>
          <h2 className="text-3xl font-extrabold text-gray-800 mb-2 text-center">
            수준별 단어 테스트
          </h2>
          <p className="text-sm text-gray-500 text-center mb-6">
            한국어 뜻을 보고 영어 단어를 입력하세요
          </p>

          <div className="flex justify-center gap-3 mb-8">
            {[1, 2, 3].map((lv) => (
              <span
                key={lv}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full ${LEVEL_COLOR[lv]}`}
              >
                Lv.{lv} {LEVEL_LABEL[lv]}
              </span>
            ))}
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 mb-8 text-sm text-gray-500 space-y-1.5">
            <p>• 총 10문제가 출제됩니다</p>
            <p>• 틀린 횟수에 따라 난이도가 자동 결정됩니다</p>
            <p>• 대소문자와 앞뒤 공백은 무시됩니다</p>
          </div>

          {errorMsg && (
            <p className="text-red-500 text-sm text-center mb-4">{errorMsg}</p>
          )}

          <button
            onClick={startTest}
            disabled={loading}
            className="w-full bg-purple-600 text-white p-4 rounded-xl hover:bg-purple-700 transition font-bold text-lg shadow-lg shadow-purple-200 active:scale-95 disabled:opacity-50"
          >
            {loading ? '준비 중...' : '테스트 시작 →'}
          </button>

          <button
            onClick={() => navigate('/home')}
            className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600 transition"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // ===== 결과 화면 =====
  if (phase === 'result' && result) {
    const total = result.total_count ?? result.details?.length ?? 0;
    const correct = result.correct_count ?? 0;
    const percent = result.score ?? (total ? Math.round((correct / total) * 100) : 0);

    return (
      <div className="max-w-md mx-auto mt-12 bg-white p-10 border rounded-3xl shadow-xl border-gray-100">
        <p className="text-purple-600 font-semibold text-sm mb-2 uppercase tracking-wide text-center">
          테스트 완료!
        </p>
        <h2 className="text-5xl font-extrabold text-gray-800 mb-2 text-center">
          {correct}{' '}
          <span className="text-2xl text-gray-300 font-normal">/ {total}</span>
        </h2>

        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-40 h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all"
              style={{ width: `${Number(percent)}%` }}
            />
          </div>
          <p className="text-sm font-bold text-gray-700">
            {Number(percent).toFixed(0)}%
          </p>
        </div>

        {result.details && result.details.length > 0 && (
          <div className="border-t border-gray-100 pt-4 mb-6">
            <p className="text-sm font-semibold text-gray-600 mb-3">정답 확인</p>
            <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {result.details.map((d, i) => {
                const q = questions[i];
                return (
                  <li
                    key={d.word_id ?? i}
                    className={`flex items-center justify-between text-sm py-2 px-3 rounded-xl ${
                      d.is_correct ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-gray-400 text-xs shrink-0">Q{i + 1}</span>
                      {q?.level && (
                        <span
                          className={`text-xs font-semibold px-1.5 py-0.5 rounded shrink-0 ${LEVEL_COLOR[q.level]}`}
                        >
                          {LEVEL_LABEL[q.level]}
                        </span>
                      )}
                      {q?.mean && (
                        <span className="text-gray-500 text-xs truncate">{q.mean}</span>
                      )}
                    </div>
                    <span
                      className={`font-semibold shrink-0 ml-2 ${
                        d.is_correct ? 'text-green-600' : 'text-red-500'
                      }`}
                    >
                      {d.correct_answer} {d.is_correct ? '✓' : '✗'}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <button
            onClick={() => setPhase('start')}
            className="w-full bg-purple-600 text-white p-3 rounded-xl hover:bg-purple-700 transition font-semibold"
          >
            다시 테스트
          </button>
          <button
            onClick={() => navigate('/home')}
            className="w-full border border-gray-200 text-gray-600 p-3 rounded-xl hover:border-purple-400 hover:text-purple-600 transition font-semibold"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // ===== 풀이 화면 =====
  if (phase !== 'playing' || questions.length === 0) {
    return <div className="text-center mt-20 text-gray-400">불러오는 중...</div>;
  }

  const current = questions[currentIndex];
  const isLast = currentIndex + 1 >= questions.length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userAnswer.trim() || submitting) return;

    const newAnswers = [
      ...answers,
      { word_id: current.id, user_answer: userAnswer.trim() },
    ];

    if (isLast) {
      setSubmitting(true);
      try {
        const data = await api.post('/leveltest/submit', { answers: newAnswers });
        setResult(data.result || data);
        setPhase('result');
      } catch (err) {
        alert('채점 중 오류: ' + (err.message || ''));
      } finally {
        setSubmitting(false);
      }
    } else {
      setAnswers(newAnswers);
      setCurrentIndex((i) => i + 1);
      setUserAnswer('');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 px-4">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800">수준별 단어 테스트</h2>
          <p className="text-sm text-gray-500 mt-0.5">한국어 뜻을 보고 영어 단어를 입력하세요</p>
        </div>
        <span className="text-sm font-semibold text-gray-400">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* 진행바 */}
      <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
        <div
          className="bg-purple-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* 문제 목록 점 표시 */}
      <div className="flex gap-1 justify-center mb-6">
        {questions.map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i < currentIndex
                ? 'w-2 bg-purple-300'
                : i === currentIndex
                ? 'w-5 bg-purple-600'
                : 'w-2 bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* 문제 카드 */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-xl p-8 mb-6 text-center">
        {current.level && (
          <span
            className={`text-xs font-semibold px-3 py-1.5 rounded-full inline-block mb-4 ${LEVEL_COLOR[current.level]}`}
          >
            난이도 {LEVEL_LABEL[current.level]}
          </span>
        )}
        <p className="text-sm text-gray-400 mb-3">한국어 뜻</p>
        <p className="text-3xl font-bold text-gray-800">{current.mean}</p>
      </div>

      {/* 입력 폼 */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          ref={inputRef}
          type="text"
          placeholder="영어 단어를 입력하세요"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          disabled={submitting}
          className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none transition text-center text-lg font-semibold"
          autoComplete="off"
          autoCapitalize="none"
        />

        <button
          type="submit"
          disabled={submitting || !userAnswer.trim()}
          className="w-full bg-purple-600 text-white p-4 rounded-xl hover:bg-purple-700 transition font-bold text-lg shadow-lg shadow-purple-200 active:scale-95 disabled:opacity-50"
        >
          {submitting ? '채점 중...' : isLast ? '제출하기' : '다음 문제 →'}
        </button>
      </form>
    </div>
  );
}

export default LevelTest;
