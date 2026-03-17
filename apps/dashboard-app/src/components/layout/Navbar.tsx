import { useLocation } from "react-router-dom";
import { LogOut, Bell } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/orders": "Orders",
  "/dashboard/menu": "Menu",
  "/dashboard/tables": "Tables",
  "/dashboard/inventory": "Inventory",
  "/dashboard/vendors": "Vendors",
  "/dashboard/employees": "Employees",
  "/dashboard/expenses": "Expenses",
  "/dashboard/reports": "Reports",
  "/dashboard/analytics": "Analytics",
};

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const title = pageTitles[location.pathname] || "Dashboard";

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <header className="h-16 border-b border-white/10 bg-slate-900/60 backdrop-blur-xl flex items-center justify-between px-6">
      
    {/* LEFT — ZaikaFlow + Page Title */}
<div className="flex items-center gap-3">
  <span className="font-bold text-xl leading-none text-white">
    ZaikaFlow
  </span>
  <span className="text-slate-600 text-lg leading-none">/</span>
  <span className="text-slate-400 font-medium text-lg leading-none">
    {title}
  </span>
</div>
      {/* RIGHT — Search + Notifications + User */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <input
          className="hidden md:block input-field max-w-xs"
          placeholder="Search orders, tables..."
        />

        {/* Bell */}
        <button className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200">
          <Bell size={16} />
        </button>

        {/* User Info */}
        <div className="text-right hidden sm:block">
          <p className="text-sm text-white font-medium leading-none">
            {user?.name ?? "Owner"}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all duration-200"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
