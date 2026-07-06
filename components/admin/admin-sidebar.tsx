"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { UserProfileMenu } from "@/components/user-profile-menu";
import {
  LayoutDashboard,
  CalendarCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity,
  Package,
  Receipt,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/services", label: "Services", icon: Package },
  { href: "/admin/billing", label: "Billing", icon: Receipt },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({
  logoUrl,
  businessName,
  user,
  profile,
}: {
  logoUrl?: string | null;
  businessName?: string | null;
  user: any;
  profile: any;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
      className="relative flex flex-col h-screen bg-white border-r border-zinc-200 z-40 print:hidden"
    >
      {/* Logo area */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-zinc-100">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={businessName || "Business Logo"}
            className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">
              {businessName ? businessName[0].toUpperCase() : "B"}
            </span>
          </div>
        )}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <h2 className="text-sm font-bold text-zinc-900 whitespace-nowrap">
                {businessName || "BizPlatform"}
              </h2>
              <p className="text-[10px] text-zinc-400 whitespace-nowrap">
                Admin Panel
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                group relative flex items-center gap-3 px-3 py-2 rounded-lg
                transition-all duration-200 text-sm
                ${
                  isActive
                    ? "bg-zinc-100 text-zinc-900 font-medium"
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                }
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-zinc-900 rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Sign Out + Status */}
      <div className="px-2 pb-3 space-y-2">
        {user ? (
          <UserProfileMenu
            variant="sidebar"
            collapsed={collapsed}
            user={user}
            profile={profile}
          />
        ) : (
          <div className={`h-11 rounded-xl bg-zinc-100 animate-pulse ${collapsed ? "w-11 mx-auto" : "w-full"}`} />
        )}

        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-50 ${collapsed ? "justify-center" : ""}`}>
          <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[11px] text-zinc-400 whitespace-nowrap"
              >
                System Online
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:border-zinc-400 transition-colors z-50 shadow-sm"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>
    </motion.aside>
  );
}
