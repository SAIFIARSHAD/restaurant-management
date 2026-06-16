// src/components/layout/Sidebar.tsx
import { NavLink } from "react-router-dom";
import { X, LayoutDashboard, ShoppingBag, UtensilsCrossed,
  TableProperties, Package, Handshake, Users,
  Wallet, BarChart2, PieChart, BookOpen } from "lucide-react";
import LowStockBadge from "../inventory/LowStockBadge";

const menuItems = [
  { label: "Dashboard",  to: "/dashboard",            icon: LayoutDashboard },
  { label: "Orders",     to: "/dashboard/orders",     icon: ShoppingBag },
  { label: "Menu",       to: "/dashboard/menu",       icon: UtensilsCrossed },
  { label: "Recipes",    to: "/dashboard/recipes",    icon: BookOpen },
  { label: "Tables",     to: "/dashboard/tables",     icon: TableProperties },
  { label: "Inventory",  to: "/dashboard/inventory",  icon: Package },
  { label: "Vendors",    to: "/dashboard/vendors",    icon: Handshake },
  { label: "Employees",  to: "/dashboard/employees",  icon: Users },
  { label: "Expenses",   to: "/dashboard/expenses",   icon: Wallet },
  { label: "Reports",    to: "/dashboard/reports",    icon: BarChart2 },
  { label: "Analytics",  to: "/dashboard/analytics",  icon: PieChart },
];

interface SidebarProps {
  onClose?: () => void;  // ← optional, only mobile needs it
}

export default function Sidebar({ onClose }: SidebarProps) {
  return (
    <aside className="h-full w-64 bg-slate-950/95 border-r border-white/10 backdrop-blur-xl flex flex-col">

      {/* Brand + Close button (mobile) */}
      <div className="h-16 flex items-center px-5 border-b border-white/10 gap-3">
        <img
          src="/logo.jpg"
          alt="ZaikaFlow"
          className="w-9 h-9 rounded-full object-cover shadow-md shadow-orange-500/30"
        />
        <div className="flex-1">
          <span className="text-sm font-bold text-white leading-none block">
            ZaikaFlow
          </span>
          <span className="text-[10px] text-slate-500 leading-none mt-0.5 block">
            From Rasoi to Receipt
          </span>
        </div>

        {/* ── Close button — mobile only ── */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 rounded-lg bg-white/5 border border-white/10
                       flex items-center justify-center text-slate-400
                       hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/dashboard"}
            onClick={onClose}  // ← mobile pe click se drawer band ho
            className={({ isActive }) =>
              isActive ? "sidebar-item-active" : "sidebar-item"
            }
          >
            <item.icon size={17} className="shrink-0" />
            <span className="flex-1">{item.label}</span>
            {item.label === "Inventory" && <LowStockBadge />}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/10">
        <p className="text-[10px] text-slate-600 text-center">
          © 2026 ZaikaFlow
        </p>
      </div>
    </aside>
  );
}