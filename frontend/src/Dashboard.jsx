import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { api } from './lib/api';

function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(() => {
    setLoading(true);
    setError('');
    api.get('/dashboard')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto mt-24 px-4 flex flex-col items-center gap-4 text-gray-400">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-sm">대시보드를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-24 px-4 flex flex-col items-center gap-4">
        <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-5 text-center w-full">
          <p className="text-red-600 font-semibold mb-1">데이터를 불러오지 못했어요</p>
          <p className="text-red-400 text-sm">{error}</p>
        </div>
        <button
          onClick={fetchDashboard}
          className="w-full py-3 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition"
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

  const recentChartData = (data.recent_tests || []).map((t) => ({
    x: t.display_order,
    score: Math.round(t.score),
  }));

  const wrongRateChartData = (data.wrong_rate_history || []).map((t) => ({
    x: t.nth_test,
    wrong_rate: Math.round(t.wrong_rate),
  }));

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4 pb-12 space-y-6">
      {/* 헤더 카드 */}
      <div className="rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white px-8 py-8 shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-widest opacity-75 mb-1">Dashboard</p>
        <h2 className="text-2xl font-extrabold mb-1">학습 현황</h2>
        <p className="text-sm opacity-90 font-semibold">
          총 테스트 {data.totalTests}회 완료
        </p>
      </div>

      {/* 암기 완료 단어 수 카드 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-5">
        <p className="text-xs text-gray-400 font-medium mb-1">암기 완료 단어 수</p>
        <p className="text-2xl font-extrabold text-green-600">
          {data.memorized_word_count} / {data.totalLearnedWords}개
        </p>
        <p className="text-xs text-gray-400 mt-1">누적 정답률 90% 이상 난이도 하 단어 기준</p>
      </div>

      {/* 최근 5회 점수 추이 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-5">
        <p className="text-sm font-bold text-gray-700 mb-4">최근 5회 점수 추이</p>
        {recentChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={recentChartData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="x"
                tickFormatter={(v) => `${v}회`}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
              />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(v) => `${v}점`}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
              />
              <Tooltip
                formatter={(value) => [`${value}점`, '점수']}
                labelFormatter={(label) => `${label}회차`}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4, fill: '#3b82f6' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400 text-sm text-center py-8">테스트 기록이 없어요</p>
        )}
      </div>

      {/* 전체 오답률 추이 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-5">
        <p className="text-sm font-bold text-gray-700 mb-4">전체 오답률 추이</p>
        {wrongRateChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={wrongRateChartData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="x"
                tickFormatter={(v) => `${v}회`}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
              />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
              />
              <Tooltip
                formatter={(value) => [`${value}%`, '오답률']}
                labelFormatter={(label) => `${label}회차`}
              />
              <Line
                type="monotone"
                dataKey="wrong_rate"
                stroke="#f97316"
                strokeWidth={2}
                dot={{ r: 4, fill: '#f97316' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400 text-sm text-center py-8">오답률 기록이 없어요</p>
        )}
      </div>

      <button
        onClick={() => navigate('/home')}
        className="w-full py-3 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition"
      >
        홈으로 돌아가기
      </button>
    </div>
  );
}

export default Dashboard;
