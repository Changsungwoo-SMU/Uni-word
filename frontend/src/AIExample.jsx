import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from './lib/api';

const LEVEL_LABEL = { 1: '초급', 2: '중급', 3: '고급' };
const LEVEL_COLOR = {
  1: 'bg-blue-50 text-blue-600',
  2: 'bg-yellow-50 text-yellow-600',
  3: 'bg-red-50 text-red-600',
};
const POS_KO = {
  noun: '명사', verb: '동사', adjective: '형용사', adverb: '부사',
};

function AIExample() {
  const navigate = useNavigate();

  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingWords, setLoadingWords] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // 예문 상태 (단어별로 캐싱)
  const [exampleCache, setExampleCache] = useState({});
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');

  useEffect(() => {
    api.get('/words')
      .then((data) => {
        const list = Array.isArray(data) ? data : data.words || [];
        setWords(list);
      })
      .catch((err) => setErrorMsg(err.message || '단어를 불러오지 못했습니다.'))
      .finally(() => setLoadingWords(false));
  }, []);

  if (loadingWords) {
    return <div className="text-center mt-20 text-gray-400">단어를 불러오는 중...</div>;
  }

  if (errorMsg) {
    return (
      <div className="max-w-md mx-auto mt-20 bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <p className="text-red-600 font-semibold mb-1">단어 목록을 불러올 수 없습니다</p>
        <p className="text-sm text-red-500">{errorMsg}</p>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="text-center mt-20 text-gray-400">단어가 없습니다.</div>
    );
  }

  const current = words[currentIndex];
  const cached = exampleCache[current.id];
  const isLast = currentIndex + 1 >= words.length;

  const handleGenerate = async () => {
    if (generating) return;
    setGenError('');
    setGenerating(true);
    try {
      const data = await api.post('/ai/example', { word_id: current.id });
      setExampleCache((prev) => ({
        ...prev,
        [current.id]: {
          example_en: data.example_en,
          example_ko: data.example_ko,
          isCached: data.message?.includes('기존'),
        },
      }));
    } catch (err) {
      setGenError(err.message || '예문 생성에 실패했습니다.');
    } finally {
      setGenerating(false);
    }
  };

  const handleNext = () => {
    setGenError('');
    if (!isLast) setCurrentIndex((i) => i + 1);
  };

  const handlePrev = () => {
    setGenError('');
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  return (
    <div className="max-w-lg mx-auto mt-12 px-4">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <p className="text-indigo-600 font-semibold text-xs uppercase tracking-wide mb-0.5">
            AI Example
          </p>
          <h2 className="text-2xl font-extrabold text-gray-800">AI 예문 생성</h2>
        </div>
        <span className="text-sm font-semibold text-gray-400">
          {currentIndex + 1} / {words.length}
        </span>
      </div>

      {/* 진행바 */}
      <div className="w-full bg-gray-100 rounded-full h-2 mb-8">
        <div
          className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
        />
      </div>

      {/* 단어 정보 카드 */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-xl p-8 mb-5 text-center">
        <div className="flex justify-center gap-2 mb-4">
          {current.level && (
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${LEVEL_COLOR[current.level]}`}>
              {LEVEL_LABEL[current.level]}
            </span>
          )}
          {current.pos && (
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-100 text-gray-500">
              {POS_KO[current.pos] || current.pos}
            </span>
          )}
        </div>
        <p className="text-4xl font-extrabold text-gray-800 mb-3">{current.word}</p>
        <p className="text-lg text-gray-500">{current.mean}</p>
      </div>

      {/* 생성된 예문 영역 */}
      <div className={`rounded-3xl border p-6 mb-5 transition-all ${
        cached
          ? 'bg-indigo-50 border-indigo-100'
          : 'bg-gray-50 border-gray-100'
      }`}>
        {cached ? (
          <>
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                cached.isCached
                  ? 'bg-gray-100 text-gray-500'
                  : 'bg-indigo-100 text-indigo-600'
              }`}>
                {cached.isCached ? '토익 예문' : 'AI 생성'}
              </span>
            </div>
            <p className="text-gray-800 font-semibold text-base leading-relaxed mb-3">
              {cached.example_en}
            </p>
            <p className="text-gray-500 text-sm leading-relaxed border-t border-indigo-100 pt-3">
              {cached.example_ko}
            </p>
          </>
        ) : (
          <div className="text-center py-6">
            <p className="text-3xl mb-3">✨</p>
            <p className="text-sm text-gray-400">
              버튼을 눌러 토익 예문을 불러오거나 AI로 예문을 생성하세요
            </p>
          </div>
        )}
      </div>

      {genError && (
        <p className="text-red-500 text-sm text-center mb-4">{genError}</p>
      )}

      {/* 버튼 영역 */}
      <div className="space-y-3">
        {/* 토익 예문에서 가져오기 / 문장 생성 버튼 */}
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full bg-indigo-600 text-white p-4 rounded-xl hover:bg-indigo-700 transition font-bold text-base shadow-lg shadow-indigo-200 active:scale-95 disabled:opacity-50"
        >
          {generating
            ? '생성 중...'
            : cached
            ? '예문 다시 불러오기'
            : '토익 예문에서 가져오기 / AI 예문 생성'}
        </button>

        {/* 다음으로 넘어가기 버튼 */}
        <button
          onClick={handleNext}
          disabled={isLast}
          className="w-full bg-white border-2 border-indigo-200 text-indigo-600 p-4 rounded-xl hover:bg-indigo-50 hover:border-indigo-400 transition font-bold text-base active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLast ? '마지막 단어입니다' : '다음으로 넘어가기 →'}
        </button>

        {/* 이전 / 홈 */}
        <div className="flex gap-3">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex-1 text-sm text-gray-400 hover:text-gray-600 transition disabled:opacity-30"
          >
            ← 이전
          </button>
          <button
            onClick={() => navigate('/home')}
            className="flex-1 text-sm text-gray-400 hover:text-gray-600 transition"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}

export default AIExample;
