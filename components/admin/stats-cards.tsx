"use client";

import { motion } from "framer-motion";
import {
  CalendarCheck,
  TrendingUp,
  Clock,
  Users,
} from "lucide-react";
import { AnimatedCounter } from "@/components/animated-counter";
import type { IndustryConfig } from "@/lib/industry-config";

type StatsCardsProps = {
  totalBookings: number;
  todayBookings: number;
  completedBookings: number;
  confirmedBookings: number;
  industryConfig: IndustryConfig;
};

const icons = [CalendarCheck, Clock, TrendingUp, Users];

export function StatsCards({
  totalBookings,
  todayBookings,
  completedBookings,
  confirmedBookings,
  industryConfig,
}: StatsCardsProps) {
  const values = [todayBookings, confirmedBookings, completedBookings, totalBookings];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {industryConfig.metrics.map((label, i) => {
        const Icon = icons[i];
        return (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                {label}
              </span>
              <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center">
                <Icon className="w-4 h-4 text-zinc-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-zinc-900">
              <AnimatedCounter value={values[i]} prefix={label.toLowerCase().includes("revenue") ? "₹" : ""} />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
