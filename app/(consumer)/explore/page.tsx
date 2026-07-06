"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseClient } from "@/lib/supabase-client";
import { signOut } from "@/lib/auth-actions";
import { UserProfileMenu } from "@/components/user-profile-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  MapPin,
  Star,
  ArrowRight,
  Stethoscope,
  UtensilsCrossed,
  GraduationCap,
  Hotel,
  ShoppingBag,
  Building2,
  Factory,
  Tractor,
  Wrench,
  Store,
  LogOut,
  Sparkles,
  Locate,
} from "lucide-react";

type Business = {
  id: string;
  name: string;
  slug: string;
  industry_type: string;
  description: string;
  address: string;
  rating: number;
  review_count: number;
};

const industryIcons: Record<string, typeof Stethoscope> = {
  healthcare: Stethoscope,
  restaurant: UtensilsCrossed,
  cafe: UtensilsCrossed,
  education: GraduationCap,
  hospitality: Hotel,
  retail: ShoppingBag,
  real_estate: Building2,
  manufacturing: Factory,
  agriculture: Tractor,
  service: Wrench,
};

const industryColors: Record<string, string> = {
  healthcare: "text-emerald-600 bg-emerald-50",
  restaurant: "text-amber-600 bg-amber-50",
  cafe: "text-orange-600 bg-orange-50",
  education: "text-blue-600 bg-blue-50",
  hospitality: "text-violet-600 bg-violet-50",
  retail: "text-pink-600 bg-pink-50",
  real_estate: "text-teal-600 bg-teal-50",
  manufacturing: "text-slate-600 bg-slate-50",
  agriculture: "text-lime-700 bg-lime-50",
  service: "text-cyan-600 bg-cyan-50",
};

const filters = [
  "All", "Healthcare", "Restaurant", "Education",
  "Hospitality", "Retail", "Real Estate", "Agriculture", "Service"
];

