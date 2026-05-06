import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const VALID_EMAIL = 'qwerty123@gmail.com';
const VALID_PASSWORD = '123!';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (email !== VALID_EMAIL || password !== VALID_PASSWORD) {
      setErrorMsg('회원가입 후 로그인 가능합니다');
      return;
    }
    setErrorMsg('');
    localStorage.setItem('isLoggedIn', 'true');
    navigate('/home');
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

        <button type="submit" className="w-full bg-green-600 text-white p-4 rounded-xl hover:bg-green-700 transition mt-6 font-bold text-lg shadow-lg shadow-green-200 transform active:scale-95">
          로그인하고 시작하기
        </button>

        {errorMsg && (
          <p className="text-red-500 text-sm text-center">{errorMsg}</p>
        )}
      </form>
    </div>
  );
}

export default Login;