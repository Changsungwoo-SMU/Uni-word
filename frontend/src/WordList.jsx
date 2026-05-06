import { useState } from 'react';

const INITIAL_WORDS = [
  { id: 1,  word: 'advocate',    meaning: '지지하다, 옹호자' },
  { id: 2,  word: 'allocate',    meaning: '할당하다, 배분하다' },
  { id: 3,  word: 'compensate',  meaning: '보상하다, 보충하다' },
  { id: 4,  word: 'consecutive', meaning: '연속적인, 계속되는' },
  { id: 5,  word: 'deficiency',  meaning: '결핍, 부족' },
  { id: 6,  word: 'feasible',    meaning: '실현 가능한, 가능한' },
  { id: 7,  word: 'initiative',  meaning: '주도권, 계획, 진취성' },
  { id: 8,  word: 'obligation',  meaning: '의무, 책임' },
  { id: 9,  word: 'procure',     meaning: '획득하다, 조달하다' },
  { id: 10, word: 'substantial', meaning: '상당한, 실질적인' },
];

function WordList() {
  const [words, setWords] = useState(
    INITIAL_WORDS.map((w) => ({ ...w, memorized: false, favorited: false }))
  );
  const [search, setSearch] = useState('');
  const [showUnmemorizedOnly, setShowUnmemorizedOnly] = useState(false);

  const toggleMemorized = (id) =>
    setWords((prev) => prev.map((w) => (w.id === id ? { ...w, memorized: !w.memorized } : w)));

  const toggleFavorite = (id) =>
    setWords((prev) => prev.map((w) => (w.id === id ? { ...w, favorited: !w.favorited } : w)));

  const filtered = words.filter((w) => {
    const matchesSearch =
      w.word.toLowerCase().includes(search.toLowerCase()) || w.meaning.includes(search);
    const matchesFilter = showUnmemorizedOnly ? !w.memorized : true;
    return matchesSearch && matchesFilter;
  });

  const memorizedCount = words.filter((w) => w.memorized).length;

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-1">영단어장</h2>
        <p className="text-sm text-gray-500">
          전체 {words.length}개 · 암기 완료{' '}
          <span className="text-green-600 font-semibold">{memorizedCount}개</span>
        </p>
      </div>

      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="단어 또는 뜻 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 p-3 border rounded-xl focus:ring-2 focus:ring-green-400 focus:outline-none transition text-sm"
        />
        <button
          onClick={() => setShowUnmemorizedOnly((prev) => !prev)}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition border ${
            showUnmemorizedOnly
              ? 'bg-green-600 text-white border-green-600 shadow-md shadow-green-200'
              : 'bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-600'
          }`}
        >
          미암기만 보기
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">해당하는 단어가 없어요.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((w) => (
            <div
              key={w.id}
              className={`bg-white border rounded-2xl px-5 py-4 shadow-sm flex items-center gap-4 transition ${
                w.memorized ? 'border-green-200 bg-green-50' : 'border-gray-100'
              }`}
            >
              <input
                type="checkbox"
                checked={w.memorized}
                onChange={() => toggleMemorized(w.id)}
                className="w-5 h-5 accent-green-600 cursor-pointer flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-lg leading-tight ${w.memorized ? 'text-green-700 line-through opacity-60' : 'text-gray-800'}`}>
                  {w.word}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">{w.meaning}</p>
              </div>
              <button
                onClick={() => toggleFavorite(w.id)}
                className={`text-2xl leading-none transition-transform active:scale-90 ${
                  w.favorited ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-300'
                }`}
              >
                ★
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WordList;
