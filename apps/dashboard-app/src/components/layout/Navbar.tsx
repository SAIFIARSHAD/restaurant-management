import { useAuthStore } from "../../store/authStore";

export default function Navbar() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <header className="h-16 border-b border-white/10 bg-slate-900/60 backdrop-blur-xl flex items-center justify-between px-6">
      {/* LEFT — Logo + Brand */}
      <div className="flex items-center gap-3">
        <img
          src="/logo.jpg"
          alt="ZaikaFlow"
          className="w-9 h-9 rounded-full object-cover shadow-md shadow-orange-500/30"
        />
        <div>
          <h1 className="text-white font-bold text-base leading-none">
            ZaikaFlow
          </h1>
          <p className="text-slate-500 text-[10px] leading-none mt-0.5">
            From Rasoi to Receipt
          </p>
        </div>
      </div>

      {/* RIGHT — Search + User */}
      <div className="flex items-center gap-4">
        <input
          className="hidden md:block input-field max-w-xs"
          placeholder="Search orders, tables..."
        />
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-white font-medium">
              {user?.name ?? "Owner"}
            </p>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="btn-ghost text-xs px-3 py-1.5"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
