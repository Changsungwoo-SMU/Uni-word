// 공용 API 클라이언트
// - localStorage의 token을 자동으로 Authorization 헤더에 첨부
// - 401 응답 시 토큰/유저 정보 정리 후 로그인 페이지로 이동
// - Vite 프록시(vite.config.js)를 통해 /auth, /admin, /test, /words 가 백엔드(:3000)로 전달됨

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(path, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    throw new Error(data.message || `요청 실패 (${res.status})`);
  }

  return data;
}

export const api = {
  get:    (path)         => request(path),
  post:   (path, body)   => request(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:    (path, body)   => request(path, { method: 'PUT',    body: JSON.stringify(body) }),
  delete: (path)         => request(path, { method: 'DELETE' }),
};
