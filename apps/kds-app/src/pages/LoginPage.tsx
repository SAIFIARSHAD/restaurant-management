import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginKDS } from '../services/authApi';
import { useKDSStore } from '../store/kdsStore';

type ErrorWithResponse = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

export default function LoginPage() {
  const navigate = useNavigate();
  const setUser = useKDSStore((state) => state.setUser);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginKDS({ email, password });

      if (res.success && res.user && res.token) {
        const authUser = {
          ...res.user,
          token: res.token,
        };

        const session = {
          user: authUser,
          station: null,
          expiresAt: Date.now() + 12 * 60 * 60 * 1000, // 12 hours
        };

        localStorage.setItem('kds_session', JSON.stringify(session));
        setUser(authUser);

        navigate('/station-select', { replace: true });
      } else {
        setError(res.message || 'Login failed. Check credentials.');
      }
    } catch (err: unknown) {
      const apiError = err as ErrorWithResponse;
      setError(apiError.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-orange-500 flex items-center justify-center mb-3">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <path d="M3 3h18v4H3zM3 10h18v4H3zM3 17h18v4H3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">KDS Kitchen</h1>
          <p className="text-gray-400 text-sm mt-1">Kitchen Display System</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="kitchen@restaurant.com"
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-600"
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login to Kitchen'}
          </button>
        </form>
      </div>
    </div>
  );
}