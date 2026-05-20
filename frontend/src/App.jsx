import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Home from './Home';
import Test from './Test';
import AIExample from './AIExample';
import LevelTest from './LevelTest';
import Admin from './Admin';
import WordList from './WordList';
import FavoritesGroup from './FavoritesGroup';
import FavoritesGroupDetail from './FavoritesGroupDetail';
import Dashboard from './Dashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const navigate = useNavigate();
  const { isLoggedIn, isAdmin, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <nav className="bg-white shadow-sm p-4 border-b">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link
            to={isLoggedIn ? '/home' : '/'}
            className="text-2xl font-black text-green-600 tracking-tight"
          >
            Uni-Word
          </Link>
          <div className="space-x-4 font-semibold flex items-center">
            {isLoggedIn ? (
              <>
                {/* 관리자 전용 메뉴 */}
                {isAdmin && (
                  <Link
                    to="/admin/words"
                    className="text-purple-600 hover:text-purple-700 transition text-sm"
                  >
                    단어 관리
                  </Link>
                )}
                {/* 사용자 인사말 + 역할 뱃지 */}
                <span className="text-sm text-gray-500 hidden sm:inline">
                  {user?.name || user?.email}
                  <span
                    className={`ml-2 text-xs font-bold px-2 py-0.5 rounded-full ${
                      isAdmin
                        ? 'bg-purple-50 text-purple-600'
                        : 'bg-green-50 text-green-600'
                    }`}
                  >
                    {isAdmin ? '관리자' : '학습자'}
                  </span>
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link to="/register" className="text-gray-600 hover:text-green-500">
                  회원가입
                </Link>
                <Link
                  to="/"
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
                >
                  로그인
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-4 pb-12">
        <Routes>
          {/* 공개 */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 로그인 필요 (학습자/관리자 모두) */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wordlist"
            element={
              <ProtectedRoute>
                <WordList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/test"
            element={
              <ProtectedRoute>
                <Test />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-example"
            element={
              <ProtectedRoute>
                <AIExample />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leveltest"
            element={
              <ProtectedRoute>
                <LevelTest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites/groups"
            element={
              <ProtectedRoute>
                <FavoritesGroup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites/groups/:id"
            element={
              <ProtectedRoute>
                <FavoritesGroupDetail />
              </ProtectedRoute>
            }
          />

          {/* 관리자 전용 */}
          <Route
            path="/admin/words"
            element={
              <ProtectedRoute adminOnly>
                <Admin />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
