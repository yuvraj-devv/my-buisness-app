"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "@/lib/auth-actions";
import {
  LogOut,
  User,
  Settings,
  CreditCard,
  HelpCircle,
  Calendar,
  ChevronDown,
} from "lucide-react";

type UserProfileMenuProps = {
  user: any;
  profile: any;
  variant: "header" | "sidebar";
  collapsed?: boolean;
};

export function UserProfileMenu({ user, profile, variant, collapsed = false }: UserProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const initials = (() => {
    const name = profile?.full_name || user?.user_metadata?.full_name || user?.email || "?";
    if (name.includes("@")) {
      return name[0].toUpperCase();
    }
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  })();

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const displayEmail = user.email || "";
  const role = profile?.role || user?.user_metadata?.role || "consumer";
  const displayRole = role === "owner" ? "Business Owner" : "Customer";

  const toggleOpen = () => setIsOpen(!isOpen);

  // Dropdown options based on role
  const menuOptions = role === "owner" 
    ? [
        { label: "Profile Details", icon: User, href: "/admin/settings" },
        { label: "Business Settings", icon: Settings, href: "/admin/settings" },
        { label: "Billing Plan", icon: CreditCard, href: "/admin/billing" },
        { label: "Help & Support", icon: HelpCircle, href: "#" },
      ]
    : [
        { label: "Profile Details", icon: User, href: "/profile?tab=details" },
        { label: "My Bookings", icon: Calendar, href: "/profile?tab=bookings" },
        { label: "Preferences", icon: Settings, href: "/profile?tab=preferences" },
        { label: "Help & Support", icon: HelpCircle, href: "/profile?tab=support" },
      ];

  if (variant === "sidebar") {
    return (
      <div ref={containerRef} className="relative w-full">
        {/* Trigger */}
        <button
          onClick={toggleOpen}
          type="button"
          className={`flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 w-full text-left select-none cursor-pointer border border-transparent
            ${isOpen ? "bg-zinc-100 border-zinc-200" : "hover:bg-zinc-50"}
          `}
        >
          {/* Avatar */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-950 dark:from-zinc-100 dark:to-zinc-300 text-white dark:text-zinc-950 flex items-center justify-center font-semibold text-sm shadow-xs flex-shrink-0">
            {initials}
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0 flex items-center justify-between gap-1">
              <div className="min-w-0">
                <p className="text-xs font-bold text-zinc-900 truncate">
                  {displayName}
                </p>
                <p className="text-[10px] text-zinc-400 truncate">
                  {displayRole}
                </p>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-205 ${isOpen ? "rotate-180" : ""}`} />
            </div>
          )}
        </button>

        {/* Dropdown Menu (above trigger in sidebar) */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute bottom-full z-50 mb-2 left-0 w-64 bg-white border border-zinc-200 shadow-xl rounded-2xl p-2.5 space-y-1.5"
            >
              {/* User Metadata */}
              <div className="px-2.5 py-2">
                <p className="text-xs font-bold text-zinc-900 leading-none">{displayName}</p>
                <p className="text-[10px] text-zinc-400 mt-1 truncate">{displayEmail}</p>
                <div className="mt-2.5">
                  <span className="inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200/50">
                    {displayRole}
                  </span>
                </div>
              </div>

              <div className="h-px bg-zinc-100" />

              {/* Navigation Options */}
              <div className="space-y-0.5">
                {menuOptions.map((opt, idx) => {
                  const Icon = opt.icon;
                  return (
                    <Link
                      key={idx}
                      href={opt.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-zinc-650 hover:text-zinc-900 hover:bg-zinc-50 transition-all duration-150"
                    >
                      <Icon className="w-3.5 h-3.5 text-zinc-400" />
                      {opt.label}
                    </Link>
                  );
                })}
              </div>

              <div className="h-px bg-zinc-100" />

              {/* Sign Out Button */}
              <form action={signOut} onSubmit={() => setIsOpen(false)} className="w-full">
                <button
                  type="submit"
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150 w-full text-left cursor-pointer border-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Variant: Header (For explorer/consumer navbar)
  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        onClick={toggleOpen}
        type="button"
        className={`flex items-center gap-2.5 p-1.5 pr-3 rounded-full border transition-all duration-200 select-none cursor-pointer
          ${isOpen ? "bg-zinc-50 border-zinc-300" : "bg-white border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50"}
        `}
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-950 text-white flex items-center justify-center font-bold text-xs shadow-xs">
          {initials}
        </div>
        <span className="text-xs font-bold text-zinc-700 hidden sm:inline-block">
          {displayName}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu (below trigger) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 z-50 w-60 bg-white border border-zinc-200 shadow-xl rounded-2xl p-2 space-y-1.5"
          >
            {/* User Metadata */}
            <div className="px-2.5 py-2">
              <p className="text-xs font-bold text-zinc-900 leading-none">{displayName}</p>
              <p className="text-[10px] text-zinc-400 mt-1 truncate">{displayEmail}</p>
              <div className="mt-2.5">
                <span className="inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200/50">
                  {displayRole}
                </span>
              </div>
            </div>

            <div className="h-px bg-zinc-100" />

            {/* Navigation Options */}
            <div className="space-y-0.5">
              {menuOptions.map((opt, idx) => {
                const Icon = opt.icon;
                return (
                  <Link
                    key={idx}
                    href={opt.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50 transition-all duration-150"
                  >
                    <Icon className="w-3.5 h-3.5 text-zinc-400" />
                    {opt.label}
                  </Link>
                );
              })}
            </div>

            <div className="h-px bg-zinc-100" />

            {/* Sign Out Button */}
            <form action={signOut} onSubmit={() => setIsOpen(false)} className="w-full">
              <button
                type="submit"
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 hover:text-red-650 transition-all duration-150 w-full text-left cursor-pointer border-0"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
