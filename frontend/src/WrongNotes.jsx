import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function WrongNotes() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState(
    () => JSON.parse(localStorage.getItem('uni_word_wrong_notes') || '[]')
  );

  const handleRetestWrong = () => {
    localStorage.setItem('uni_word_test_mode', 'wrong');
    navigate('/test');
  };

  const handleClear = () => {
    if (!window.confirm('오답 목록을 모두 초기화할까요?')) return;
    localStorage.removeItem('uni_word_wrong_notes');
    setNotes([]);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800 mb-1">오답노트</h2>
          <p className="text-sm text-gray-500">
            틀린 단어{' '}
            <span className="text-red-500 font-semibold">{notes.length}개</span>
          </p>
        </div>
        {notes.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={handleRetestWrong}
              className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-700 transition shadow-md shadow-green-200 active:scale-95"
            >
              오답만 다시 테스트
            </button>
            <button
              onClick={handleClear}
              className="border border-gray-200 text-gray-500 px-4 py-2 rounded-xl text-sm font-semibold hover:border-red-300 hover:text-red-500 transition"
            >
              초기화
            </button>
          </div>
        )}
      </div>

      {notes.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl shadow-xl px-10 py-16 text-center">
          <p className="text-4xl mb-4">🎉</p>
          <p className="text-gray-700 font-bold text-lg mb-1">오답이 없어요!</p>
          <p className="text-gray-400 text-sm mb-6">테스트를 완료하면 틀린 단어가 여기에 쌓여요.</p>
          <button
            onClick={() => navigate('/test')}
            className="bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition"
          >
            테스트 시작하기
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {notes
            .slice()
            .sort((a, b) => b.count - a.count)
            .map((note) => (
              <div
                key={note.word}
                className="bg-white border border-red-100 rounded-2xl px-5 py-4 shadow-sm flex items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg text-gray-800">{note.word}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{note.meaning}</p>
                </div>
                <span className="flex-shrink-0 bg-red-50 text-red-500 text-xs font-bold px-3 py-1.5 rounded-full border border-red-100">
                  {note.count}회 틀림
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default WrongNotes;
