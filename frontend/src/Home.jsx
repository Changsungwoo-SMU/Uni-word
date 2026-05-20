import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { api } from './lib/api';

const USER_CARDS = [
  {
    label: '영단어장',
    description: '저장된 단어를 살펴봐요',
    icon: '📖',
    path: '/wordlist',
    color: 'hover:border-green-400 hover:shadow-green-100',
  },
  {
    label: '단어 테스트',
    description: '랜덤 퀴즈로 실력을 확인해요',
    icon: '✏️',
    path: '/test',
    color: 'hover:border-blue-400 hover:shadow-blue-100',
  },
  {
    label: '오답노트',
    description: '틀린 단어를 다시 확인해요',
    icon: '📝',
    path: '/wrongnotes',
    color: 'hover:border-red-400 hover:shadow-red-100',
  },
  {
    label: 'AI 예문 생성',
    description: 'AI가 토익 예문을 만들어드려요',
    icon: '🤖',
    path: '/ai-example',
    color: 'hover:border-indigo-400 hover:shadow-indigo-100',
  },
  {
    label: '수준별 테스트',
    description: '나의 수준에 맞는 단어를 테스트해요',
    icon: '📊',
    path: '/leveltest',
    color: 'hover:border-purple-400 hover:shadow-purple-100',
  },
  {
    label: '즐겨찾기·그룹',
    description: '단어를 그룹으로 묶어 관리해요',
    icon: '⭐',
    path: '/favorites/groups',
    color: 'hover:border-yellow-400 hover:shadow-yellow-100',
  },
  {
    label: '대시보드',
    description: '나의 학습 현황을 한눈에 확인해요',
    icon: '📈',
    path: '/dashboard',
    color: 'hover:border-teal-400 hover:shadow-teal-100',
  },
];

const ADMIN_CARDS = [
  {
    label: '단어 관리',
    description: '단어를 추가, 수정, 삭제해요',
    icon: '🛠️',
    path: '/admin/words',
    color: 'hover:border-purple-400 hover:shadow-purple-100',
  },
];

function Home() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [popup, setPopup] = useState(null);

  useEffect(() => {
    api.get('/home')
      .then((data) => {
        if (data.showPopup && data.popupData) setPopup(data.popupData);
      })
      .catch(() => {});
  }, []);

  const closePopup = async () => {
    if (popup?.id) await api.patch(`/notifications/${popup.id}/read`).catch(() => {});
    setPopup(null);
  };

  const handlePopupAction = async () => {
    const link = popup?.link_to || '/test';
    if (popup?.id) await api.patch(`/notifications/${popup.id}/read`).catch(() => {});
    setPopup(null);
    navigate(link);
  };

  const cards = isAdmin ? ADMIN_CARDS : USER_CARDS;
  const greetingName = user?.name || user?.email || '사용자';

  return (
    <div className="max-w-2xl mx-auto mt-12 px-4">
      {popup && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full">
            <p className="text-base font-bold text-gray-800 mb-2">복습 알림</p>
            <p className="text-sm text-gray-600 mb-6">{popup.message}</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={handlePopupAction}
                className="w-full bg-green-600 text-white p-3 rounded-xl font-semibold hover:bg-green-700 transition"
              >
                테스트 하러 가기
              </button>
              <button
                onClick={closePopup}
                className="w-full border border-gray-200 text-gray-500 p-3 rounded-xl font-semibold hover:border-gray-400 transition"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 환영 카드 */}
      <div
        className={`rounded-3xl shadow-xl px-8 py-10 mb-8 text-white ${
          isAdmin
            ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
            : 'bg-gradient-to-br from-green-500 to-emerald-600'
        }`}
      >
        <p className="font-semibold text-sm mb-2 tracking-wide uppercase opacity-80">
          {isAdmin ? 'Admin Mode' : 'Welcome'}
        </p>
        <h2 className="text-3xl font-extrabold mb-2">
          {isAdmin
            ? `${greetingName}님, 단어장을 관리해주세요`
            : `안녕하세요, ${greetingName}님`}
        </h2>
        <p className="text-sm opacity-90">
          {isAdmin
            ? '학습자들이 사용하는 단어 데이터를 추가, 수정, 삭제할 수 있어요.'
            : '오늘도 꾸준히 단어를 학습해 보세요!'}
        </p>
      </div>

      {/* 메뉴 카드 */}
      <div className={`grid gap-4 ${cards.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {cards.map(({ label, description, icon, path, color }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`bg-white border border-gray-100 rounded-2xl p-6 text-left shadow-sm hover:shadow-md transition-all ${color} active:scale-95`}
          >
            <span className="text-3xl mb-3 block">{icon}</span>
            <p className="font-bold text-gray-900 text-lg leading-tight">{label}</p>
            <p className="text-gray-600 text-xs mt-1">{description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default Home;
