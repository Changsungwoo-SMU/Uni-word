import { useState, useEffect } from 'react';
import { api } from './lib/api';

// PBI-2 학습자 user story:
// "학습자로서, 50개 이상의 검증된 토익 단어장을 제공받고 싶다"

function WordList() {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');

  useEffect(() => {
    api.get('/words')
      .then((data) => {
        const list = Array.isArray(data) ? data : data.words || [];
        setWords(list);
      })
      .catch((err) => setErrorMsg(err.message || '단어를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = words.filter((w) => {
    if (levelFilter !== 'all' && Number(w.level) !== levelFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (w.word || '').toLowerCase().includes(q) ||
      (w.mean || '').includes(search)
    );
  });

  if (loading) {
    return <div className="text-center mt-20 text-gray-400 text-sm">단어를 불러오는 중...</div>;
  }

  if (errorMsg) {
    return (
      <div className="max-w-md mx-auto mt-20 bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <p className="text-red-600 font-semibold mb-1">단어 목록을 불러올 수 없습니다</p>
        <p className="text-sm text-red-500">{errorMsg}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4">
      <div className="mb-8">
        <p className="text-green-600 font-semibold text-xs mb-1 uppercase tracking-wide">Toeic Words</p>
        <h2 className="text-3xl font-extrabold text-gray-800 mb-1">영단어장</h2>
        <p className="text-sm text-gray-500">
          전체{' '}
          <span className="text-green-600 font-semibold">{words.length}개</span>의
          검증된 토익 단어
        </p>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex gap-2 flex-wrap">
          {[
            { value: 'all', label: '전체' },
            { value: 1, label: 'Lv.1' },
            { value: 2, label: 'Lv.2' },
            { value: 3, label: 'Lv.3' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setLevelFilter(f.value)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition border ${
                levelFilter === f.value
                  ? 'bg-green-600 text-white border-green-600 shadow-md shadow-green-200'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="단어 또는 뜻 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-400 focus:outline-none transition text-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">해당하는 단어가 없어요.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((w) => (
            <div
              key={w.id}
              className="bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm flex items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <p className="font-bold text-lg text-gray-800">{w.word}</p>
                <p className="text-sm text-gray-500 mt-0.5">{w.mean}</p>
              </div>
              {w.pos && (
                <span className="flex-shrink-0 text-xs text-gray-400">{w.pos}</span>
              )}
              {w.level && (
                <span className="flex-shrink-0 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                  Lv.{w.level}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WordList;
