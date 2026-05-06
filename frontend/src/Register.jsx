import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleRegister = (e) => {
    e.preventDefault();
    if (passwordMismatch) return;
    navigate('/');
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 border rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Uni-Word 회원가입</h2>
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
          <input type="text" placeholder="이름을 입력하세요" className="w-full p-2 border rounded focus:outline-none focus:border-green-500" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
          <input type="tel" placeholder="010-0000-0000" className="w-full p-2 border rounded focus:outline-none focus:border-green-500" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">생년월일</label>
          <input type="date" className="w-full p-2 border rounded focus:outline-none focus:border-green-500" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
          <input type="email" placeholder="이메일을 입력하세요" className="w-full p-2 border rounded focus:outline-none focus:border-green-500" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
          <input
            type="password"
            placeholder="비밀번호를 입력하세요"
            className="w-full p-2 border rounded focus:outline-none focus:border-green-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호 확인</label>
          <input
            type="password"
            placeholder="비밀번호를 다시 입력하세요"
            className={`w-full p-2 border rounded focus:outline-none ${passwordMismatch ? 'border-red-500 focus:border-red-500' : 'focus:border-green-500'}`}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {passwordMismatch && (
            <p className="text-red-500 text-sm mt-1">비밀번호가 일치하지 않습니다</p>
          )}
        </div>
        <button
          type="submit"
          disabled={passwordMismatch}
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 transition mt-4 disabled:opacity-50 disabled:cursor-not-allowed">
          회원가입
        </button>
        <p className="text-center text-sm text-gray-500">
          이미 계정이 있으신가요?{' '}
          <span onClick={() => navigate('/')} className="text-green-600 cursor-pointer hover:underline">로그인</span>
        </p>
      </form>
    </div>
  );
}

export default Register;