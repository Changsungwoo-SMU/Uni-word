import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * 로그인 / 권한 가드
 * - 비로그인: '/'(로그인 화면)으로 리다이렉트
 * - adminOnly={true} 인데 admin이 아니면: '/home'으로 리다이렉트
 */
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isLoggedIn, isAdmin } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/home" replace />;
  }

  return children;
}
