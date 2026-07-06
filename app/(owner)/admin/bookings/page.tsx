"use client";

import { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/supabase-client";
import { getIndustryConfig } from "@/lib/industry-config";
import { BookingsTable } from "@/components/admin/bookings-table";
import { Loader2 } from "lucide-react";

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
  industry_type: string;
};

export default function BookingsPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) return;

      const { data: biz } = await supabaseClient
        .from("businesses")
        .select("id, industry_type")
        .eq("owner_id", user.id)
        .single();

      if (biz) {
        setBusiness(biz);
        
        const { data: bgs } = await supabaseClient
          .from("bookings")
          .select("*")
          .eq("business_id", biz.id)
          .order("booking_time", { ascending: false });
          
        setBookings(bgs || []);
      }
      setLoading(false);
    }
    load();
  }, []);

  const config = business ? getIndustryConfig(business.industry_type) : null;
  const clientConfig = config ? { ...config, icon: undefined } : null;
  const serializableConfig = clientConfig as unknown as typeof config;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-zinc-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header className="space-y-1 animate-fade-in-up">
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
          {config?.bookingTermPlural || "Bookings"}
        </h1>
        <p className="text-sm text-zinc-500">
          Manage all {config?.bookingTermPlural.toLowerCase() || "bookings"} and {config?.customerTermPlural.toLowerCase() || "customers"}.
        </p>
      </header>

      {serializableConfig && (
        <BookingsTable
          bookings={bookings}
          setBookings={setBookings}
          industryConfig={serializableConfig}
        />
      )}
    </div>
  );
}
