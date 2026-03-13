import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading: isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="min-h-screen flex bg-[#0f172a]">
      {/* LEFT SIDE - Illustration */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#1a1f35] to-[#0f172a] p-12">
        {/* Glow blobs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-blue-600/10 rounded-full blur-3xl" />

        {/* Logo + Branding */}
        <div className="relative z-10 flex flex-col items-center gap-8">
          <img
            src="/logo.jpg"
            alt="ZaikaFlow"
            className="w-64 h-64 rounded-full object-cover shadow-2xl shadow-orange-500/20"
          />
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-3">
              Welcome Back!
            </h2>
            <p className="text-slate-400 text-base max-w-xs leading-relaxed">
              From Rasoi to Receipt, Everything Flows Perfectly.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 justify-center">
            {["📦 Orders", "🍳 KDS", "💳 Billing", "📊 Analytics"].map(
              (f) => (
                <span
                  key={f}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm text-slate-300"
                >
                  {f}
                </span>
              )
            )}
          </div>
        </div>

        {/* Bottom brand */}
        <p className="absolute bottom-6 text-slate-600 text-sm">
          © 2026 ZaikaFlow · From Rasoi to Receipt, Everything Flows Perfectly.
        </p>
      </div>

      {/* RIGHT SIDE - Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex flex-col items-center mb-10">
            <img
              src="/logo.jpg"
              alt="ZaikaFlow"
              className="w-16 h-16 rounded-full object-cover shadow-lg shadow-orange-500/30 mb-4"
            />
            <h1 className="text-2xl font-bold text-white tracking-tight">
              ZaikaFlow
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              From Rasoi to Receipt, Everything Flows Perfectly.
            </p>
          </div>

          {/* Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
            <h3 className="text-lg font-semibold text-white mb-6">Sign In</h3>

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="owner@restaurant.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input-field pr-10"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-sm"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold text-sm tracking-wide shadow-lg shadow-orange-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing in..." : "Sign In →"}
              </button>
            </form>
          </div>

          <p className="text-center text-slate-600 text-xs mt-6">
            © 2026 ZaikaFlow · From Rasoi to Receipt, Everything Flows Perfectly.
          </p>
        </div>
      </div>
    </div>
  );
}
