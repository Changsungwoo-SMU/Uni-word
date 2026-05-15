import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from './lib/api';

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleRegister = async (e) => {
    e.preventDefault();
    if (passwordMismatch || submitting) return;
    setErrorMsg('');
    setSubmitting(true);
    try {
      await api.post('/auth/signup', { email, password, name });
      alert('회원가입이 완료되었습니다. 로그인해주세요.');
      navigate('/');
    } catch (err) {
      setErrorMsg(err.message || '회원가입에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-10 border rounded-3xl shadow-xl border-gray-100">
      <h2 className="text-3xl font-extrabold text-center mb-8 text-gray-800">Uni-Word 회원가입</h2>

      <form onSubmit={handleRegister} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1.5">이름</label>
          <input
            type="text"
            placeholder="이름을 입력하세요"
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-400 focus:outline-none transition"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1.5">이메일</label>
          <input
            type="email"
            placeholder="이메일을 입력하세요"
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-400 focus:outline-none transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1.5">비밀번호 확인</label>
          <input
            type="password"
            placeholder="비밀번호를 다시 입력하세요"
            className={`w-full p-3 border rounded-xl focus:outline-none transition ${
              passwordMismatch
                ? 'border-red-400 focus:ring-2 focus:ring-red-300'
                : 'focus:ring-2 focus:ring-green-400'
            }`}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {passwordMismatch && (
            <p className="text-red-500 text-sm mt-1.5">비밀번호가 일치하지 않습니다</p>
          )}
        </div>

        {errorMsg && (
          <p className="text-red-500 text-sm text-center">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={passwordMismatch || submitting}
          className="w-full bg-green-600 text-white p-4 rounded-xl hover:bg-green-700 transition mt-4 font-bold text-lg shadow-lg shadow-green-200 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? '가입 중...' : '회원가입'}
        </button>

        <p className="text-center text-sm text-gray-500">
          이미 계정이 있으신가요?{' '}
          <span
            onClick={() => navigate('/')}
            className="text-green-600 cursor-pointer hover:underline font-semibold"
          >
            로그인
          </span>
        </p>
      </form>
    </div>
  );
}

export default Register;
