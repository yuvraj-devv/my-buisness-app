"use client";

import { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/supabase-client";
import { getIndustryConfig } from "@/lib/industry-config";
import { StatsCards } from "@/components/admin/stats-cards";
import { BookingsTable } from "@/components/admin/bookings-table";
import { RecentActivity } from "@/components/admin/recent-activity";
import { motion } from "framer-motion";
import {
  Calendar,
  Loader2,
  Receipt,
  FileText,
  DollarSign,
  Wallet,
  QrCode,
  CreditCard,
  X,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

type Booking = {
  id: string;
  customer_name: string;
  customer_contact: string;
  booking_time: string;
  status: string;
  notes?: string;
  created_at: string;
};

type Business = {
  id: string;
  name: string;
  industry_type: string;
  logo_url?: string | null;
};

type LineItem = {
  serviceId: string;
  name: string;
  price: number;
  qty: number;
};

type BillRecord = {
  id: string;
  customerName: string;
  customerPhone: string;
  paymentMode: "cash" | "upi" | "card";
  totalAmount: number;
  lineItems: LineItem[];
  bookingTime: string;
};

// Static 21 tables definition (100 - 120)
const TABLES = [
  // 5 double seats (100 - 104)
  { id: 100, type: "Double Seat", capacity: 2 },
  { id: 101, type: "Double Seat", capacity: 2 },
  { id: 102, type: "Double Seat", capacity: 2 },
  { id: 103, type: "Double Seat", capacity: 2 },
  { id: 104, type: "Double Seat", capacity: 2 },
  // 10 4-chair seats (105 - 114)
  { id: 105, type: "4-Chair Seat", capacity: 4 },
  { id: 106, type: "4-Chair Seat", capacity: 4 },
  { id: 107, type: "4-Chair Seat", capacity: 4 },
  { id: 108, type: "4-Chair Seat", capacity: 4 },
  { id: 109, type: "4-Chair Seat", capacity: 4 },
  { id: 110, type: "4-Chair Seat", capacity: 4 },
  { id: 111, type: "4-Chair Seat", capacity: 4 },
  { id: 112, type: "4-Chair Seat", capacity: 4 },
  { id: 113, type: "4-Chair Seat", capacity: 4 },
  { id: 114, type: "4-Chair Seat", capacity: 4 },
  // 6 family seats (115 - 120)
  { id: 115, type: "Family Seat", capacity: 6 },
  { id: 116, type: "Family Seat", capacity: 6 },
  { id: 117, type: "Family Seat", capacity: 6 },
  { id: 118, type: "Family Seat", capacity: 6 },
  { id: 119, type: "Family Seat", capacity: 6 },
  { id: 120, type: "Family Seat", capacity: 6 },
];

export default function AdminDashboard() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Interactive calendar date filter (defaults to local today YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString("en-CA"));
  const [activeTab, setActiveTab] = useState<"reservations" | "table-map" | "bills">("reservations");
  const [selectedBill, setSelectedBill] = useState<BillRecord | null>(null);
  const taxRate = 0.18; // 18% GST

  const getWeeklyData = () => {
    const days = [];
    const dateMap = new Map<string, { bookings: number; revenue: number }>();
    
    // Initialize the last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-CA"); // YYYY-MM-DD
      const label = d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
      days.push({ dateStr, label });
      dateMap.set(dateStr, { bookings: 0, revenue: 0 });
    }
    
    // Populate data
    bookings.forEach((b) => {
      try {
        const bDateStr = new Date(b.booking_time).toLocaleDateString("en-CA");
        if (dateMap.has(bDateStr)) {
          const current = dateMap.get(bDateStr)!;
          if (b.customer_contact?.startsWith("BILL|")) {
            const parts = b.customer_contact.split("|");
            const amt = parseFloat(parts[2]) || 0;
            current.revenue += amt;
          } else {
            current.bookings += 1;
          }
          dateMap.set(bDateStr, current);
        }
      } catch (e) {
        // ignore invalid dates
      }
    });
    
    return days.map(d => ({
      ...d,
      ...dateMap.get(d.dateStr)!
    }));
  };

  const weeklyData = getWeeklyData();
  const maxRevenue = Math.max(...weeklyData.map(d => d.revenue), 100);
  const maxBookings = Math.max(...weeklyData.map(d => d.bookings), 5);

  const points = weeklyData.map((d, i) => {
    const x = (i / 6) * 440 + 30;
    const y = 120 - (d.bookings / maxBookings) * 90;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  const areaD = points.length > 0 
    ? `${pathD} L ${points[points.length - 1].x} 135 L ${points[0].x} 135 Z`
    : "";

  useEffect(() => {
    async function loadDashboard() {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) return;

      const { data: biz } = await supabaseClient
        .from("businesses")
        .select("id, name, industry_type, logo_url")
        .eq("owner_id", user.id)
        .single();

      if (biz) {
        setBusiness(biz);
        
        // Fetch all bookings for this business (both reservation records and bill records)
        const { data: bgs } = await supabaseClient
          .from("bookings")
          .select("*")
          .eq("business_id", biz.id)
          .order("booking_time", { ascending: false });

        setBookings(bgs || []);
      }
      setLoading(false);
    }
    loadDashboard();
  }, []);

  const config = business ? getIndustryConfig(business.industry_type) : null;
  const clientConfig = config ? { ...config, icon: undefined } : null;
  const serializableConfig = clientConfig as unknown as typeof config;

  const isRestaurant = config?.bookingTerm === "Reservation";

  // Helper to parse bookings stored as billing information
  const parseBookingAsBill = (booking: Booking): BillRecord | null => {
    if (!booking.customer_contact?.startsWith("BILL|")) return null;
    try {
      const parts = booking.customer_contact.split("|");
      // Format: BILL | paymentMode | totalAmount | customerPhone | lineItemsJson
      const [_, paymentMode, totalAmountStr, customerPhone, lineItemsJson] = parts;
      return {
        id: booking.id,
        customerName: booking.customer_name,
        customerPhone: customerPhone || "",
        paymentMode: (paymentMode as "cash" | "upi" | "card") || "cash",
        totalAmount: parseFloat(totalAmountStr) || 0,
        lineItems: JSON.parse(lineItemsJson || "[]"),
        bookingTime: booking.booking_time,
      };
    } catch (e) {
      console.error("Error parsing bill:", e);
      return null;
    }
  };

  // Check if a booking date matches the selected calendar date in local timezone
  const isSameDay = (bookingTimeStr: string, dateStr: string) => {
    try {
      const bDate = new Date(bookingTimeStr);
      const sDate = new Date(dateStr);
      return (
        bDate.getFullYear() === sDate.getFullYear() &&
        bDate.getMonth() === sDate.getMonth() &&
        bDate.getDate() === sDate.getDate()
      );
    } catch (e) {
      return false;
    }
  };

  // Group and parse records
  const parsedBills: BillRecord[] = [];
  const parsedReservations: Booking[] = [];

  bookings.forEach((b) => {
    if (b.customer_contact?.startsWith("BILL|")) {
      const parsed = parseBookingAsBill(b);
      if (parsed) parsedBills.push(parsed);
    } else {
      parsedReservations.push(b);
    }
  });

  // Filter lists based on the selected date calendar
  const filteredBills = parsedBills.filter((bill) => isSameDay(bill.bookingTime, selectedDate));
  const filteredReservations = parsedReservations.filter((res) => isSameDay(res.booking_time, selectedDate));

  // Determine active reservation occupying a given table on the selected date
  const getTableBooking = (tableId: number) => {
    return filteredReservations.find((res) => {
      if (res.status !== "confirmed") return false;
      const match = res.customer_contact?.match(/\|\s*Table\s*(\d+)/);
      return match ? parseInt(match[1]) === tableId : false;
    });
  };

  // Mark occupied table vacant by updating reservation to completed in Supabase
  const vacantTable = async (bookingId: string) => {
    const { error } = await supabaseClient
      .from("bookings")
      .update({ status: "completed" })
      .eq("id", bookingId);
    if (!error) {
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: "completed" } : b))
      );
    }
  };

  // Compute metrics for the selected date
  const revenue = filteredBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
  const newGuestsCount = filteredBills.length;
  // Calculate active tables based on occupied table structures
  const occupiedTablesCount = TABLES.filter((t) => getTableBooking(t.id) !== undefined).length;
  const totalReservationsCount = filteredReservations.length;

  // Build combined live activity feed list (chronological order)
  const activityList = [
    ...parsedReservations.map((res) => ({
      id: res.id,
      customer_name: res.customer_name,
      status: res.status,
      created_at: res.created_at,
    })),
    ...parsedBills.map((bill) => ({
      id: bill.id,
      customer_name: bill.customerName,
      status: "completed", // will map to seat/complete
      created_at: bill.bookingTime,
    })),
  ]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-6 h-6 text-zinc-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header and Calendar Date Selector */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-150 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-zinc-950 tracking-tight">
              Dashboard
            </h1>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">
                Live
              </span>
            </div>
          </div>
          <p className="text-xs text-zinc-500">
            {business?.name || "Your Business"} — Overview & Reports
          </p>
        </div>

        {/* Date Filter Input */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-500">View Date:</span>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-800 text-xs font-semibold focus:outline-none focus:border-zinc-400 cursor-pointer shadow-3xs"
            />
          </div>
          {selectedDate !== new Date().toLocaleDateString("en-CA") && (
            <button
              onClick={() => setSelectedDate(new Date().toLocaleDateString("en-CA"))}
              className="text-[10px] font-bold text-zinc-400 hover:text-zinc-800"
            >
              Reset to Today
            </button>
          )}
        </div>
      </header>

      {/* Stats Cards Displaying Computed Live Data */}
      {serializableConfig && (
        <StatsCards
          totalBookings={totalReservationsCount}
          todayBookings={Math.round(revenue)} // Rounded for the animated counter
          completedBookings={newGuestsCount}
          confirmedBookings={occupiedTablesCount} // Shows actual occupied tables count
          industryConfig={serializableConfig}
        />
      )}

      {/* Interactive Analytics Dashboard Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up">
        {/* Weekly Revenue Bar Chart */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-850">
            <div>
              <h2 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Weekly Revenue</h2>
              <p className="text-lg font-bold text-zinc-900 dark:text-white">₹{weeklyData.reduce((sum, d) => sum + d.revenue, 0).toFixed(2)}</p>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end justify-between h-40 gap-3 pt-6 px-2">
            {weeklyData.map((item, idx) => {
              const heightPercent = (item.revenue / maxRevenue) * 100;
              return (
                <div key={item.dateStr} className="flex-1 flex flex-col items-center gap-2 group relative h-full justify-end">
                  {/* Hover Tooltip */}
                  <div className="absolute bottom-full mb-2 bg-zinc-900 text-white text-[10px] px-2.5 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-20 font-bold font-mono">
                    ₹{item.revenue.toFixed(2)}
                  </div>
                  {/* Animated Bar */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(heightPercent, 5)}%` }}
                    transition={{ duration: 0.6, delay: idx * 0.04, ease: "easeOut" }}
                    className="w-full rounded-t-md bg-gradient-to-t from-zinc-900/30 to-zinc-900 dark:from-zinc-850 dark:to-zinc-200 group-hover:opacity-80 transition-all cursor-pointer relative"
                  />
                  {/* Date Label */}
                  <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 tracking-tight">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Bookings Line Chart */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-850">
            <div>
              <h2 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Weekly Bookings</h2>
              <p className="text-lg font-bold text-zinc-900 dark:text-white">{weeklyData.reduce((sum, d) => sum + d.bookings, 0)} reservations</p>
            </div>
            <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="h-40 pt-4 flex items-center justify-center">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150">
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Horizontal Reference Lines */}
              <line x1="30" y1="30" x2="470" y2="30" stroke="currentColor" className="text-zinc-100 dark:text-zinc-900" strokeWidth="1" strokeDasharray="3" />
              <line x1="30" y1="75" x2="470" y2="75" stroke="currentColor" className="text-zinc-100 dark:text-zinc-900" strokeWidth="1" strokeDasharray="3" />
              <line x1="30" y1="120" x2="470" y2="120" stroke="currentColor" className="text-zinc-100 dark:text-zinc-900" strokeWidth="1" strokeDasharray="3" />
              
              {/* Shaded Area fill */}
              {areaD && (
                <motion.path
                  d={areaD}
                  fill="url(#areaGradient)"
                  className="text-zinc-900 dark:text-zinc-200"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              )}
              
              {/* Stroke Line */}
              {pathD && (
                <motion.path
                  d={pathD}
                  fill="none"
                  stroke="currentColor"
                  className="text-zinc-900 dark:text-zinc-100"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                />
              )}
              
              {/* Point Markers */}
              {points.map((p, idx) => (
                <g key={idx} className="group cursor-pointer">
                  <motion.circle
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    fill="currentColor"
                    stroke="currentColor"
                    className="text-white dark:text-zinc-900"
                    strokeWidth="3"
                    whileHover={{ r: 6 }}
                  />
                  {/* SVG Tooltip on Hover */}
                  <title>{p.bookings} bookings on {p.label}</title>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>

      {/* Main layout grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Side Tab Layout (8/12 cols) */}
        <div className="xl:col-span-8 space-y-4">
          
          {/* Tabs header */}
          <div className="flex items-center border-b border-zinc-200 gap-1 pb-px">
            <button
              onClick={() => setActiveTab("reservations")}
              className={`px-4 py-2 border-b-2 text-sm font-semibold transition-all -mb-px ${
                activeTab === "reservations"
                  ? "border-zinc-950 text-zinc-950"
                  : "border-transparent text-zinc-400 hover:text-zinc-600"
              }`}
            >
              Reservations ({filteredReservations.length})
            </button>
            {isRestaurant && (
              <button
                onClick={() => setActiveTab("table-map")}
                className={`px-4 py-2 border-b-2 text-sm font-semibold transition-all -mb-px ${
                  activeTab === "table-map"
                    ? "border-zinc-950 text-zinc-950"
                    : "border-transparent text-zinc-400 hover:text-zinc-600"
                }`}
              >
                Live Table Map ({occupiedTablesCount}/{TABLES.length})
              </button>
            )}
            <button
              onClick={() => setActiveTab("bills")}
              className={`px-4 py-2 border-b-2 text-sm font-semibold transition-all -mb-px ${
                activeTab === "bills"
                  ? "border-zinc-950 text-zinc-950"
                  : "border-transparent text-zinc-400 hover:text-zinc-600"
              }`}
            >
              Bills & Sales ({filteredBills.length})
            </button>
          </div>

          {/* TAB 1: Reservations table */}
          {activeTab === "reservations" && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-zinc-900">
                Reservations on {new Date(selectedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </h2>
              {serializableConfig && (
                <BookingsTable
                  bookings={filteredReservations}
                  setBookings={setBookings}
                  industryConfig={serializableConfig}
                />
              )}
            </div>
          )}

          {/* TAB 2: Live Table Map (Visual POS Map) */}
          {activeTab === "table-map" && isRestaurant && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-zinc-900">
                  Live Table Map on {new Date(selectedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </h2>
                <div className="flex gap-4 text-xs font-medium">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-emerald-50 border border-emerald-250 block" /> 
                    Available ({TABLES.length - occupiedTablesCount})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-red-50 border border-red-200 block" /> 
                    Occupied ({occupiedTablesCount})
                  </span>
                </div>
              </div>

              {/* Sections by capacity */}
              {[
                { title: "Double Seats (2 Capacity)", tables: TABLES.filter((t) => t.capacity === 2) },
                { title: "Standard Seats (4 Capacity)", tables: TABLES.filter((t) => t.capacity === 4) },
                { title: "Family Seats (6 Capacity)", tables: TABLES.filter((t) => t.capacity === 6) },
              ].map((section) => (
                <div key={section.title} className="space-y-2.5">
                  <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    {section.title}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {section.tables.map((table) => {
                      const occupiedBy = getTableBooking(table.id);
                      return (
                        <div
                          key={table.id}
                          className={`rounded-xl border p-4 flex flex-col justify-between min-h-[110px] transition-all duration-200 shadow-2xs ${
                            occupiedBy
                              ? "bg-red-50/70 border-red-200 text-red-800"
                              : "bg-emerald-50/50 border-emerald-150 text-emerald-800"
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-sm font-extrabold">T-{table.id}</span>
                              <span className="text-[9px] font-semibold opacity-75">{table.type}</span>
                            </div>
                            {occupiedBy ? (
                              <p className="text-[11px] font-bold truncate mt-1.5">
                                {occupiedBy.customer_name}
                              </p>
                            ) : (
                              <p className="text-[10px] font-semibold opacity-60 mt-1.5">Available</p>
                            )}
                          </div>
                          
                          {occupiedBy && (
                            <button
                              onClick={() => vacantTable(occupiedBy.id)}
                              className="mt-3.5 w-full bg-red-600 hover:bg-red-700 text-white text-[10px] py-1 rounded-md font-bold transition-all shadow-3xs hover:scale-105 active:scale-95"
                            >
                              Vacant / Done
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: Generated Bills table */}
          {activeTab === "bills" && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-zinc-900">
                Sales Ledger on {new Date(selectedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </h2>
              {filteredBills.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
                  <Receipt className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                  <p className="text-sm text-zinc-400">No bills generated on this date.</p>
                </div>
              ) : (
                <div className="rounded-xl border border-zinc-200 overflow-hidden bg-white shadow-3xs">
                  
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-zinc-50 text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100">
                    <div className="col-span-4">Customer Name</div>
                    <div className="col-span-3">Time</div>
                    <div className="col-span-2 text-center">Payment Mode</div>
                    <div className="col-span-2 text-right">Amount</div>
                    <div className="col-span-1 text-center">Action</div>
                  </div>

                  {/* Table Rows */}
                  <div className="divide-y divide-zinc-100">
                    {filteredBills.map((bill) => (
                      <div
                        key={bill.id}
                        className="grid grid-cols-12 gap-4 px-5 py-3 items-center hover:bg-zinc-50/50 transition-colors text-xs"
                      >
                        {/* Name & Contact */}
                        <div className="col-span-4 min-w-0 pr-2">
                          <p className="font-semibold text-zinc-900 truncate">
                            {bill.customerName}
                          </p>
                          {bill.customerPhone && (
                            <p className="text-[10px] text-zinc-400 mt-0.5">{bill.customerPhone}</p>
                          )}
                        </div>

                        {/* Booking Time */}
                        <div className="col-span-3 text-zinc-500 font-mono">
                          {new Date(bill.bookingTime).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </div>

                        {/* Payment Mode Tag */}
                        <div className="col-span-2 flex justify-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              bill.paymentMode === "cash"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : bill.paymentMode === "upi"
                                ? "bg-purple-50 text-purple-700 border border-purple-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {bill.paymentMode === "cash" && <Wallet className="w-2.5 h-2.5" />}
                            {bill.paymentMode === "upi" && <QrCode className="w-2.5 h-2.5" />}
                            {bill.paymentMode === "card" && <CreditCard className="w-2.5 h-2.5" />}
                            {bill.paymentMode}
                          </span>
                        </div>

                        {/* Amount */}
                        <div className="col-span-2 text-right font-bold text-zinc-950">
                          ₹{bill.totalAmount.toFixed(2)}
                        </div>

                        {/* View Action */}
                        <div className="col-span-1 flex justify-center">
                          <button
                            onClick={() => setSelectedBill(bill)}
                            className="p-1 text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 rounded-md transition-colors"
                            title="View Receipt"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side live Feed (4/12 cols) */}
        <div className="xl:col-span-4 space-y-3">
          <h2 className="text-sm font-bold text-zinc-900">
            Live Feed
          </h2>
          {serializableConfig && (
            <RecentActivity
              bookings={activityList}
              industryConfig={serializableConfig}
            />
          )}
        </div>

      </div>

      {/* VIEW RECEIPT MODAL OVERLAY */}
      {selectedBill && (
        <div 
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4" 
          onClick={() => setSelectedBill(null)}
        >
          <div 
            className="bg-white rounded-2xl border border-zinc-200 shadow-2xl p-6 max-w-sm w-full relative font-mono text-xs text-zinc-800 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Close Modal button */}
            <button 
              onClick={() => setSelectedBill(null)} 
              className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Thermal Receipt Content */}
            <div className="space-y-5">
              
              {/* Receipt Header */}
              <div className="text-center border-b border-dashed border-zinc-200 pb-3 space-y-1.5">
                {business?.logo_url && (
                  <img src={business.logo_url} alt="Logo" className="w-10 h-10 rounded-lg mx-auto object-cover border border-zinc-100" />
                )}
                <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wide">
                  {business?.name || "TEN ELEVEN CAFE"}
                </h3>
                <p className="text-[10px] text-zinc-400">Invoice: {selectedBill.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-[10px] text-zinc-400">{new Date(selectedBill.bookingTime).toLocaleString()}</p>
              </div>

              {/* Transaction details */}
              <div className="space-y-1 text-[11px] border-b border-dashed border-zinc-200 pb-3">
                <p><span className="text-zinc-400">Guest:</span> {selectedBill.customerName}</p>
                {selectedBill.customerPhone && (
                  <p><span className="text-zinc-400">Phone:</span> {selectedBill.customerPhone}</p>
                )}
                <p><span className="text-zinc-400">Payment:</span> <span className="font-bold uppercase text-zinc-950">{selectedBill.paymentMode}</span></p>
              </div>

              {/* Items List */}
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-zinc-100 text-zinc-400">
                    <th className="text-left pb-1 font-medium">ITEM</th>
                    <th className="text-center pb-1 font-medium">QTY</th>
                    <th className="text-right pb-1 font-medium">PRICE</th>
                    <th className="text-right pb-1 font-medium">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBill.lineItems.map((li) => (
                    <tr key={li.serviceId} className="border-b border-zinc-50">
                      <td className="py-1.5 text-zinc-950 font-medium">{li.name}</td>
                      <td className="py-1.5 text-center">{li.qty}</td>
                      <td className="py-1.5 text-right">₹{li.price.toFixed(2)}</td>
                      <td className="py-1.5 text-right font-semibold">₹{(li.price * li.qty).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Calculation */}
              <div className="border-t border-dashed border-zinc-200 pt-3 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Subtotal</span>
                  <span>₹{(selectedBill.totalAmount / (1 + taxRate)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">GST (18%)</span>
                  <span>₹{(selectedBill.totalAmount - (selectedBill.totalAmount / (1 + taxRate))).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold pt-2 border-t border-dashed border-zinc-200 text-zinc-950">
                  <span>Grand Total</span>
                  <span>₹{selectedBill.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center pt-3 border-t border-dashed border-zinc-200 text-[9px] text-zinc-400 space-y-0.5">
                <p>Reprinted Invoice</p>
                <p>Powered by BizPlatform</p>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
