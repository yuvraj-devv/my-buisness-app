"use client";

import { useState, useEffect, useTransition, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseClient } from "@/lib/supabase-client";
import { QRCodeSVG } from "qrcode.react";
import {
  Activity,
  User,
  Calendar,
  Settings,
  HelpCircle,
  Clock,
  ArrowLeft,
  Loader2,
  CheckCircle,
  X,
  ShieldAlert,
  Save,
  MessageSquare,
  Bookmark,
  Bell,
  MapPin,
  FileText,
  QrCode,
} from "lucide-react";

// Generate standard 15-minute slot times from 9:00 AM to 5:00 PM
function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 9; h <= 17; h++) {
    for (let m = 0; m < 60; m += 15) {
      if (h === 17 && m > 0) break;
      const hour12 = h > 12 ? h - 12 : h;
      const period = h >= 12 ? "PM" : "AM";
      const displayHour = hour12 === 0 ? 12 : hour12;
      slots.push(
        `${displayHour.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${period}`
      );
    }
  }
  return slots;
}

function slotToBookingTime(slot: string, date: string) {
  const [time, period] = slot.split(" ");
  const [hourText, minuteText] = time.split(":");
  let hour = Number(hourText);
  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;
  const bookingDate = new Date(date);
  bookingDate.setHours(hour, Number(minuteText), 0, 0);
  return bookingDate.toISOString();
}

const timeSlots = generateTimeSlots();

type Booking = {
  id: string;
  business_id: string;
  offering_id: string | null;
  customer_name: string;
  customer_contact: string;
  booking_time: string;
  status: string;
  created_at: string;
  businesses?: {
    name: string;
    logo_url: string | null;
    industry_type: string;
  } | null;
};

function ProfileDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Active tab state
  const [activeTab, setActiveTab] = useState(() => {
    return searchParams.get("tab") || "details";
  });

  // User auth state
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Profile Form States
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  
  // Passes (stored in user metadata)
  const [insurance, setInsurance] = useState("");
  const [allergies, setAllergies] = useState("");
  const [dietary, setDietary] = useState("");
  const [tablePref, setTablePref] = useState("");
  
  // Save status
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSavedMsg, setProfileSavedMsg] = useState("");

  // Bookings List States
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [qrBooking, setQrBooking] = useState<Booking | null>(null);

  // Rescheduling Dialog States
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleSlot, setRescheduleSlot] = useState(timeSlots[0]);
  const [busySlots, setBusySlots] = useState<string[]>([]);
  const [rescheduleSaving, setRescheduleSaving] = useState(false);
  const [rescheduleError, setRescheduleError] = useState("");

  // Preferences Form States
  const [smsNotification, setSmsNotification] = useState(true);
  const [emailNotification, setEmailNotification] = useState(true);
  const [region, setRegion] = useState("Orai");
  const [defaultIndustry, setDefaultIndustry] = useState("All");
  const [prefSaving, setPrefSaving] = useState(false);
  const [prefSavedMsg, setPrefSavedMsg] = useState("");

  // Help & Support Form States
  const [supportSubject, setSupportSubject] = useState("");
  const [supportCategory, setSupportCategory] = useState("Bug Report");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportSubmitting, setSupportSubmitting] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState(false);
  const [showSqlAlert, setShowSqlAlert] = useState(false);

  // Synchronize active tab from URL query params
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Load User, Profile, Bookings and Preferences on Mount
  useEffect(() => {
    async function loadData() {
      const { data: { user: authUser } } = await supabaseClient.auth.getUser();
      if (!authUser) {
        router.push("/login");
        return;
      }
      setUser(authUser);

      // 1. Load Profile
      const { data: prof } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (prof) {
        setProfile(prof);
        setFullName(prof.full_name || "");
        setAvatarUrl(prof.avatar_url || "");
      }

      // Load Metadata variables
      const meta = authUser.user_metadata || {};
      setPhone(meta.phone || authUser.phone || "");
      
      const medPass = meta.medical_pass || {};
      setInsurance(medPass.insurance || "");
      setAllergies(medPass.allergies || "");

      const hospPass = meta.hospitality_pass || {};
      setDietary(hospPass.dietary || "");
      setTablePref(hospPass.preferences || "");

      const pref = meta.preferences || {};
      setSmsNotification(pref.sms_notifications !== false);
      setEmailNotification(pref.email_notifications !== false);
      setRegion(pref.region || "Orai");
      setDefaultIndustry(pref.default_industry || "All");

      setLoading(false);

      // 2. Load Bookings
      await fetchBookings(authUser.id);
    }

    loadData();
  }, [router]);

  async function fetchBookings(userId: string) {
    setBookingsLoading(true);
    const { data, error } = await supabaseClient
      .from("bookings")
      .select("*, businesses(name, logo_url, industry_type)")
      .order("booking_time", { ascending: false });

    if (!error && data) {
      setBookings(data as Booking[]);
    }
    setBookingsLoading(false);
  }

  // Load busy slots for rescheduling date
  useEffect(() => {
    if (!rescheduleBooking || !rescheduleDate) return;
    const currentBooking = rescheduleBooking;

    async function loadBusySlots() {
      const startOfDay = `${rescheduleDate}T00:00:00.000Z`;
      const endOfDay = `${rescheduleDate}T23:59:59.999Z`;

      const { data } = await supabaseClient
        .from("bookings")
        .select("booking_time")
        .eq("business_id", currentBooking.business_id)
        .eq("status", "confirmed")
        .gte("booking_time", startOfDay)
        .lte("booking_time", endOfDay);

      if (data) {
        const busy = data.map((b) => {
          const d = new Date(b.booking_time);
          const hour = d.getHours();
          const minute = d.getMinutes();
          const period = hour >= 12 ? "PM" : "AM";
          const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
          return `${displayHour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")} ${period}`;
        });
        setBusySlots(busy);
      } else {
        setBusySlots([]);
      }
    }

    loadBusySlots();
  }, [rescheduleBooking, rescheduleDate]);

  // Handle Profile Update
  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setProfileSaving(true);
    setProfileSavedMsg("");

    // 1. Update profiles table
    const { error: profileErr } = await supabaseClient
      .from("profiles")
      .upsert({
        id: user.id,
        full_name: fullName,
        avatar_url: avatarUrl,
        role: profile?.role || "consumer",
      });

    // 2. Update user metadata
    const { error: metaErr } = await supabaseClient.auth.updateUser({
      data: {
        full_name: fullName,
        phone: phone,
        medical_pass: { insurance, allergies },
        hospitality_pass: { dietary, preferences: tablePref },
      },
    });

    setProfileSaving(false);

    if (profileErr || metaErr) {
      setProfileSavedMsg("❌ Failed to update profile details.");
    } else {
      setProfileSavedMsg("✓ Profile details updated successfully.");
      setTimeout(() => setProfileSavedMsg(""), 4000);
    }
  }

  // Handle Preferences Update
  async function handlePreferencesSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setPrefSaving(true);
    setPrefSavedMsg("");

    const { error } = await supabaseClient.auth.updateUser({
      data: {
        preferences: {
          sms_notifications: smsNotification,
          email_notifications: emailNotification,
          region: region,
          default_industry: defaultIndustry,
        },
      },
    });

    setPrefSaving(false);

    if (error) {
      setPrefSavedMsg("❌ Failed to save preferences.");
    } else {
      setPrefSavedMsg("✓ Preferences saved successfully.");
      setTimeout(() => setPrefSavedMsg(""), 4000);
    }
  }

  // Handle Rescheduling Save
  async function handleRescheduleSave() {
    if (!rescheduleBooking || !rescheduleDate || !rescheduleSlot) return;
    setRescheduleSaving(true);
    setRescheduleError("");

    const targetTimeISO = slotToBookingTime(rescheduleSlot, rescheduleDate);

    // Concurrency check before updating
    const startOfDay = `${rescheduleDate}T00:00:00.000Z`;
    const endOfDay = `${rescheduleDate}T23:59:59.999Z`;

    const { data: conflicts } = await supabaseClient
      .from("bookings")
      .select("id")
      .eq("business_id", rescheduleBooking.business_id)
      .eq("status", "confirmed")
      .eq("booking_time", targetTimeISO);

    if (conflicts && conflicts.length > 0) {
      setRescheduleError("This slot has just been booked. Please pick another time.");
      setRescheduleSaving(false);
      return;
    }

    const { error } = await supabaseClient
      .from("bookings")
      .update({ booking_time: targetTimeISO })
      .eq("id", rescheduleBooking.id);

    setRescheduleSaving(false);

    if (error) {
      setRescheduleError(error.message);
    } else {
      // Success
      setBookings((prev) =>
        prev.map((b) => (b.id === rescheduleBooking.id ? { ...b, booking_time: targetTimeISO } : b))
      );
      setRescheduleBooking(null);
    }
  }

  // Handle Cancel Booking
  async function handleCancelBooking(id: string) {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    const { error } = await supabaseClient
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", id);

    if (!error) {
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))
      );
    }
  }

  // Handle Support Ticket Submit
  async function handleSupportSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSupportSubmitting(true);
    setSupportSuccess(false);
    setShowSqlAlert(false);

    const { error } = await supabaseClient.from("support_tickets").insert({
      user_id: user.id,
      customer_name: fullName || user.email?.split("@")[0] || "Customer",
      customer_email: user.email,
      subject: `${supportCategory}: ${supportSubject}`,
      message: supportMessage,
    });

    setSupportSubmitting(false);

    if (error) {
      // Table doesn't exist, trigger database alert modal for developer
      if (error.message.includes("does not exist") || error.code === "42P01") {
        setShowSqlAlert(true);
      } else {
        alert(`Error: ${error.message}`);
      }
    } else {
      setSupportSuccess(true);
      setSupportSubject("");
      setSupportMessage("");
    }
  }

  const navigateTab = (tab: string) => {
    startTransition(() => {
      setActiveTab(tab);
      const params = new URLSearchParams(window.location.search);
      params.set("tab", tab);
      router.push(`/profile?${params.toString()}`);
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50">
        <Loader2 className="w-8 h-8 text-zinc-900 animate-spin mb-2" />
        <p className="text-xs text-zinc-400 font-medium">Loading account details...</p>
      </div>
    );
  }

  // Filter bookings into Upcoming and Past
  const upcomingBookings = bookings.filter((b) => {
    const isUpcomingStatus = b.status === "confirmed";
    const isFutureTime = new Date(b.booking_time).getTime() > Date.now();
    return isUpcomingStatus && isFutureTime;
  });

  const pastBookings = bookings.filter((b) => {
    const isPastStatus = b.status !== "confirmed";
    const isPastTime = new Date(b.booking_time).getTime() <= Date.now();
    return isPastStatus || isPastTime;
  });

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 selection:bg-zinc-100 pb-20">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-10 bg-white border-b border-zinc-200/80">
        <div className="flex items-center justify-between px-6 lg:px-12 h-14 max-w-7xl mx-auto">
          <div className="flex items-center gap-6">
            <Link
              href="/explore"
              className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Explore
            </Link>
          </div>
          <span className="text-xs font-bold text-zinc-400">Account Dashboard</span>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <aside className="md:col-span-1 space-y-1">
            <div className="px-3 pb-3 mb-3 border-b border-zinc-200/60">
              <p className="text-xs font-bold text-zinc-900 truncate">{fullName || "Client"}</p>
              <p className="text-[10px] text-zinc-400 truncate mt-0.5">{user.email}</p>
            </div>
            
            <button
              onClick={() => navigateTab("details")}
              className={`flex items-center gap-2.5 px-3 py-2 w-full text-left rounded-lg text-xs font-semibold transition-all border-0 cursor-pointer
                ${activeTab === "details" ? "bg-white text-zinc-900 shadow-sm border border-zinc-200" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/50"}
              `}
            >
              <User className="w-4 h-4 text-zinc-400" />
              Profile Details
            </button>
            <button
              onClick={() => navigateTab("bookings")}
              className={`flex items-center gap-2.5 px-3 py-2 w-full text-left rounded-lg text-xs font-semibold transition-all border-0 cursor-pointer
                ${activeTab === "bookings" ? "bg-white text-zinc-900 shadow-sm border border-zinc-200" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/50"}
              `}
            >
              <Calendar className="w-4 h-4 text-zinc-400" />
              My Bookings
            </button>
            <button
              onClick={() => navigateTab("preferences")}
              className={`flex items-center gap-2.5 px-3 py-2 w-full text-left rounded-lg text-xs font-semibold transition-all border-0 cursor-pointer
                ${activeTab === "preferences" ? "bg-white text-zinc-900 shadow-sm border border-zinc-200" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/50"}
              `}
            >
              <Settings className="w-4 h-4 text-zinc-400" />
              Preferences
            </button>
            <button
              onClick={() => navigateTab("support")}
              className={`flex items-center gap-2.5 px-3 py-2 w-full text-left rounded-lg text-xs font-semibold transition-all border-0 cursor-pointer
                ${activeTab === "support" ? "bg-white text-zinc-900 shadow-sm border border-zinc-200" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/50"}
              `}
            >
              <HelpCircle className="w-4 h-4 text-zinc-400" />
              Help & Support
            </button>
          </aside>

          {/* Workspaces Body */}
          <section className="md:col-span-3">
            <div className="bg-white border border-zinc-200 shadow-xs rounded-2xl p-6 lg:p-8">
              <AnimatePresence mode="wait">
                {/* 1. PROFILE DETAILS */}
                {activeTab === "details" && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-base font-bold text-zinc-900">Profile Details</h2>
                      <p className="text-xs text-zinc-500 mt-1">Manage your identity card and dynamic passes for quick booking lookup.</p>
                    </div>

                    <form onSubmit={handleProfileSave} className="space-y-6">
                      {/* Name, Email, Phone, Avatar */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Full Name</label>
                          <input
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full h-9 rounded-lg border border-zinc-300 bg-white px-3 text-xs text-zinc-900 focus:outline-none focus:border-zinc-450"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Email Address</label>
                          <input
                            value={user.email}
                            disabled
                            className="w-full h-9 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-xs text-zinc-400 cursor-not-allowed"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Phone Number</label>
                          <input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+91 99887 76655"
                            className="w-full h-9 rounded-lg border border-zinc-300 bg-white px-3 text-xs text-zinc-900 focus:outline-none focus:border-zinc-450"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Avatar Image URL</label>
                          <input
                            value={avatarUrl}
                            onChange={(e) => setAvatarUrl(e.target.value)}
                            placeholder="https://example.com/avatar.jpg"
                            className="w-full h-9 rounded-lg border border-zinc-300 bg-white px-3 text-xs text-zinc-900 focus:outline-none focus:border-zinc-450"
                          />
                        </div>
                      </div>

                      <div className="h-px bg-zinc-150" />

                      {/* Passes (Medical / Hospitality) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Medical Pass */}
                        <div className="space-y-3.5 bg-zinc-50/50 border border-zinc-200/60 p-4 rounded-xl">
                          <div className="flex items-center gap-2 text-zinc-800">
                            <Activity className="w-4 h-4 text-emerald-500" />
                            <h3 className="text-xs font-bold">Medical Pass (Healthcare)</h3>
                          </div>
                          <div className="space-y-2.5">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-zinc-500 uppercase">Insurance Provider / ID</label>
                              <input
                                value={insurance}
                                onChange={(e) => setInsurance(e.target.value)}
                                placeholder="LIC / Star Health"
                                className="w-full h-8 rounded-lg border border-zinc-300 bg-white px-2.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-400"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-zinc-500 uppercase">Allergies / Critical Notes</label>
                              <textarea
                                value={allergies}
                                onChange={(e) => setAllergies(e.target.value)}
                                placeholder="Dust, Penicillin, etc."
                                className="w-full min-h-[60px] rounded-lg border border-zinc-300 bg-white p-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-400 resize-none"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Hospitality Pass */}
                        <div className="space-y-3.5 bg-zinc-50/50 border border-zinc-200/60 p-4 rounded-xl">
                          <div className="flex items-center gap-2 text-zinc-800">
                            <Bookmark className="w-4 h-4 text-amber-500" />
                            <h3 className="text-xs font-bold">Hospitality Pass (Cafes/Bistros)</h3>
                          </div>
                          <div className="space-y-2.5">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-zinc-500 uppercase">Dietary Preferences</label>
                              <input
                                value={dietary}
                                onChange={(e) => setDietary(e.target.value)}
                                placeholder="Vegan, Gluten-free, Nut-allergy"
                                className="w-full h-8 rounded-lg border border-zinc-300 bg-white px-2.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-400"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-zinc-500 uppercase">Seating / Table Preferences</label>
                              <input
                                value={tablePref}
                                onChange={(e) => setTablePref(e.target.value)}
                                placeholder="Window-side, quiet corner"
                                className="w-full h-8 rounded-lg border border-zinc-300 bg-white px-2.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-400"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status Msg & Save */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs font-semibold text-zinc-500">{profileSavedMsg}</span>
                        <button
                          type="submit"
                          disabled={profileSaving}
                          className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs py-2 px-4 rounded-lg cursor-pointer border-0 disabled:opacity-50"
                        >
                          {profileSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* 2. MY BOOKINGS */}
                {activeTab === "bookings" && (
                  <motion.div
                    key="bookings"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-base font-bold text-zinc-900">My Bookings</h2>
                      <p className="text-xs text-zinc-500 mt-1">Check upcoming scheduling parameters and track history.</p>
                    </div>

                    {bookingsLoading ? (
                      <div className="flex justify-center items-center py-10">
                        <Loader2 className="w-6 h-6 text-zinc-400 animate-spin" />
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* 2a. Upcoming Bookings */}
                        <div className="space-y-3">
                          <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Upcoming Requests</h3>
                          {upcomingBookings.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {upcomingBookings.map((b) => {
                                const formattedTime = new Date(b.booking_time).toLocaleString("en-US", {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                });
                                const isRest = b.businesses?.industry_type === "restaurant" || b.businesses?.industry_type === "cafe";
                                const tableMatch = b.customer_contact.match(/\|\s*Table\s*(\d+)/);
                                const tableNum = tableMatch ? tableMatch[1] : null;

                                return (
                                  <div
                                    key={b.id}
                                    className="flex flex-col justify-between border border-zinc-200 rounded-xl p-4 bg-white hover:shadow-sm transition-all relative group"
                                  >
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-bold text-zinc-900">{b.businesses?.name || "Business"}</h4>
                                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200/50">
                                          Confirmed
                                        </span>
                                      </div>
                                      
                                      <p className="text-xs text-zinc-500 font-medium flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                                        {formattedTime}
                                      </p>

                                      {tableNum && (
                                        <span className="inline-flex text-[9px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200/40">
                                          Table {tableNum}
                                        </span>
                                      )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-zinc-100/80">
                                      <button
                                        onClick={() => setQrBooking(b)}
                                        className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 text-zinc-650 hover:bg-zinc-100 hover:text-zinc-900 rounded-lg text-[10px] font-bold cursor-pointer transition-all"
                                      >
                                        <QrCode className="w-3.5 h-3.5" />
                                        QR Pass
                                      </button>
                                      <button
                                        onClick={() => {
                                          setRescheduleBooking(b);
                                          setRescheduleDate(b.booking_time.split("T")[0]);
                                        }}
                                        className="px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 text-zinc-650 hover:bg-zinc-100 hover:text-zinc-900 rounded-lg text-[10px] font-bold cursor-pointer transition-all"
                                      >
                                        Reschedule
                                      </button>
                                      <button
                                        onClick={() => handleCancelBooking(b.id)}
                                        className="px-2.5 py-1.5 bg-white border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 rounded-lg text-[10px] font-bold cursor-pointer transition-all ml-auto"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-8 border border-dashed border-zinc-200 rounded-xl bg-zinc-50">
                              <p className="text-xs text-zinc-400 font-medium">No upcoming reservations found.</p>
                            </div>
                          )}
                        </div>

                        {/* 2b. Past Bookings */}
                        <div className="space-y-3 pt-2">
                          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Past History</h3>
                          {pastBookings.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {pastBookings.map((b) => {
                                const formattedTime = new Date(b.booking_time).toLocaleString("en-US", {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                });
                                const isCancelled = b.status === "cancelled";
                                const isCompleted = b.status === "completed";

                                return (
                                  <div
                                    key={b.id}
                                    className="border border-zinc-200/70 rounded-xl p-4 bg-zinc-50/30 text-zinc-600 flex items-center justify-between"
                                  >
                                    <div className="space-y-1">
                                      <h4 className="text-xs font-bold text-zinc-800">{b.businesses?.name || "Business"}</h4>
                                      <p className="text-[11px] text-zinc-400">{formattedTime}</p>
                                    </div>

                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border
                                      ${isCancelled 
                                        ? "bg-red-50 text-red-500 border-red-200/40" 
                                        : isCompleted 
                                        ? "bg-emerald-50 text-emerald-600 border-emerald-200/40" 
                                        : "bg-zinc-100 text-zinc-500 border-zinc-200"
                                      }
                                    `}>
                                      {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-8 border border-dashed border-zinc-200 rounded-xl bg-zinc-50/20">
                              <p className="text-xs text-zinc-400">No past reservations found.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* 3. PREFERENCES */}
                {activeTab === "preferences" && (
                  <motion.div
                    key="preferences"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-base font-bold text-zinc-900">Preferences</h2>
                      <p className="text-xs text-zinc-500 mt-1">Configure your search defaults and notification channels.</p>
                    </div>

                    <form onSubmit={handlePreferencesSave} className="space-y-6">
                      {/* Notification Channels */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Bell className="w-4 h-4 text-zinc-400" />
                          Notification Channels
                        </h3>
                        <div className="space-y-3.5 bg-zinc-50/50 border border-zinc-200/60 p-4 rounded-xl">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-bold text-zinc-850">SMS Updates via Twilio</p>
                              <p className="text-[10px] text-zinc-400">Receive 6-digit confirmation codes and real-time seating notifications.</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSmsNotification(!smsNotification)}
                              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer border-0 flex items-center
                                ${smsNotification ? "bg-zinc-900 justify-end" : "bg-zinc-200 justify-start"}
                              `}
                            >
                              <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
                            </button>
                          </div>

                          <div className="h-px bg-zinc-200/50" />

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-bold text-zinc-850">Email Updates via Supabase</p>
                              <p className="text-[10px] text-zinc-400">Receive comprehensive booking receipts, invoices, and scheduling notes.</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setEmailNotification(!emailNotification)}
                              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer border-0 flex items-center
                                ${emailNotification ? "bg-zinc-900 justify-end" : "bg-zinc-200 justify-start"}
                              `}
                            >
                              <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="h-px bg-zinc-150" />

                      {/* Smart Discovery Filters */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-zinc-400" />
                          Smart Discovery Filters
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Primary Geographic Region</label>
                            <input
                              value={region}
                              onChange={(e) => setRegion(e.target.value)}
                              placeholder="Orai, Muscle Beach, Springfield"
                              className="w-full h-9 rounded-lg border border-zinc-300 bg-white px-3 text-xs text-zinc-900 focus:outline-none focus:border-zinc-450"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Preferred Industry Default</label>
                            <select
                              value={defaultIndustry}
                              onChange={(e) => setDefaultIndustry(e.target.value)}
                              className="w-full h-9 rounded-lg border border-zinc-300 bg-white px-3 text-xs text-zinc-900 focus:outline-none focus:border-zinc-450 cursor-pointer"
                            >
                              <option value="All">All Categories (Default)</option>
                              <option value="Healthcare">Clinics & Hospitals</option>
                              <option value="Restaurant">Restaurants & Cafes</option>
                              <option value="Education">Education & Tutoring</option>
                              <option value="Hospitality">Hotels & Hospitality</option>
                              <option value="Service">Other Services</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Save Button */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs font-semibold text-zinc-500">{prefSavedMsg}</span>
                        <button
                          type="submit"
                          disabled={prefSaving}
                          className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs py-2 px-4 rounded-lg cursor-pointer border-0 disabled:opacity-50"
                        >
                          {prefSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          Save Preferences
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* 4. HELP & SUPPORT */}
                {activeTab === "support" && (
                  <motion.div
                    key="support"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-base font-bold text-zinc-900">Help & Support</h2>
                      <p className="text-xs text-zinc-500 mt-1">Submit support tickets directly to the administrator panel.</p>
                    </div>

                    {supportSuccess ? (
                      <div className="text-center py-10 space-y-3 bg-zinc-50 rounded-xl border border-zinc-150">
                        <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
                        <div>
                          <h3 className="text-sm font-bold text-zinc-900">Ticket Submitted Successfully</h3>
                          <p className="text-xs text-zinc-400 mt-1">An administrator will review your ticket shortly.</p>
                        </div>
                        <button
                          onClick={() => setSupportSuccess(false)}
                          className="text-xs text-zinc-600 hover:text-zinc-900 font-semibold underline mt-2 cursor-pointer border-0 bg-transparent"
                        >
                          Submit Another Ticket
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleSupportSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="sm:col-span-2 space-y-1.5">
                            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Ticket Title / Subject</label>
                            <input
                              value={supportSubject}
                              onChange={(e) => setSupportSubject(e.target.value)}
                              placeholder="e.g., Unable to cancel my table booking"
                              className="w-full h-9 rounded-lg border border-zinc-300 bg-white px-3 text-xs text-zinc-900 focus:outline-none focus:border-zinc-450"
                              required
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Category</label>
                            <select
                              value={supportCategory}
                              onChange={(e) => setSupportCategory(e.target.value)}
                              className="w-full h-9 rounded-lg border border-zinc-300 bg-white px-3 text-xs text-zinc-900 focus:outline-none focus:border-zinc-450 cursor-pointer"
                            >
                              <option value="Bug Report">Bug Report</option>
                              <option value="Listing Issue">Listing Issue</option>
                              <option value="Billing Issue">Billing Issue</option>
                              <option value="General Complaint">Complaint</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Describe the Issue</label>
                          <textarea
                            value={supportMessage}
                            onChange={(e) => setSupportMessage(e.target.value)}
                            placeholder="Provide details about the issue you are facing..."
                            className="w-full min-h-[120px] rounded-lg border border-zinc-300 bg-white p-3 text-xs text-zinc-900 focus:outline-none focus:border-zinc-450 resize-y"
                            required
                          />
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            type="submit"
                            disabled={supportSubmitting}
                            className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs py-2 px-5 rounded-lg cursor-pointer border-0 disabled:opacity-50"
                          >
                            {supportSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageSquare className="w-3.5 h-3.5" />}
                            Submit Ticket
                          </button>
                        </div>
                      </form>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>
      </main>

      {/* DYNAMIC QR CODE PASS MODAL */}
      <AnimatePresence>
        {qrBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/10 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setQrBooking(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-zinc-200 shadow-xl rounded-2xl p-6 max-w-sm w-full text-center space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                <span className="text-xs font-bold text-zinc-800">Booking Pass QR</span>
                <button
                  onClick={() => setQrBooking(null)}
                  className="text-zinc-400 hover:text-zinc-600 border-0 bg-transparent cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-zinc-50 border border-zinc-150 p-4 rounded-xl inline-block mx-auto">
                <QRCodeSVG
                  value={`bizplatform://booking/${qrBooking.id}`}
                  size={170}
                  level="Q"
                  includeMargin={false}
                />
              </div>

              <div className="space-y-1">
                <p className="text-sm font-black text-zinc-900">{qrBooking.businesses?.name}</p>
                <p className="text-[11px] text-zinc-450">
                  {new Date(qrBooking.booking_time).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
                <p className="text-[10px] text-zinc-400 font-mono tracking-tight bg-zinc-50 border border-zinc-100/80 px-2 py-1 rounded mt-2">
                  ID: {qrBooking.id}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RESCHEDULING MODAL DIALOG */}
      <AnimatePresence>
        {rescheduleBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/10 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setRescheduleBooking(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-zinc-200 shadow-xl rounded-2xl p-6 max-w-md w-full space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                <span className="text-xs font-bold text-zinc-800">Reschedule Reservation</span>
                <button
                  onClick={() => setRescheduleBooking(null)}
                  className="text-zinc-400 hover:text-zinc-600 border-0 bg-transparent cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {rescheduleError && (
                <div className="bg-red-50 border border-red-200 text-red-500 rounded-lg p-3 text-xs font-semibold">
                  {rescheduleError}
                </div>
              )}

              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Select Date</label>
                  <input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full h-9 rounded-lg border border-zinc-300 bg-white px-3 text-xs text-zinc-900 focus:outline-none focus:border-zinc-400 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Select Time Slot</label>
                  <div className="grid grid-cols-3 gap-1.5 max-h-40 overflow-y-auto scrollbar-thin pr-1 border border-zinc-150 p-2 rounded-xl">
                    {timeSlots.map((time) => {
                      const isBusy = busySlots.includes(time);
                      const isSelected = rescheduleSlot === time;
                      return (
                        <button
                          key={time}
                          type="button"
                          disabled={isBusy}
                          onClick={() => setRescheduleSlot(time)}
                          className={`px-1.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer select-none text-center
                            ${isSelected
                              ? "bg-zinc-900 text-white border-transparent"
                              : isBusy
                              ? "border-zinc-100 bg-zinc-50 text-zinc-350 cursor-not-allowed opacity-60"
                              : "border-zinc-200 bg-white text-zinc-550 hover:text-zinc-900 hover:border-zinc-350"
                            }
                          `}
                        >
                          {time} {isBusy ? " (Full)" : ""}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setRescheduleBooking(null)}
                  className="px-4 py-2 border border-zinc-200 bg-white text-zinc-650 hover:bg-zinc-50 rounded-lg text-xs font-semibold cursor-pointer transition-all border-0"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRescheduleSave}
                  disabled={rescheduleSaving || !rescheduleDate}
                  className="flex items-center gap-1 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition-all border-0 disabled:opacity-50"
                >
                  {rescheduleSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SQL SCHEMA TABLE MISSING POPUP ALERT */}
      <AnimatePresence>
        {showSqlAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/10 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white border border-zinc-200 shadow-2xl rounded-2xl p-6 max-w-lg w-full space-y-4"
            >
              <div className="flex items-center gap-2 text-amber-500">
                <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                <h3 className="text-sm font-bold text-zinc-900">Database Table Missing (Action Required)</h3>
              </div>
              
              <p className="text-xs text-zinc-500 leading-relaxed">
                The support ticket could not be saved because the `support_tickets` table has not been created in your Supabase database.
              </p>

              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-zinc-500 uppercase">Please execute this SQL script in your Supabase Dashboard SQL Editor:</p>
                <pre className="bg-zinc-50 border border-zinc-150 text-[10px] font-mono p-3 rounded-lg overflow-x-auto text-zinc-700 leading-normal max-h-48">
{`CREATE TABLE public.support_tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable insert for authenticated users" ON public.support_tickets FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable select for ticket creators" ON public.support_tickets FOR SELECT TO authenticated USING (auth.uid() = user_id);`}
                </pre>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => {
                    setShowSqlAlert(false);
                    setSupportSuccess(true); // Gracefully treat as success for client testing purposes
                  }}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold cursor-pointer border-0"
                >
                  Close & Proceed (Mock Ticket)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProfileDashboard() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50">
        <Loader2 className="w-8 h-8 text-zinc-900 animate-spin mb-2" />
        <p className="text-xs text-zinc-400 font-medium">Loading profile...</p>
      </div>
    }>
      <ProfileDashboardContent />
    </Suspense>
  );
}
