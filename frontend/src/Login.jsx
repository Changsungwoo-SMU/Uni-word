import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from './lib/api';
import { useAuth } from './contexts/AuthContext';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setErrorMsg('');
    setSubmitting(true);
    try {
      const data = await api.post('/auth/login', { email, password });
      login(data.token, data.user);
      navigate('/home');
    } catch (err) {
      setErrorMsg(err.message || '이메일 또는 비밀번호가 일치하지 않습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 bg-white p-10 border rounded-3xl shadow-xl border-gray-100">
      <h2 className="text-3xl font-extrabold text-center mb-10 text-gray-800">Uni-Word 로그인</h2>

      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1.5">이메일</label>
          <input
            type="email"
            placeholder="이메일을 입력하세요"
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-400 focus:outline-none transition"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrorMsg(''); }}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1.5">비밀번호</label>
          <input
            type="password"
            placeholder="비밀번호를 입력하세요"
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-400 focus:outline-none transition"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setErrorMsg(''); }}
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-green-600 text-white p-4 rounded-xl hover:bg-green-700 transition mt-6 font-bold text-lg shadow-lg shadow-green-200 transform active:scale-95 disabled:opacity-50"
        >
          {submitting ? '로그인 중...' : '로그인하고 시작하기'}
        </button>

        {errorMsg && (
          <p className="text-red-500 text-sm text-center">{errorMsg}</p>
        )}
      </form>
    </div>
  );
}

export default Login;
