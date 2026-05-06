import { useNavigate } from 'react-router-dom';

const MENU_CARDS = [
  {
    label: '영단어장',
    description: '저장된 단어를 카드로 학습해요',
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
    description: '틀린 단어만 모아서 복습해요',
    icon: '📝',
    path: '/wrongnotes',
    color: 'hover:border-red-400 hover:shadow-red-100',
  },
  {
    label: '대시보드',
    description: '나의 학습 현황을 확인해요',
    icon: '📊',
    path: '/dashboard',
    color: 'hover:border-purple-400 hover:shadow-purple-100',
  },
];

function Home() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto mt-12 px-4">
      {/* 환영 문구 */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-xl px-10 py-8 mb-10 text-center">
        <p className="text-green-600 font-semibold text-sm mb-2 tracking-wide uppercase">Welcome</p>
        <h2 className="text-3xl font-extrabold text-gray-800 mb-2">안녕하세요, Uni-Word입니다</h2>
        <p className="text-gray-500 text-sm">오늘도 꾸준히 단어를 학습해 보세요!</p>
      </div>

      {/* 메뉴 카드 4개 */}
      <div className="grid grid-cols-2 gap-4">
        {MENU_CARDS.map(({ label, description, icon, path, color }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`bg-white border border-gray-100 rounded-2xl p-6 text-left shadow-sm hover:shadow-md transition-all ${color} active:scale-95`}
          >
            <span className="text-3xl mb-3 block">{icon}</span>
            <p className="font-bold text-gray-800 text-lg leading-tight">{label}</p>
            <p className="text-gray-400 text-xs mt-1">{description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default Home;
