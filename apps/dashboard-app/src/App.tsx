import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryProvider } from './providers/QueryProvider';
import { useAuthStore } from "./store/authStore";
import LoginPage from "./pages/auth/LoginPage";
import MainLayout from "./layouts/MainLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import OrdersPage from "./pages/dashboard/OrdersPage";
import MenuPage from "./pages/dashboard/MenuPage";
import TablesPage from "./pages/dashboard/TablesPage";
import InventoryPage from "./pages/dashboard/InventoryPage";
import VendorsPage from "./pages/dashboard/VendorsPage";
import EmployeesPage from "./pages/dashboard/EmployeesPage";
import ExpensesPage from "./pages/dashboard/ExpensesPage";
import ReportsPage from "./pages/dashboard/ReportsPage";
import AnalyticsPage from "./pages/dashboard/AnalyticsPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Routes>
                    <Route path="" element={<DashboardHome />} />
                    <Route path="orders" element={<OrdersPage />} />
                    <Route path="menu" element={<MenuPage />} />
                    <Route path="tables" element={<TablesPage />} />
                    <Route path="inventory" element={<InventoryPage />} />
                    <Route path="vendors" element={<VendorsPage />} />
                    <Route path="employees" element={<EmployeesPage />} />
                    <Route path="expenses" element={<ExpensesPage />} />
                    <Route path="reports" element={<ReportsPage />} />
                    <Route path="analytics" element={<AnalyticsPage />} />
                  </Routes>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryProvider>
  );
}
