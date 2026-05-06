import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import Register from './Register';
import WordList from './WordList';
import Home from './Home';
import Test from './Test';
import WrongNotes from './WrongNotes';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  // 라우트 변경마다 localStorage를 다시 읽어 로그인 상태 반영
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <nav className="bg-white shadow-sm p-4 border-b">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-black text-green-600 tracking-tight">Uni-Word</h1>
          <div className="space-x-4 font-semibold flex items-center">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition"
              >
                로그아웃
              </button>
            ) : (
              <>
                <Link to="/register" className="text-gray-600 hover:text-green-500">회원가입</Link>
                <Link to="/" className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition">
                  로그인
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <main className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/wordlist" element={<WordList />} />
          <Route path="/home" element={<Home />} />
          <Route path="/test" element={<Test />} />
          <Route path="/wrongnotes" element={<WrongNotes />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