export default function ExplorePage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [detectedLocation, setDetectedLocation] = useState("Hyderabad");
  const [tempLocation, setTempLocation] = useState("");
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [filterByLocation, setFilterByLocation] = useState(true);
  const [newBizNotification, setNewBizNotification] = useState<string | null>(null);

  async function fetchLiveLocation() {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await res.json();
            const city =
              data.address?.city ||
              data.address?.town ||
              data.address?.state_district ||
              data.address?.village ||
              data.address?.suburb ||
              "";
            if (city) {
              setDetectedLocation(city);
              const { data: { user } } = await supabaseClient.auth.getUser();
              if (user) {
                const existingPref = user.user_metadata?.preferences || {};
                await supabaseClient.auth.updateUser({
                  data: {
                    preferences: {
                      ...existingPref,
                      region: city,
                    },
                  },
                });
              }
              return;
            }
          } catch (e) {
            console.error("OSM Geocoding failed", e);
          }
          fetchIpLocation();
        },
        (error) => {
          console.warn("Browser geolocation permission denied or failed", error);
          fetchIpLocation();
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      fetchIpLocation();
    }
  }

  async function fetchIpLocation() {
    try {
      const res = await fetch("https://ipapi.co/json/");
      const ipData = await res.json();
      if (ipData.city) {
        setDetectedLocation(ipData.city);
      }
    } catch (e) {
      console.error("IP Geocoding failed", e);
    }
  }

  useEffect(() => {
    async function load() {
      const { data } = await supabaseClient
        .from("businesses")
        .select("*")
        .order("created_at", { ascending: false });

      setBusinesses(data || []);
      setLoading(false);

      // Fetch live geolocated coordinates/city
      await fetchLiveLocation();

      // Load authenticated user & profile details
      const { data: { user: authUser } } = await supabaseClient.auth.getUser();
      if (authUser) {
        setUser(authUser);

        // Load default industry filter from preferences if set
        const pref = authUser.user_metadata?.preferences || {};
        if (pref.default_industry && pref.default_industry !== "All") {
          setActiveFilter(pref.default_industry);
        }

        // Override with user's specific region preference if configured
        if (pref.region) {
          setDetectedLocation(pref.region);
        }

        const { data: prof } = await supabaseClient
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();
        setProfile(prof);
      }
    }
    load();
  }, []);

  // Set up realtime subscription to listen for new business registrations
  useEffect(() => {
    const channel = supabaseClient
      .channel("realtime-businesses")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "businesses" },
        (payload) => {
          const newBiz = payload.new as Business;
          
          // Add to state if not already present
          setBusinesses((prev) => {
            if (prev.some((b) => b.id === newBiz.id)) return prev;
            return [newBiz, ...prev];
          });

          // Show a temporary visual banner notification
          setNewBizNotification(`✨ A new business "${newBiz.name}" has just registered!`);
          setTimeout(() => {
            setNewBizNotification(null);
          }, 6000);
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, []);

  const filtered = businesses.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.description?.toLowerCase().includes(search.toLowerCase()) ||
      b.address?.toLowerCase().includes(search.toLowerCase());
      
    const matchesFilter =
      activeFilter === "All" ||
      b.industry_type?.toLowerCase().replace("_", " ") === activeFilter.toLowerCase();
      
    const matchesLocation =
      !filterByLocation ||
      !detectedLocation ||
      b.address?.toLowerCase().includes(detectedLocation.toLowerCase());
      
    return matchesSearch && matchesFilter && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* Top Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-zinc-100">
        <div className="flex items-center justify-between px-6 lg:px-12 h-14">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center">
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight text-zinc-900">
              BizPlatform
            </span>
          </div>
          {user ? (
            <UserProfileMenu variant="header" user={user} profile={profile} />
          ) : (
            <div className="w-24 h-8 bg-zinc-100 rounded-full animate-pulse" />
          )}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* Real-time Registration Notification Banner */}
        <AnimatePresence>
          {newBizNotification && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-md flex items-center justify-between"
            >
              <span>{newBizNotification}</span>
              <button
                type="button"
                onClick={() => setNewBizNotification(null)}
                className="text-white/80 hover:text-white font-bold ml-4 cursor-pointer border-0 bg-transparent text-[10px] uppercase"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-zinc-400" />
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
              Explore Businesses
            </h1>
          </div>
          <p className="text-sm text-zinc-500 max-w-md">
            Discover clinics, restaurants, salons, schools and more. Book appointments and services directly.
          </p>
        </motion.div>

        {/* Search + Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search businesses..."
                className="pl-10 bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400"
              />
            </div>

            {/* Geolocation selector */}
            <div className="flex items-center gap-2 self-start sm:self-auto bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-full shadow-2xs select-none">
              <MapPin className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-[11px] font-semibold text-zinc-650">Location:</span>

              {isEditingLocation ? (
                <input
                  type="text"
                  value={tempLocation}
                  onChange={(e) => setTempLocation(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setDetectedLocation(tempLocation);
                      setIsEditingLocation(false);
                    }
                  }}
                  onBlur={() => setIsEditingLocation(false)}
                  className="bg-white border border-zinc-300 rounded px-1.5 py-0.5 text-[11px] w-24 text-zinc-900 font-bold focus:outline-none focus:border-zinc-500"
                  autoFocus
                />
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setTempLocation(detectedLocation);
                      setIsEditingLocation(true);
                    }}
                    className="text-[11px] font-bold text-zinc-900 hover:underline border-0 bg-transparent cursor-pointer p-0"
                  >
                    {detectedLocation || "Detecting..."}
                  </button>
                  <button
                    type="button"
                    onClick={fetchLiveLocation}
                    className="p-0.5 hover:bg-zinc-200 rounded-full transition-colors cursor-pointer border-0 bg-transparent text-zinc-400 hover:text-zinc-700 flex items-center justify-center"
                    title="Auto-detect current location"
                  >
                    <Locate className="w-3 h-3" />
                  </button>
                </div>
              )}

              <div className="h-3 w-px bg-zinc-250 mx-1" />

              <button
                type="button"
                onClick={() => setFilterByLocation(!filterByLocation)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer border-0 transition-colors
                  ${filterByLocation 
                    ? "bg-zinc-900 text-white" 
                    : "bg-zinc-200 text-zinc-600 hover:bg-zinc-300/40"
                  }
                `}
              >
                {filterByLocation ? "Nearby Only" : "Show All"}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  activeFilter === f
                    ? "bg-zinc-900 text-white"
                    : "bg-white text-zinc-500 border border-zinc-200 hover:text-zinc-900 hover:border-zinc-400"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Business Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-52 rounded-xl bg-zinc-100 border border-zinc-200 animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((biz, i) => {
              const Icon = industryIcons[biz.industry_type] || Store;
              const colorClass = industryColors[biz.industry_type] || "text-zinc-500 bg-zinc-100";

              return (
                <motion.div
                  key={biz.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.06, duration: 0.4 }}
                >
                  <Link href={`/${biz.slug}`} className="group block h-full">
                    <div className="relative rounded-xl border border-zinc-200 bg-white p-5 hover:shadow-md hover:border-zinc-300 transition-all duration-200 h-full">
                      {/* Industry icon */}
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 capitalize">
                          {biz.industry_type?.replace("_", " ")}
                        </span>
                      </div>

                      {/* Name */}
                      <h3 className="text-base font-bold text-zinc-900 mb-1 group-hover:text-zinc-600 transition-colors">
                        {biz.name}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2 mb-4 font-medium">
                        {biz.description || "No description available."}
                      </p>

                      {/* Meta */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {biz.address && (
                            <span className="flex items-center gap-1 text-[11px] text-zinc-500 font-semibold">
                              <MapPin className="w-3 h-3" />
                              {biz.address.split(",")[0]}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-[11px] text-amber-500">
                            <Star className="w-3 h-3 fill-current" />
                            {biz.rating || "4.5"}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <Store className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
            <p className="text-sm text-zinc-400">
              {search ? "No businesses match your search." : "No businesses registered yet."}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
