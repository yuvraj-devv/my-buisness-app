"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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

  useEffect(() => {
    async function load() {
      const { data } = await supabaseClient
        .from("businesses")
        .select("*")
        .order("created_at", { ascending: false });

      setBusinesses(data || []);
      setLoading(false);

      // Load authenticated user & profile details
      const { data: { user: authUser } } = await supabaseClient.auth.getUser();
      if (authUser) {
        setUser(authUser);
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

  const filtered = businesses.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.description?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      activeFilter === "All" ||
      b.industry_type?.toLowerCase().replace("_", " ") === activeFilter.toLowerCase();
    return matchesSearch && matchesFilter;
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
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search businesses..."
              className="pl-10 bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400"
            />
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
                      <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 mb-4">
                        {biz.description || "No description available."}
                      </p>

                      {/* Meta */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {biz.address && (
                            <span className="flex items-center gap-1 text-[11px] text-zinc-400">
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
