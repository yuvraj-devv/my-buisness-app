"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabaseClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Building2,
  MapPin,
  Stethoscope,
  UtensilsCrossed,
  GraduationCap,
  Hotel,
  ShoppingBag,
  Building,
  Factory,
  Tractor,
  Wrench,
  Loader2,
  ArrowRight,
} from "lucide-react";

const industries = [
  { value: "healthcare", label: "Healthcare", icon: Stethoscope },
  { value: "restaurant", label: "Restaurant", icon: UtensilsCrossed },
  { value: "cafe", label: "Cafe", icon: UtensilsCrossed },
  { value: "education", label: "Education", icon: GraduationCap },
  { value: "hospitality", label: "Hospitality", icon: Hotel },
  { value: "retail", label: "Retail", icon: ShoppingBag },
  { value: "real_estate", label: "Real Estate", icon: Building },
  { value: "manufacturing", label: "Manufacturing", icon: Factory },
  { value: "agriculture", label: "Agriculture", icon: Tractor },
  { value: "service", label: "Service Business", icon: Wrench },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [location, setLocation] = useState("");
  const [industry, setIndustry] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function slugify(text: string) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!businessName.trim() || !location.trim() || !industry) {
      setError("Please fill out all fields.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();

      if (!user) {
        setError("User not authenticated. Please log in.");
        setLoading(false);
        return;
      }

      const slug = slugify(businessName);

      const { error: insertError } = await supabaseClient
        .from("businesses")
        .insert({
          name: businessName.trim(),
          slug,
          industry_type: industry,
          address: location.trim(),
          owner_id: user.id,
        });

      if (insertError) {
        if (insertError.message.includes("unique")) {
          setError("A business with this name already exists. Please choose a different name.");
        } else {
          setError(insertError.message);
        }
        setLoading(false);
        return;
      }

      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm space-y-6"
      >
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center mx-auto shadow-sm">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-800">Set Up Your Business</h1>
          <p className="text-sm text-zinc-500">Provide details to customize your workspace.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Business Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-600">Business Name</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. City Cafe"
                className="pl-10 bg-white border-zinc-200 text-zinc-800 placeholder:text-zinc-400 focus:border-zinc-400"
                required
              />
            </div>
            {businessName && (
              <p className="text-[10px] text-zinc-400">
                Your URL will be: <span className="font-mono text-zinc-600">/{slugify(businessName)}</span>
              </p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-600">Physical Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. 123 Main St, New York"
                className="pl-10 bg-white border-zinc-200 text-zinc-800 placeholder:text-zinc-400 focus:border-zinc-400"
                required
              />
            </div>
          </div>

          {/* Industry Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-600">Industry</label>
            <div className="relative">
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm text-zinc-800 focus:outline-none focus:border-zinc-400 cursor-pointer"
                required
              >
                <option value="" disabled>Select your industry</option>
                {industries.map((ind) => (
                  <option key={ind.value} value={ind.value}>
                    {ind.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading || !businessName.trim() || !location.trim() || !industry}
            className="w-full bg-zinc-900 text-white hover:bg-zinc-800 font-semibold"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
            ) : (
              <>
                Complete Onboarding
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </>
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
