"use client";

import { motion } from "framer-motion";
import { Clock, CheckCircle, XCircle, CalendarPlus } from "lucide-react";
import type { IndustryConfig } from "@/lib/industry-config";

type Booking = {
  id: string;
  customer_name: string;
  status: string;
  created_at: string;
};

type RecentActivityProps = {
  bookings: Booking[];
  industryConfig: IndustryConfig;
};

const statusIcon: Record<string, typeof Clock> = {
  confirmed: Clock,
  completed: CheckCircle,
  cancelled: XCircle,
};

const statusColor: Record<string, string> = {
  confirmed: "text-blue-500 bg-blue-50",
  completed: "text-emerald-500 bg-emerald-50",
  cancelled: "text-red-400 bg-red-50",
};

export function RecentActivity({ bookings, industryConfig }: RecentActivityProps) {
  const recent = bookings.slice(0, 8);

  if (recent.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-8 text-center">
        <CalendarPlus className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
        <p className="text-sm text-zinc-400">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm divide-y divide-zinc-100 overflow-hidden">
      {recent.map((booking, i) => {
        const Icon = statusIcon[booking.status] || Clock;
        const color = statusColor[booking.status] || "text-zinc-400 bg-zinc-50";
        const verb = industryConfig.activityVerbs[booking.status as keyof typeof industryConfig.activityVerbs] || booking.status;

        return (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
            className="flex items-start gap-3 px-4 py-3 hover:bg-zinc-50/50 transition-colors"
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${color}`}>
              <Icon className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-zinc-700">
                <span className="font-medium text-zinc-900">{booking.customer_name}</span>
                {" "}{verb}
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {new Date(booking.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
