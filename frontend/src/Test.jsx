import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const ALL_WORDS = [
  { word: 'advocate',    meaning: '지지하다, 옹호자' },
  { word: 'allocate',    meaning: '할당하다, 배분하다' },
  { word: 'compensate',  meaning: '보상하다, 보충하다' },
  { word: 'consecutive', meaning: '연속적인, 계속되는' },
  { word: 'deficiency',  meaning: '결핍, 부족' },
  { word: 'feasible',    meaning: '실현 가능한, 가능한' },
  { word: 'initiative',  meaning: '주도권, 계획, 진취성' },
  { word: 'obligation',  meaning: '의무, 책임' },
  { word: 'procure',     meaning: '획득하다, 조달하다' },
  { word: 'substantial', meaning: '상당한, 실질적인' },
];

function saveWrongNote(word, meaning) {
  const notes = JSON.parse(localStorage.getItem('uni_word_wrong_notes') || '[]');
  const existing = notes.find((n) => n.word === word);
  if (existing) {
    existing.count += 1;
  } else {
    notes.push({ word, meaning, count: 1 });
  }
  localStorage.setItem('uni_word_wrong_notes', JSON.stringify(notes));
}

function saveTestHistory(score, total) {
  const history = JSON.parse(localStorage.getItem('uni_word_test_history') || '[]');
  history.unshift({
    date: new Date().toLocaleDateString('ko-KR'),
    score,
    total,
  });
  localStorage.setItem('uni_word_test_history', JSON.stringify(history.slice(0, 10)));
}

function Test() {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null); // null | 'correct' | 'wrong'
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [isWrongMode, setIsWrongMode] = useState(false);

  useEffect(() => {
    const mode = localStorage.getItem('uni_word_test_mode');
    if (mode === 'wrong') {
      localStorage.removeItem('uni_word_test_mode');
      const notes = JSON.parse(localStorage.getItem('uni_word_wrong_notes') || '[]');
      setQuestions(notes.length > 0 ? notes : ALL_WORDS);
      setIsWrongMode(notes.length > 0);
    } else {
      setQuestions(ALL_WORDS);
    }
  }, []);

  useEffect(() => {
    if (feedback === null && inputRef.current) inputRef.current.focus();
  }, [currentIndex, feedback]);

  const current = questions[currentIndex];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;

    const correct = userAnswer.trim().toLowerCase() === current.word.toLowerCase();
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) {
      setScore((s) => s + 1);
    } else {
      saveWrongNote(current.word, current.meaning);
    }
  };

  const handleNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= questions.length) {
      saveTestHistory(score + (feedback === 'correct' ? 1 : 0), questions.length);
      setFinished(true);
    } else {
      setCurrentIndex(nextIndex);
      setUserAnswer('');
      setFeedback(null);
    }
  };

  if (questions.length === 0) {
    return <div className="text-center mt-20 text-gray-400">단어를 불러오는 중...</div>;
  }

  if (finished) {
    const finalScore = score;
    const total = questions.length;
    const percent = Math.round((finalScore / total) * 100);
    return (
      <div className="max-w-md mx-auto mt-16 bg-white p-10 border rounded-3xl shadow-xl border-gray-100 text-center">
        <p className="text-green-600 font-semibold text-sm mb-2 uppercase tracking-wide">테스트 완료!</p>
        <h2 className="text-4xl font-extrabold text-gray-800 mb-1">
          {finalScore} <span className="text-xl text-gray-400 font-normal">/ {total}</span>
        </h2>
        <p className="text-gray-500 text-sm mb-8">정답률 {percent}%</p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/wrongnotes')}
            className="w-full bg-green-600 text-white p-3 rounded-xl hover:bg-green-700 transition font-semibold"
          >
            오답노트 확인하기
          </button>
          <button
            onClick={() => { setCurrentIndex(0); setScore(0); setFeedback(null); setUserAnswer(''); setFinished(false); }}
            className="w-full border border-gray-200 text-gray-600 p-3 rounded-xl hover:border-green-400 hover:text-green-600 transition font-semibold"
          >
            다시 테스트
          </button>
          <button
            onClick={() => navigate('/home')}
            className="text-sm text-gray-400 hover:text-gray-600 transition mt-1"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-12 px-4">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800">
            {isWrongMode ? '오답 테스트' : '단어 테스트'}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">한국어 뜻을 보고 영어 단어를 입력하세요</p>
        </div>
        <span className="text-sm font-semibold text-gray-400">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* 진행 바 */}
      <div className="w-full bg-gray-100 rounded-full h-2 mb-8">
        <div
          className="bg-green-500 h-2 rounded-full transition-all"
          style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
        />
      </div>

      {/* 문제 카드 */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-xl p-8 mb-6 text-center">
        <p className="text-sm text-gray-400 mb-3">한국어 뜻</p>
        <p className="text-2xl font-bold text-gray-800">{current.meaning}</p>
      </div>

      {/* 입력 폼 */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          ref={inputRef}
          type="text"
          placeholder="영어 단어를 입력하세요"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          disabled={feedback !== null}
          className={`w-full p-4 border rounded-xl focus:ring-2 focus:outline-none transition text-center text-lg font-semibold ${
            feedback === 'correct'
              ? 'border-green-400 bg-green-50 text-green-700 focus:ring-green-400'
              : feedback === 'wrong'
              ? 'border-red-400 bg-red-50 text-red-600 focus:ring-red-400'
              : 'focus:ring-green-400'
          }`}
        />

        {/* 피드백 */}
        {feedback === 'correct' && (
          <div className="text-center py-2">
            <p className="text-green-600 font-bold text-lg">정답이에요! ✓</p>
          </div>
        )}
        {feedback === 'wrong' && (
          <div className="text-center py-2">
            <p className="text-red-500 font-bold text-lg">오답이에요</p>
            <p className="text-sm text-gray-500 mt-1">
              정답: <span className="font-semibold text-gray-700">{current.word}</span>
            </p>
          </div>
        )}

        {feedback === null ? (
          <button
            type="submit"
            className="w-full bg-green-600 text-white p-4 rounded-xl hover:bg-green-700 transition font-bold text-lg shadow-lg shadow-green-200 active:scale-95"
          >
            제출하기
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="w-full bg-gray-800 text-white p-4 rounded-xl hover:bg-gray-900 transition font-bold text-lg active:scale-95"
          >
            {currentIndex + 1 >= questions.length ? '결과 보기' : '다음 문제 →'}
          </button>
        )}
      </form>
    </div>
  );
}

export default Test;
