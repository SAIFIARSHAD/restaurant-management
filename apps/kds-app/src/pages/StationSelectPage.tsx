import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStations } from '../services/stationApi';
import { useKDSStore } from '../store/kdsStore';
import type { IStation } from '../types/kds.types';

const STATION_ICONS: Record<string, string> = {
  grill: '🔥',
  drinks: '🥤',
  kitchen: '🍳',
  dessert: '🍰',
  other: '⚙️',
};

function getSession() {
  const raw = localStorage.getItem('kds_session');
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function StationSelectPage() {
  const navigate = useNavigate();
  const { user, setSelectedStation, setUser } = useKDSStore();

  const [stations, setStations] = useState<IStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const session = getSession();
  const currentUser = user || session?.user;

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { replace: true });
      return;
    }

    if (user == null && currentUser) {
      setUser(currentUser);
    }

    const fetchStations = async () => {
      try {
        const data = await getStations(currentUser.restaurant);
        setStations(data);
      } catch {
        setError('Failed to load stations');
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, [currentUser, navigate, setUser, user]);

  const handleSelect = (station: IStation) => {
    setSelectedStation(station);

    const raw = localStorage.getItem('kds_session');
    const sessionData = raw ? JSON.parse(raw) : {};

    localStorage.setItem(
      'kds_session',
      JSON.stringify({
        ...sessionData,
        station,
      })
    );

    navigate('/kds', { replace: true });
  };

  const handleLogout = () => {
    localStorage.removeItem('kds_session');
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 relative">
      <button
        onClick={handleLogout}
        className="absolute top-6 right-6 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
      >
        Logout
      </button>

      <h1 className="text-3xl font-bold text-white mb-2">Select Station</h1>
      <p className="text-gray-400 mb-10">Choose your kitchen station to begin</p>

      {loading && (
        <p className="text-gray-400 animate-pulse">Loading stations...</p>
      )}

      {error && <p className="text-red-400">{error}</p>}

      {!loading && stations.length === 0 && !error && (
        <p className="text-gray-500">No active stations found. Contact admin.</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl">
        {stations.map((station) => (
          <button
            key={station._id}
            onClick={() => handleSelect(station)}
            className="flex flex-col items-center justify-center gap-3 bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-orange-500 rounded-2xl p-8 transition group"
          >
            <span className="text-4xl">
              {STATION_ICONS[station.stationType] || '⚙️'}
            </span>
            <span className="text-white font-semibold text-lg group-hover:text-orange-400 transition">
              {station.name}
            </span>
            <span
              className="text-xs px-3 py-1 rounded-full font-medium"
              style={{ background: station.color + '33', color: station.color }}
            >
              {station.stationType}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}