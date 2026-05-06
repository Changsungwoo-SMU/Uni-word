import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();

  const history = JSON.parse(localStorage.getItem('uni_word_test_history') || '[]');
  const wrongNotes = JSON.parse(localStorage.getItem('uni_word_wrong_notes') || '[]');

  const today = new Date().toLocaleDateString('ko-KR');
  const todayTests = history.filter((h) => h.date === today);
  const todayWords = todayTests.reduce((sum, h) => sum + h.total, 0);

  const avgWrongRate =
    history.length > 0
      ? Math.round(
          (history.reduce((sum, h) => sum + (1 - h.score / h.total), 0) / history.length) * 100
        )
      : 0;

  const recentHistory = history.slice(0, 5);

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4 space-y-6">
      <h2 className="text-3xl font-extrabold text-gray-800">대시보드</h2>

      {/* 통계 카드 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm text-center">
          <p className="text-xs text-gray-500 font-medium mb-2">오늘 학습한 단어</p>
          <p className="text-4xl font-extrabold text-green-600">{todayWords}</p>
          <p className="text-xs text-gray-400 mt-1">개</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm text-center">
          <p className="text-xs text-gray-500 font-medium mb-2">평균 오답률</p>
          <p className="text-4xl font-extrabold text-red-500">{avgWrongRate}</p>
          <p className="text-xs text-gray-400 mt-1">%</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm text-center">
          <p className="text-xs text-gray-500 font-medium mb-2">누적 오답 단어</p>
          <p className="text-4xl font-extrabold text-gray-800">{wrongNotes.length}</p>
          <p className="text-xs text-gray-400 mt-1">개</p>
        </div>
      </div>

      {/* 최근 테스트 기록 */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">최근 테스트 기록</h3>
          <button
            onClick={() => navigate('/test')}
            className="text-sm text-green-600 font-semibold hover:text-green-700 transition"
          >
            테스트 시작 →
          </button>
        </div>

        {recentHistory.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-400 text-sm">
            아직 테스트 기록이 없어요.
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {recentHistory.map((record, i) => {
              const percent = Math.round((record.score / record.total) * 100);
              return (
                <li key={i} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-700 text-sm">{record.date}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {record.total}문제 중 {record.score}개 정답
                    </p>
                  </div>
                  <span
                    className={`text-sm font-bold px-3 py-1 rounded-full ${
                      percent >= 80
                        ? 'bg-green-50 text-green-600'
                        : percent >= 50
                        ? 'bg-yellow-50 text-yellow-600'
                        : 'bg-red-50 text-red-500'
                    }`}
                  >
                    {percent}%
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
