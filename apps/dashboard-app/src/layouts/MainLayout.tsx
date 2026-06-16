// src/layouts/MainLayout.tsx
import { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">

      {/* ── DESKTOP Sidebar — fixed, always visible ── */}
      <div className="hidden lg:flex fixed inset-y-0 left-0 w-64 z-40">
        <Sidebar />
      </div>

      {/* ── MOBILE Sidebar — overlay drawer ── */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <div className="relative z-10 w-64 h-full animate-slide-in-left">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">

        {/* Sticky Navbar */}
        <div className="sticky top-0 z-30">
          <Navbar onMenuClick={() => setSidebarOpen(true)} />
        </div>

        {/* Page Content */}
        <main className="flex-1 px-3 py-4 sm:px-6 sm:py-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}