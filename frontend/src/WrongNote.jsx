import { useState, useEffect } from 'react';
import { api } from './lib/api';

function WrongNote() {
  // 오답 단어 목록, 로딩 상태, 에러 메시지 상태 관리
  const [wrongWords, setWrongWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // 컴포넌트 마운트 시 오답 단어 목록 조회
  useEffect(() => {
    // 목업 데이터 (백엔드 완성 전 UI 확인용)
    // 실제 API에서는 필터링/정렬이 백엔드에서 처리되어 옴
    const raw = [
      { id: 1, word: 'negotiate', mean: '협상하다', total: 5, wrong_count: 3, accuracy: 40.0 },
      { id: 2, word: 'implement', mean: '시행하다', total: 3, wrong_count: 1, accuracy: 66.7 },
      { id: 3, word: 'allocate', mean: '할당하다', total: 4, wrong_count: 2, accuracy: 50.0 },
      { id: 4, word: 'obtain', mean: '얻다', total: 10, wrong_count: 1, accuracy: 90.0 },  // 정답률 90% → 제외
      { id: 5, word: 'suspend', mean: '중단하다', total: 0, wrong_count: 0, accuracy: 0 }, // 미출제 → 제외
    ];

    // ※ 한 번도 출제되지 않은 단어 제외 (total === 0)
    // ※ 정답률 90% 미만인 단어만 포함
    // ※ wrong_count 내림차순 정렬
    const filtered = raw
      .filter((w) => w.total > 0 && w.accuracy < 90)
      .sort((a, b) => b.wrong_count - a.wrong_count);

    setWrongWords(filtered);
    setLoading(false);
  }, []);

  // 로딩 중
  if (loading) {
    return <div className="text-center mt-20 text-gray-400 text-sm">불러오는 중...</div>;
  }

  // 에러 발생 시
  if (errorMsg) {
    return (
      <div className="max-w-md mx-auto mt-20 bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <p className="text-red-600 font-semibold mb-1">오답 단어를 불러올 수 없습니다</p>
        <p className="text-sm text-red-500">{errorMsg}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4">
      {/* 헤더: 제목 + 오답 단어 수 */}
      <div className="mb-8">
        <p className="text-red-500 font-semibold text-xs mb-1 uppercase tracking-wide">Wrong Note</p>
        <h2 className="text-3xl font-extrabold text-gray-800 mb-1">오답노트</h2>
        <p className="text-sm text-gray-500">
          틀린 단어{' '}
          <span className="text-red-500 font-semibold">{wrongWords.length}개</span>
        </p>
      </div>

      {/* 오답 단어가 없을 때 */}
      {wrongWords.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">오답 단어가 없어요.</div>
      ) : (
        // 오답 단어 리스트 (백엔드에서 오답 횟수 내림차순으로 정렬되어 옴)
        <div className="space-y-2">
          {wrongWords.map((w) => (
            <div
              key={w.id}
              className="bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm flex items-center gap-4"
            >
              {/* 영단어 + 뜻 */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-lg text-gray-800">{w.word}</p>
                <p className="text-sm text-gray-500 mt-0.5">{w.mean}</p>
              </div>

              {/* 오답 횟수 */}
              <div className="flex-shrink-0 text-right">
                <p className="text-xs text-gray-400">오답 횟수</p>
                <p className="text-lg font-extrabold text-red-500">{w.wrong_count}</p>
              </div>

              {/* 정답률: 50% 미만이면 빨간색, 이상이면 주황색 */}
              <div className="flex-shrink-0 text-right">
                <p className="text-xs text-gray-400">정답률</p>
                <p className={`text-lg font-extrabold ${w.accuracy < 50 ? 'text-red-500' : 'text-orange-400'}`}>
                  {w.accuracy}%
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WrongNote;
