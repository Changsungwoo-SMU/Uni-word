import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { api } from './lib/api';

const LEVEL_LABEL = { 1: '하', 2: '중', 3: '상' };
const LEVEL_COLOR = {
  1: 'bg-green-50 text-green-600 border-green-200',
  2: 'bg-yellow-50 text-yellow-600 border-yellow-200',
  3: 'bg-red-50 text-red-600 border-red-200',
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

function FavoritesGroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isDefault = location.state?.isDefault ?? false;
  const [groupName, setGroupName] = useState(location.state?.groupName ?? '');
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [confirmRemoveId, setConfirmRemoveId] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [starringId, setStarringId] = useState(null);

  const fetchWords = useCallback(() => {
    setLoading(true);
    setError('');
    api.get(`/favorites/groups/${id}/words`)
      .then((res) => {
        setGroupName(res.group_name);
        setWords(res.words);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { fetchWords(); }, [fetchWords]);

  const handleStarToggle = async (wordId) => {
    if (starringId) return;
    setStarringId(wordId);
    try {
      const res = await api.post(`/favorites/star/${wordId}`);
      if (!res.starred) {
        setWords((prev) => prev.filter((w) => w.id !== wordId));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setStarringId(null);
    }
  };

  const handleRemove = async (wordId) => {
    if (removingId) return;
    setRemovingId(wordId);
    try {
      await api.delete(`/favorites/groups/${id}/words/${wordId}`);
      setConfirmRemoveId(null);
      setWords((prev) => prev.filter((w) => w.id !== wordId));
    } catch (err) {
      setError(err.message);
      setConfirmRemoveId(null);
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto mt-24 px-4 flex flex-col items-center gap-4 text-gray-400">
        <div className="w-10 h-10 border-4 border-yellow-200 border-t-yellow-400 rounded-full animate-spin" />
        <p className="text-sm">단어 목록을 불러오는 중...</p>
      </div>
    );
  }

  if (error && words.length === 0) {
    return (
      <div className="max-w-2xl mx-auto mt-24 px-4 flex flex-col items-center gap-4">
        <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-5 text-center w-full">
          <p className="text-red-600 font-semibold mb-1">데이터를 불러오지 못했어요</p>
          <p className="text-red-400 text-sm">{error}</p>
        </div>
        <button
          onClick={fetchWords}
          className="w-full py-3 rounded-xl bg-yellow-400 text-white text-sm font-semibold hover:bg-yellow-500 transition"
        >
          다시 시도
        </button>
        <button
          onClick={() => navigate('/favorites/groups')}
          className="text-sm text-gray-400 underline"
        >
          그룹 목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4 pb-12 space-y-5">
      {/* 헤더 */}
      <div className="rounded-3xl bg-gradient-to-br from-yellow-400 to-orange-400 text-white px-8 py-8 shadow-xl">
        <button
          onClick={() => navigate('/favorites/groups')}
          className="text-xs opacity-70 hover:opacity-100 transition mb-2 flex items-center gap-1"
        >
          ← 그룹 목록
        </button>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-2xl font-extrabold">{groupName}</h2>
          {isDefault && (
            <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full">기본</span>
          )}
        </div>
        <p className="text-sm opacity-90">단어 {words.length}개</p>
      </div>

      {/* 에러 배너 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-center justify-between">
          <p className="text-red-500 text-sm">{error}</p>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 text-lg leading-none">✕</button>
        </div>
      )}

      {/* 단어 목록 */}
      <div className="space-y-3">
        {words.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl px-6 py-10 text-center shadow-sm">
            <p className="text-gray-400 text-sm">이 그룹에 단어가 없어요</p>
          </div>
        ) : (
          words.map((word) => (
            <div key={word.id} className="bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm">
              {confirmRemoveId === word.id ? (
                /* 제거 확인 모드 */
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-red-500">"{word.word}"</span>를 그룹에서 제거할까요?
                  </p>
                  <div className="flex gap-2 ml-3 shrink-0">
                    <button
                      onClick={() => handleRemove(word.id)}
                      disabled={removingId === word.id}
                      className="px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-xl hover:bg-red-600 transition disabled:opacity-50"
                    >
                      제거
                    </button>
                    <button
                      onClick={() => setConfirmRemoveId(null)}
                      className="px-3 py-1.5 border border-gray-200 text-gray-400 text-xs font-semibold rounded-xl hover:bg-gray-50 transition"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                /* 기본 표시 모드 */
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800 text-base">{word.word}</p>
                    <p className="text-gray-500 text-sm mt-0.5">{word.mean}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
                        {word.pos}
                      </span>
                      <span className={`text-xs font-semibold border px-2 py-0.5 rounded-full ${LEVEL_COLOR[word.level] ?? 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                        {LEVEL_LABEL[word.level] ?? word.level}
                      </span>
                      <span className="text-xs text-gray-300">{formatDate(word.added_at)}</span>
                    </div>
                  </div>
                  <div className="shrink-0 pt-0.5">
                    {isDefault ? (
                      /* 기본 그룹: 별 버튼으로 토글 제거 */
                      <button
                        onClick={() => handleStarToggle(word.id)}
                        disabled={starringId === word.id}
                        className="w-7 h-7 flex items-center justify-center text-yellow-400 hover:text-yellow-500 transition disabled:opacity-40"
                        title="즐겨찾기에서 제거"
                      >
                        {starringId === word.id
                          ? <span className="w-4 h-4 border-2 border-yellow-300 border-t-yellow-500 rounded-full animate-spin block" />
                          : <span className="text-xl leading-none">★</span>
                        }
                      </button>
                    ) : (
                      /* 일반 그룹: 제거 버튼 */
                      <button
                        onClick={() => setConfirmRemoveId(word.id)}
                        className="text-xs text-gray-400 hover:text-red-500 transition"
                      >
                        제거
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <button
        onClick={() => navigate('/favorites/groups')}
        className="w-full py-3 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition"
      >
        그룹 목록으로 돌아가기
      </button>
    </div>
  );
}

export default FavoritesGroupDetail;
