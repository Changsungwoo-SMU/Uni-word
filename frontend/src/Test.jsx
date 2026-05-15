import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from './lib/api';

const COUNT_OPTIONS = [5, 10, 20];

function Test() {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // 'setup' | 'playing' | 'result'
  const [phase, setPhase] = useState('setup');
  const [count, setCount] = useState(10);

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const startTest = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const data = await api.get(`/test/questions?count=${count}`);
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

  // ===== Setup 화면 =====
  if (phase === 'setup') {
    return (
      <div className="max-w-md mx-auto mt-12 px-4">
        <div className="bg-white border border-gray-100 rounded-3xl shadow-xl p-10">
          <p className="text-green-600 font-semibold text-sm mb-2 uppercase tracking-wide text-center">START</p>
          <h2 className="text-3xl font-extrabold text-gray-800 mb-2 text-center">단어 테스트</h2>
          <p className="text-sm text-gray-500 text-center mb-8">
            한국어 뜻을 보고 영어 단어를 입력하세요
          </p>

          <p className="text-sm font-semibold text-gray-700 mb-3">문제 수 선택</p>
          <div className="grid grid-cols-3 gap-3 mb-8">
            {COUNT_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => setCount(n)}
                className={`p-4 rounded-2xl border-2 font-bold text-lg transition ${
                  count === n
                    ? 'bg-green-600 text-white border-green-600 shadow-md shadow-green-200'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-green-400'
                }`}
              >
                {n}
                <span className="block text-xs font-normal opacity-70 mt-0.5">문제</span>
              </button>
            ))}
          </div>

          {errorMsg && (
            <p className="text-red-500 text-sm text-center mb-4">{errorMsg}</p>
          )}

          <button
            onClick={startTest}
            disabled={loading}
            className="w-full bg-green-600 text-white p-4 rounded-xl hover:bg-green-700 transition font-bold text-lg shadow-lg shadow-green-200 active:scale-95 disabled:opacity-50"
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
        <p className="text-green-600 font-semibold text-sm mb-2 uppercase tracking-wide text-center">테스트 완료!</p>
        <h2 className="text-5xl font-extrabold text-gray-800 mb-2 text-center">
          {correct} <span className="text-2xl text-gray-300 font-normal">/ {total}</span>
        </h2>
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full"
              style={{ width: `${Number(percent)}%` }}
            />
          </div>
          <p className="text-sm font-semibold text-gray-600">{Number(percent).toFixed(0)}%</p>
        </div>

        {result.details && result.details.length > 0 && (
          <div className="border-t border-gray-100 pt-4 mb-6">
            <p className="text-sm font-semibold text-gray-600 mb-3">정답 확인</p>
            <ul className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {result.details.map((d, i) => (
                <li
                  key={d.word_id ?? i}
                  className={`flex items-center justify-between text-sm py-1.5 px-3 rounded-lg ${
                    d.is_correct ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <span className="text-gray-400 text-xs">Q{i + 1}</span>
                  <span className={`font-semibold ${d.is_correct ? 'text-green-600' : 'text-red-500'}`}>
                    {d.correct_answer} {d.is_correct ? '✓' : '✗'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <button
            onClick={() => setPhase('setup')}
            className="w-full bg-green-600 text-white p-3 rounded-xl hover:bg-green-700 transition font-semibold"
          >
            다시 테스트
          </button>
          <button
            onClick={() => navigate('/home')}
            className="w-full border border-gray-200 text-gray-600 p-3 rounded-xl hover:border-green-400 hover:text-green-600 transition font-semibold"
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
        const data = await api.post('/test/submit', { answers: newAnswers });
        // 서버가 test_results, test_answers 테이블에 저장함 (PBI-4 DoD)
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800">단어 테스트</h2>
          <p className="text-sm text-gray-500 mt-0.5">한국어 뜻을 보고 영어 단어를 입력하세요</p>
        </div>
        <span className="text-sm font-semibold text-gray-400">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-2 mb-8">
        <div
          className="bg-green-500 h-2 rounded-full transition-all"
          style={{ width: `${(currentIndex / questions.length) * 100}%` }}
        />
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl shadow-xl p-8 mb-6 text-center">
        <p className="text-sm text-gray-400 mb-3">한국어 뜻</p>
        <p className="text-2xl font-bold text-gray-800">{current.mean}</p>
        {current.level && (
          <p className="text-xs text-gray-400 mt-3">난이도 Lv.{current.level}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          ref={inputRef}
          type="text"
          placeholder="영어 단어를 입력하세요"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          disabled={submitting}
          className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-green-400 focus:outline-none transition text-center text-lg font-semibold"
          autoComplete="off"
        />

        <button
          type="submit"
          disabled={submitting || !userAnswer.trim()}
          className="w-full bg-green-600 text-white p-4 rounded-xl hover:bg-green-700 transition font-bold text-lg shadow-lg shadow-green-200 active:scale-95 disabled:opacity-50"
        >
          {submitting ? '채점 중...' : isLast ? '제출하기' : '다음 문제 →'}
        </button>
      </form>
    </div>
  );
}

export default Test;
