import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import StationSelectPage from './pages/StationSelectPage';
import KDSBoardPage from './pages/KDSBoardPage';

function getValidSession() {
  const raw = localStorage.getItem('kds_session');
  if (!raw) return null;

  try {
    const session = JSON.parse(raw);

    if (!session?.expiresAt || Date.now() > session.expiresAt) {
      localStorage.removeItem('kds_session');
      return null;
    }

    return session;
  } catch {
    localStorage.removeItem('kds_session');
    return null;
  }
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const session = getValidSession();
  return session?.user ? <>{children}</> : <Navigate to="/login" replace />;
}

function StationRoute({ children }: { children: React.ReactNode }) {
  const session = getValidSession();

  if (!session?.user) {
    return <Navigate to="/login" replace />;
  }

  if (!session?.station) {
    return <Navigate to="/station-select" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  useEffect(() => {
    const interval = setInterval(() => {
      const session = getValidSession();
      if (!session && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/station-select"
          element={
            <ProtectedRoute>
              <StationSelectPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/kds"
          element={
            <StationRoute>
              <KDSBoardPage />
            </StationRoute>
          }
        />

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}