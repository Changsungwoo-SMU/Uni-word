import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { api } from './lib/api';
import Login from './Login';
import Register from './Register';
import Home from './Home';
import Test from './Test';
import AIExample from './AIExample';
import LevelTest from './LevelTest';
import Admin from './Admin';
import WordList from './WordList';
import WrongNote from './WrongNote';
import FavoritesGroup from './FavoritesGroup';
import FavoritesGroupDetail from './FavoritesGroupDetail';
import Dashboard from './Dashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const navigate = useNavigate();
  const { isLoggedIn, isAdmin, user, logout } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleBellClick = async () => {
    if (notifOpen) { setNotifOpen(false); return; }
    setNotifOpen(true);
    setNotifLoading(true);
    try {
      const data = await api.get('/notifications');
      setNotifications(Array.isArray(data) ? data : data.notifications || []);
    } catch {}
    finally { setNotifLoading(false); }
  };

  const handleNotifClick = async (notif) => {
    await api.patch(`/notifications/${notif.id}/read`).catch(() => {});
    setNotifications((prev) => prev.map((n) => n.id === notif.id ? { ...n, is_read: true } : n));
    setNotifOpen(false);
    navigate(notif.link_to);
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

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
                {/* 알림 종 버튼 */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={handleBellClick}
                    className="relative p-2 text-gray-500 hover:text-green-600 transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </button>
                  {notifOpen && (
                    <div className="absolute right-0 top-10 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-bold text-gray-700">알림</p>
                      </div>
                      {notifLoading ? (
                        <div className="p-4 text-center text-sm text-gray-400">불러오는 중...</div>
                      ) : notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-400">알림이 없어요</div>
                      ) : (
                        <ul className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                          {notifications.map((n) => (
                            <li
                              key={n.id}
                              onClick={() => handleNotifClick(n)}
                              className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition ${!n.is_read ? 'bg-green-50' : ''}`}
                            >
                              <p className="text-sm text-gray-700">{n.message}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(n.created_at).toLocaleDateString('ko-KR')}
                              </p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
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

          <Route
            path="/wrongnotes"
            element={
              <ProtectedRoute>
                <WrongNote />
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
