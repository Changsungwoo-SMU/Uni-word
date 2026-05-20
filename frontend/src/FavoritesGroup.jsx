import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from './lib/api';

function FavoritesGroup() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [saving, setSaving] = useState(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const editInputRef = useRef(null);

  const fetchGroups = useCallback(() => {
    setLoading(true);
    setError('');
    api.get('/favorites/groups')
      .then((res) => setGroups(res.groups))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  useEffect(() => {
    if (editingId !== null) editInputRef.current?.focus();
  }, [editingId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim() || creating) return;
    setCreating(true);
    try {
      await api.post('/favorites/groups', { name: newName.trim() });
      setNewName('');
      fetchGroups();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (group) => {
    setEditingId(group.id);
    setEditingName(group.name);
    setConfirmDeleteId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleEditSave = async (id) => {
    if (!editingName.trim() || saving) return;
    setSaving(true);
    try {
      await api.patch(`/favorites/groups/${id}`, { name: editingName.trim() });
      setEditingId(null);
      fetchGroups();
    } catch (err) {
      setError(err.message);
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (deleting) return;
    setDeleting(true);
    try {
      await api.delete(`/favorites/groups/${id}`);
      setConfirmDeleteId(null);
      fetchGroups();
    } catch (err) {
      setError(err.message);
      setConfirmDeleteId(null);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto mt-24 px-4 flex flex-col items-center gap-4 text-gray-400">
        <div className="w-10 h-10 border-4 border-green-200 border-t-green-500 rounded-full animate-spin" />
        <p className="text-sm">즐겨찾기 그룹을 불러오는 중...</p>
      </div>
    );
  }

  if (error && groups.length === 0) {
    return (
      <div className="max-w-2xl mx-auto mt-24 px-4 flex flex-col items-center gap-4">
        <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-5 text-center w-full">
          <p className="text-red-600 font-semibold mb-1">그룹을 불러오지 못했어요</p>
          <p className="text-red-400 text-sm">{error}</p>
        </div>
        <button
          onClick={fetchGroups}
          className="w-full py-3 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition"
        >
          다시 시도
        </button>
        <button
          onClick={() => navigate('/home')}
          className="text-sm text-gray-400 underline"
        >
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4 pb-12 space-y-5">
      {/* 헤더 */}
      <div className="rounded-3xl bg-gradient-to-br from-green-500 to-emerald-600 text-white px-8 py-8 shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-widest opacity-75 mb-1">Favorites</p>
        <h2 className="text-2xl font-extrabold mb-1">즐겨찾기 그룹</h2>
        <p className="text-sm opacity-90">단어를 그룹으로 묶어 관리해요</p>
      </div>

      {/* 에러 배너 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-center justify-between">
          <p className="text-red-500 text-sm">{error}</p>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 text-lg leading-none">✕</button>
        </div>
      )}

      {/* 그룹 목록 */}
      <div className="space-y-3">
        {groups.map((group) => (
          <div
            key={group.id}
            className="bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm"
          >
            {editingId === group.id ? (
              /* 인라인 편집 모드 */
              <div className="flex items-center gap-2">
                <input
                  ref={editInputRef}
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleEditSave(group.id);
                    if (e.key === 'Escape') cancelEdit();
                  }}
                  className="flex-1 px-3 py-1.5 border border-green-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                  maxLength={30}
                />
                <button
                  onClick={() => handleEditSave(group.id)}
                  disabled={saving || !editingName.trim()}
                  className="px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-xl hover:bg-green-600 transition disabled:opacity-50"
                >
                  저장
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-3 py-1.5 border border-gray-200 text-gray-400 text-xs font-semibold rounded-xl hover:bg-gray-50 transition"
                >
                  취소
                </button>
              </div>
            ) : confirmDeleteId === group.id ? (
              /* 삭제 확인 모드 */
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-red-500">"{group.name}"</span> 그룹을 삭제할까요?
                  <span className="block text-xs text-gray-400 mt-0.5">그룹 내 단어도 함께 삭제됩니다.</span>
                </p>
                <div className="flex gap-2 ml-3 shrink-0">
                  <button
                    onClick={() => handleDelete(group.id)}
                    disabled={deleting}
                    className="px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-xl hover:bg-red-600 transition disabled:opacity-50"
                  >
                    삭제
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="px-3 py-1.5 border border-gray-200 text-gray-400 text-xs font-semibold rounded-xl hover:bg-gray-50 transition"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              /* 기본 표시 모드 */
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigate(`/favorites/groups/${group.id}`, {
                    state: { isDefault: group.is_default, groupName: group.name },
                  })}
                  className="flex items-center gap-2 min-w-0 text-left flex-1"
                >
                  <span className="font-bold text-gray-800 truncate hover:text-yellow-500 transition">{group.name}</span>
                  {group.is_default && (
                    <span className="shrink-0 text-xs font-semibold bg-green-50 text-green-600 border border-green-200 px-2 py-0.5 rounded-full">
                      기본
                    </span>
                  )}
                  <span className="text-xs text-gray-400 shrink-0">{group.word_count}개</span>
                </button>
                <div className="flex items-center gap-2 ml-3 shrink-0">
                  {!group.is_default && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); startEdit(group); }}
                        className="p-1.5 text-gray-300 hover:text-green-500 transition"
                        title="이름 수정"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(group.id); setEditingId(null); }}
                        className="p-1.5 text-gray-300 hover:text-red-500 transition"
                        title="그룹 삭제"
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {groups.length === 0 && !loading && (
          <p className="text-center text-gray-400 text-sm py-6">그룹이 없어요</p>
        )}
      </div>

      {/* 그룹 추가 */}
      <form onSubmit={handleCreate} className="bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm">
        <p className="text-xs font-semibold text-gray-500 mb-3">새 그룹 추가</p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="그룹 이름을 입력하세요"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            maxLength={30}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-300 transition"
          />
          <button
            type="submit"
            disabled={!newName.trim() || creating}
            className="px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-xl hover:bg-green-600 transition disabled:opacity-50"
          >
            {creating ? '추가 중...' : '추가'}
          </button>
        </div>
      </form>

      <button
        onClick={() => navigate('/home')}
        className="w-full py-3 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition"
      >
        홈으로 돌아가기
      </button>
    </div>
  );
}

export default FavoritesGroup;
