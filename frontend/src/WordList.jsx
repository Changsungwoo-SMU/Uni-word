import { useState, useEffect, useRef } from 'react';
import { api } from './lib/api';

function WordList() {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');

  // 즐겨찾기 그룹 드롭다운
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [openMenuWordId, setOpenMenuWordId] = useState(null);
  const [addingState, setAddingState] = useState(null); // { wordId, groupId }
  const [addError, setAddError] = useState('');
  const [successWordId, setSuccessWordId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    api.get('/words')
      .then((data) => {
        const list = Array.isArray(data) ? data : data.words || [];
        setWords(list);
      })
      .catch((err) => setErrorMsg(err.message || '단어를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuWordId(null);
        setAddError('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleStarClick = (wordId) => {
    if (openMenuWordId === wordId) {
      setOpenMenuWordId(null);
      return;
    }
    setAddError('');
    setOpenMenuWordId(wordId);
    // 그룹 목록은 처음 한 번만 로드
    if (groups.length === 0 && !groupsLoading) {
      setGroupsLoading(true);
      api.get('/favorites/groups')
        .then((res) => setGroups(res.groups || []))
        .catch(() => {})
        .finally(() => setGroupsLoading(false));
    }
  };

  const handleAddToGroup = async (wordId, groupId) => {
    if (addingState) return;
    setAddingState({ wordId, groupId });
    setAddError('');
    try {
      await api.post(`/favorites/groups/${groupId}/words`, { word_id: wordId });
      setOpenMenuWordId(null);
      setSuccessWordId(wordId);
      setTimeout(() => setSuccessWordId(null), 1500);
    } catch (err) {
      setAddError(err.message);
    } finally {
      setAddingState(null);
    }
  };

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

              {/* 즐겨찾기 그룹 추가 버튼 */}
              <div
                className="relative flex-shrink-0"
                ref={openMenuWordId === w.id ? menuRef : null}
              >
                <button
                  onClick={() => handleStarClick(w.id)}
                  className={`w-8 h-8 flex items-center justify-center rounded-full transition ${
                    successWordId === w.id
                      ? 'text-yellow-400'
                      : openMenuWordId === w.id
                      ? 'bg-yellow-50 text-yellow-400'
                      : 'text-gray-300 hover:text-yellow-400 hover:bg-yellow-50'
                  }`}
                  title="즐겨찾기 그룹에 추가"
                >
                  <span className="text-xl leading-none">
                    {successWordId === w.id ? '★' : '☆'}
                  </span>
                </button>

                {openMenuWordId === w.id && (
                  <div className="absolute right-0 top-10 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden">
                    <p className="text-xs font-semibold text-gray-500 px-4 pt-3 pb-2">그룹 선택</p>
                    {addError && (
                      <p className="text-xs text-red-500 px-4 pb-2">{addError}</p>
                    )}
                    {groupsLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="w-5 h-5 border-2 border-yellow-200 border-t-yellow-400 rounded-full animate-spin" />
                      </div>
                    ) : groups.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-4 px-4">그룹이 없어요</p>
                    ) : (
                      <ul className="max-h-48 overflow-y-auto pb-2">
                        {groups.map((g) => (
                          <li key={g.id}>
                            <button
                              onClick={() => handleAddToGroup(w.id, g.id)}
                              disabled={!!(addingState?.wordId === w.id && addingState?.groupId === g.id)}
                              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 transition flex items-center justify-between disabled:opacity-50"
                            >
                              <span className="truncate">{g.name}</span>
                              <span className="ml-2 shrink-0 flex items-center gap-1">
                                {g.is_default && (
                                  <span className="text-xs text-green-500">기본</span>
                                )}
                                {addingState?.wordId === w.id && addingState?.groupId === g.id && (
                                  <span className="w-3 h-3 border border-yellow-300 border-t-yellow-500 rounded-full animate-spin block" />
                                )}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WordList;
