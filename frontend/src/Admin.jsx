import { useState, useEffect, useMemo } from 'react';
import { api } from './lib/api';

const POS_OPTIONS = ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'etc'];
const LEVEL_FILTERS = [
  { value: 'all', label: '전체' },
  { value: 1, label: 'Lv.1' },
  { value: 2, label: 'Lv.2' },
  { value: 3, label: 'Lv.3' },
];

function Admin() {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');

  // 추가 폼
  const [form, setForm] = useState({ word: '', mean: '', pos: 'noun', level: 1 });
  const [adding, setAdding] = useState(false);

  // 인라인 수정
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ word: '', mean: '', pos: 'noun', level: 1 });
  const [updating, setUpdating] = useState(false);

  const loadWords = () => {
    setLoading(true);
    setErrorMsg('');
    api.get('/admin/words')
      .then((data) => {
        const list = Array.isArray(data) ? data : data.words || [];
        setWords(list);
      })
      .catch((err) => setErrorMsg(err.message || '단어를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadWords(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.word.trim() || !form.mean.trim() || adding) return;
    setAdding(true);
    try {
      await api.post('/admin/words', {
        word: form.word.trim(),
        mean: form.mean.trim(),
        pos: form.pos,
        level: Number(form.level),
      });
      setForm({ word: '', mean: '', pos: 'noun', level: 1 });
      loadWords();
    } catch (err) {
      alert('단어 추가 실패: ' + (err.message || ''));
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (w) => {
    setEditingId(w.id);
    setEditForm({
      word: w.word || '',
      mean: w.mean || '',
      pos: w.pos || 'noun',
      level: w.level || 1,
    });
  };

  const cancelEdit = () => setEditingId(null);

  const handleUpdate = async (id) => {
    if (updating) return;
    setUpdating(true);
    try {
      await api.put(`/admin/words/${id}`, {
        word: editForm.word.trim(),
        mean: editForm.mean.trim(),
        pos: editForm.pos,
        level: Number(editForm.level),
      });
      setEditingId(null);
      loadWords();
    } catch (err) {
      alert('수정 실패: ' + (err.message || ''));
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id, word) => {
    if (!window.confirm(`'${word}' 단어를 삭제할까요?`)) return;
    try {
      await api.delete(`/admin/words/${id}`);
      loadWords();
    } catch (err) {
      alert('삭제 실패: ' + (err.message || ''));
    }
  };

  // 통계
  const total = words.length;
  const lvCount = useMemo(() => ({
    1: words.filter((w) => Number(w.level) === 1).length,
    2: words.filter((w) => Number(w.level) === 2).length,
    3: words.filter((w) => Number(w.level) === 3).length,
  }), [words]);

  // 필터
  const filtered = words.filter((w) => {
    if (levelFilter !== 'all' && Number(w.level) !== levelFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (w.word || '').toLowerCase().includes(q) || (w.mean || '').includes(search);
  });

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4 space-y-6">
      {/* 헤더 + 통계 */}
      <div>
        <p className="text-purple-600 font-semibold text-xs mb-1 uppercase tracking-wide">관리자</p>
        <h2 className="text-3xl font-extrabold text-gray-800 mb-1">단어 관리</h2>
        <p className="text-sm text-gray-500">단어를 추가, 수정, 삭제할 수 있어요.</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xs text-gray-500 font-medium mb-1">전체</p>
          <p className="text-2xl font-extrabold text-gray-800">{total}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xs text-gray-500 font-medium mb-1">Lv.1</p>
          <p className="text-2xl font-extrabold text-green-600">{lvCount[1]}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xs text-gray-500 font-medium mb-1">Lv.2</p>
          <p className="text-2xl font-extrabold text-blue-600">{lvCount[2]}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xs text-gray-500 font-medium mb-1">Lv.3</p>
          <p className="text-2xl font-extrabold text-purple-600">{lvCount[3]}</p>
        </div>
      </div>

      {/* 추가 폼 */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <p className="text-sm font-semibold text-gray-700 mb-3">+ 새 단어 추가</p>
        <form onSubmit={handleAdd} className="grid grid-cols-12 gap-2">
          <input
            type="text" placeholder="word"
            value={form.word}
            onChange={(e) => setForm({ ...form, word: e.target.value })}
            className="col-span-3 p-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-300 focus:outline-none"
            required
          />
          <input
            type="text" placeholder="뜻 (mean)"
            value={form.mean}
            onChange={(e) => setForm({ ...form, mean: e.target.value })}
            className="col-span-4 p-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-300 focus:outline-none"
            required
          />
          <select
            value={form.pos}
            onChange={(e) => setForm({ ...form, pos: e.target.value })}
            className="col-span-2 p-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-300 focus:outline-none"
          >
            {POS_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select
            value={form.level}
            onChange={(e) => setForm({ ...form, level: e.target.value })}
            className="col-span-1 p-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-300 focus:outline-none"
          >
            <option value={1}>Lv.1</option>
            <option value={2}>Lv.2</option>
            <option value={3}>Lv.3</option>
          </select>
          <button
            type="submit" disabled={adding}
            className="col-span-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
          >
            {adding ? '추가 중...' : '추가'}
          </button>
        </form>
      </div>

      {/* 필터 + 검색 */}
      <div className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          {LEVEL_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setLevelFilter(f.value)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition border ${
                levelFilter === f.value
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-purple-400 hover:text-purple-600'
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
          className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-purple-300 focus:outline-none transition text-sm"
        />
      </div>

      {/* 목록 */}
      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">불러오는 중...</div>
      ) : errorMsg ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-600 font-semibold mb-1">단어를 불러올 수 없습니다</p>
          <p className="text-sm text-red-500">{errorMsg}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">해당하는 단어가 없어요.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((w) => (
            <div
              key={w.id}
              className="bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm"
            >
              {editingId === w.id ? (
                <div className="grid grid-cols-12 gap-2 items-center">
                  <input
                    type="text" value={editForm.word}
                    onChange={(e) => setEditForm({ ...editForm, word: e.target.value })}
                    className="col-span-3 p-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-300 focus:outline-none"
                  />
                  <input
                    type="text" value={editForm.mean}
                    onChange={(e) => setEditForm({ ...editForm, mean: e.target.value })}
                    className="col-span-4 p-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-300 focus:outline-none"
                  />
                  <select
                    value={editForm.pos}
                    onChange={(e) => setEditForm({ ...editForm, pos: e.target.value })}
                    className="col-span-2 p-2 border rounded-lg text-sm focus:outline-none"
                  >
                    {POS_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <select
                    value={editForm.level}
                    onChange={(e) => setEditForm({ ...editForm, level: e.target.value })}
                    className="col-span-1 p-2 border rounded-lg text-sm focus:outline-none"
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                  </select>
                  <button
                    onClick={() => handleUpdate(w.id)}
                    disabled={updating}
                    className="col-span-1 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition disabled:opacity-50 py-2"
                  >저장</button>
                  <button
                    onClick={cancelEdit}
                    className="col-span-1 border border-gray-200 text-gray-500 text-xs font-semibold rounded-lg hover:border-gray-400 transition py-2"
                  >취소</button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <p className="font-bold text-gray-800 w-32 truncate">{w.word}</p>
                  <p className="flex-1 text-sm text-gray-600 truncate">{w.mean}</p>
                  <span className="text-xs text-gray-400 w-16 text-center">{w.pos || '-'}</span>
                  <span className="text-xs font-semibold text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full">
                    Lv.{w.level}
                  </span>
                  <button
                    onClick={() => startEdit(w)}
                    className="text-xs text-gray-500 hover:text-purple-600 font-semibold transition"
                  >수정</button>
                  <button
                    onClick={() => handleDelete(w.id, w.word)}
                    className="text-xs text-gray-400 hover:text-red-500 font-semibold transition"
                  >삭제</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Admin;
