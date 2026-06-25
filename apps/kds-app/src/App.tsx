import { Navigate, Route, Routes } from 'react-router-dom';
import StationLoginPage from './pages/StationLoginPage';
import KitchenDisplayPage from './pages/KitchenDisplayPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<StationLoginPage />} />
      <Route path="/kds" element={<KitchenDisplayPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}