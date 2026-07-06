"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseClient } from "@/lib/supabase-client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { QRCodeCard } from "@/components/admin/qr-code-card";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Phone,
  Calendar,
  FileText,
  QrCode,
  X,
} from "lucide-react";
import type { IndustryConfig } from "@/lib/industry-config";

type Booking = {
  id: string;
  customer_name: string;
  customer_contact: string;
  booking_time: string;
  status: string;
  notes?: string;
  created_at: string;
};

type BookingsTableProps = {
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  industryConfig: IndustryConfig;
};

const statusCycle: Record<string, string> = {
  confirmed: "completed",
  completed: "cancelled",
  cancelled: "confirmed",
};

export function BookingsTable({ bookings, setBookings, industryConfig }: BookingsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortAsc, setSortAsc] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [qrBooking, setQrBooking] = useState<Booking | null>(null);

  const isRestaurant = industryConfig.bookingTerm === "Reservation";

  const getAssignedTable = (booking: Booking): string => {
    if (!booking.customer_contact) return "";
    const match = booking.customer_contact.match(/\|\s*Table\s*(\d+)/);
    return match ? match[1] : "";
  };

  async function assignTable(booking: Booking, tableNum: string) {
    const cleanContact = booking.customer_contact.split(" | ")[0] || "";
    const newContact = tableNum
      ? `${cleanContact} | Table ${tableNum}`
      : cleanContact;

    const { error } = await supabaseClient
      .from("bookings")
      .update({ customer_contact: newContact })
      .eq("id", booking.id);

    if (!error) {
      setBookings((prev) =>
        prev.map((b) => (b.id === booking.id ? { ...b, customer_contact: newContact } : b))
      );
    }
  }

  const filtered = bookings
    .filter(
      (b) =>
        b.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.customer_contact.includes(searchQuery)
    )
    .sort((a, b) => {
      const dateA = new Date(a.booking_time).getTime();
      const dateB = new Date(b.booking_time).getTime();
      return sortAsc ? dateA - dateB : dateB - dateA;
    });

  async function cycleStatus(booking: Booking) {
    const newStatus = statusCycle[booking.status] || "confirmed";
    setUpdatingId(booking.id);
    const { error } = await supabaseClient
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", booking.id);
    if (!error) {
      setBookings((prev) =>
        prev.map((b) => (b.id === booking.id ? { ...b, status: newStatus } : b))
      );
    }
    setUpdatingId(null);
  }

  const statusColor: Record<string, string> = {
    confirmed: "bg-blue-50 text-blue-600 border-blue-200",
    completed: "bg-emerald-50 text-emerald-600 border-emerald-200",
    cancelled: "bg-red-50 text-red-500 border-red-200",
  };

  return (
    <div className="space-y-4">
      {/* QR Code Modal */}
      <AnimatePresence>
        {qrBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setQrBooking(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl border border-zinc-200 shadow-xl p-6 max-w-sm w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-zinc-900">
                  {industryConfig.bookingTerm} QR Code
                </h3>
                <button onClick={() => setQrBooking(null)} className="text-zinc-400 hover:text-zinc-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <QRCodeCard booking={qrBooking} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Sort */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            placeholder={`Search by ${industryConfig.customerTerm.toLowerCase()} name...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400"
          />
        </div>
        <button
          onClick={() => setSortAsc(!sortAsc)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-zinc-200 text-zinc-500 hover:text-zinc-700 text-xs font-medium transition-colors"
        >
          {sortAsc ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          Date
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-zinc-200 overflow-hidden bg-white shadow-sm">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-zinc-50 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 border-b border-zinc-100">
          <div className="col-span-3">{industryConfig.columnHeader}</div>
          <div className="col-span-2">Contact</div>
          <div className="col-span-3">{industryConfig.bookingTerm} Time</div>
          <div className="col-span-2">{isRestaurant ? "Table" : ""}</div>
          <div className="col-span-1 text-center">Status</div>
          <div className="col-span-1 text-center">Actions</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-zinc-100">
          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
              filtered.map((booking, i) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: i * 0.02, duration: 0.3 }}
                  className="grid grid-cols-12 gap-4 px-5 py-3.5 items-center hover:bg-zinc-50/50 transition-colors"
                >
                  {/* Name */}
                  <div className="col-span-3">
                    <p className="font-medium text-zinc-900 text-sm">
                      {booking.customer_name}
                    </p>
                    {booking.notes && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <FileText className="w-3 h-3 text-zinc-300" />
                        <p className="text-[11px] text-zinc-400 truncate max-w-[160px]">
                          {booking.notes.replace(/^Table \d+:?\s*/, "") || "No details"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Contact */}
                  <div className="col-span-2 flex items-center gap-1.5 text-sm text-zinc-500">
                    <Phone className="w-3 h-3 text-zinc-300" />
                    <span className="truncate">{booking.customer_contact?.split(" | ")[0]}</span>
                  </div>

                  {/* Date/Time */}
                  <div className="col-span-3 flex items-center gap-1.5 text-sm text-zinc-500">
                    <Calendar className="w-3 h-3 text-zinc-300" />
                    {new Date(booking.booking_time).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </div>

                  {/* Table Selection */}
                  <div className="col-span-2">
                    {isRestaurant ? (
                      <select
                        value={getAssignedTable(booking)}
                        onChange={(e) => assignTable(booking, e.target.value)}
                        className="text-xs border border-zinc-200 rounded-md bg-white px-2 py-1 text-zinc-800 focus:outline-none focus:border-zinc-400 cursor-pointer w-full"
                      >
                        <option value="">Unassigned</option>
                        {Array.from({ length: 21 }, (_, index) => 100 + index).map((num) => (
                          <option key={num} value={num}>
                            Table {num}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs text-zinc-400">—</span>
                    )}
                  </div>

                  {/* Status */}
                  <div className="col-span-1 flex justify-center">
                    <button
                      onClick={() => cycleStatus(booking)}
                      disabled={updatingId === booking.id}
                      className="transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium border ${
                          statusColor[booking.status] || "bg-zinc-50 text-zinc-500 border-zinc-200"
                        }`}
                      >
                        {updatingId === booking.id ? "..." : booking.status}
                      </span>
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex justify-center">
                    {industryConfig.features.qrCode && booking.status === "confirmed" && (
                      <button
                        onClick={() => setQrBooking(booking)}
                        className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        QR
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-5 py-12 text-center text-zinc-400 text-sm"
              >
                {searchQuery
                  ? `No ${industryConfig.bookingTermPlural.toLowerCase()} match your search.`
                  : `No ${industryConfig.bookingTermPlural.toLowerCase()} yet.`}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1">
        <span>
          Showing {filtered.length} of {bookings.length} {industryConfig.bookingTermPlural.toLowerCase()}
        </span>
        <span>Click status to cycle: confirmed → completed → cancelled</span>
      </div>
    </div>
  );
}
