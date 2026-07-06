import { supabase } from "@/lib/supabase";
import { getIndustryConfig } from "@/lib/industry-config";
import { BookingForm } from "@/components/booking-form";
import { ChatWidget } from "@/components/chatbot/chat-widget";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Star,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  category: string;
};

type ThemeConfig = {
  bgGradient: string;
  heroBg: string;
  cardBg: string;
  borderClass: string;
  badgeClass: string;
  buttonClass: string;
  containerClass: string;
};

const themes: Record<string, ThemeConfig> = {
  healthcare: {
    bgGradient: "bg-gradient-to-tr from-emerald-50/20 via-white to-teal-50/10",
    heroBg: "bg-gradient-to-br from-emerald-50/40 via-teal-50/20 to-white border-b border-emerald-100/50",
    cardBg: "bg-white/80 backdrop-blur-md",
    borderClass: "border-emerald-100/70 hover:border-emerald-300 hover:shadow-xs",
    badgeClass: "bg-emerald-50 text-emerald-700 border border-emerald-200/50",
    buttonClass: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100",
    containerClass: "text-zinc-950"
  },
  restaurant: {
    bgGradient: "bg-gradient-to-tr from-amber-50/20 via-white to-orange-50/10",
    heroBg: "bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-white border-b border-amber-100/50",
    cardBg: "bg-white/80 backdrop-blur-md",
    borderClass: "border-amber-100 hover:border-amber-250 hover:shadow-xs",
    badgeClass: "bg-amber-50 text-amber-800 border border-amber-200/50",
    buttonClass: "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-100",
    containerClass: "text-zinc-950"
  },
  cafe: {
    bgGradient: "bg-gradient-to-tr from-orange-50/25 via-white to-amber-50/10",
    heroBg: "bg-gradient-to-br from-orange-50/30 via-amber-50/20 to-white border-b border-orange-100/50",
    cardBg: "bg-white/80 backdrop-blur-md",
    borderClass: "border-orange-100 hover:border-orange-250 hover:shadow-xs",
    badgeClass: "bg-orange-50 text-orange-850 border border-orange-200/50",
    buttonClass: "bg-orange-600 hover:bg-orange-700 text-white shadow-orange-100",
    containerClass: "text-zinc-950"
  },
  education: {
    bgGradient: "bg-gradient-to-tr from-blue-50/15 via-white to-indigo-50/10",
    heroBg: "bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-white border-b border-blue-100/50",
    cardBg: "bg-white/80 backdrop-blur-md",
    borderClass: "border-blue-100 hover:border-blue-250 hover:shadow-xs",
    badgeClass: "bg-blue-50 text-blue-800 border border-blue-200/50",
    buttonClass: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100",
    containerClass: "text-zinc-950"
  },
  hospitality: {
    bgGradient: "bg-gradient-to-tr from-violet-50/15 via-white to-purple-50/10",
    heroBg: "bg-gradient-to-br from-violet-50/30 via-purple-50/25 to-white border-b border-violet-100/50",
    cardBg: "bg-white/80 backdrop-blur-md",
    borderClass: "border-violet-100 hover:border-violet-250 hover:shadow-xs",
    badgeClass: "bg-violet-50 text-violet-850 border border-violet-200/50",
    buttonClass: "bg-violet-600 hover:bg-violet-700 text-white shadow-violet-100",
    containerClass: "text-zinc-950"
  },
  service: {
    bgGradient: "bg-gradient-to-tr from-zinc-50 via-white to-zinc-100/30",
    heroBg: "bg-zinc-50/40 border-b border-zinc-150",
    cardBg: "bg-white",
    borderClass: "border-zinc-200 hover:border-zinc-300 hover:shadow-xs",
    badgeClass: "bg-zinc-100 text-zinc-800 border border-zinc-200/80",
    buttonClass: "bg-zinc-900 hover:bg-zinc-850 text-white",
    containerClass: "text-zinc-950"
  }
};

const getTheme = (industry: string | null | undefined): ThemeConfig => {
  const normalized = (industry || "").toLowerCase();
  if (normalized.includes("health")) return themes.healthcare;
  if (normalized.includes("restaurant")) return themes.restaurant;
  if (normalized.includes("cafe")) return themes.cafe;
  if (normalized.includes("education")) return themes.education;
  if (normalized.includes("hospital")) return themes.hospitality;
  return themes.service;
};

export default async function ConsumerStorefront({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!business) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-zinc-400 space-y-4">
        <h1 className="text-2xl font-bold text-zinc-900">Business not found.</h1>
        <Link
          href="/explore"
          className="text-sm text-zinc-500 hover:text-zinc-800 flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Explore
        </Link>
      </div>
    );
  }

  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("business_id", business.id)
    .eq("is_active", true)
    .order("category", { ascending: true });

  const allServices: Service[] = services || [];
  const config = getIndustryConfig(business.industry_type);
  const theme = getTheme(business.industry_type);
  const Icon = config.icon;

  // Group services by category
  const grouped = allServices.reduce(
    (acc, s) => {
      const cat = s.category || "General";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(s);
      return acc;
    },
    {} as Record<string, Service[]>
  );

  return (
    <div className={`min-h-screen ${theme.bgGradient} ${theme.containerClass} transition-colors duration-300 relative pb-16`}>
      {/* Dynamic top visual indicator bar */}
      <div className={`absolute top-0 left-0 w-full h-1.5 ${config.accentBg} opacity-85 z-20`} />

      {/* Hero Header */}
      <div className={`${theme.heroBg} relative transition-colors duration-300`}>
        <div className="max-w-5xl mx-auto px-6 py-14">
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-405 hover:text-zinc-700 transition-colors mb-8 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Explore
          </Link>

          <div className="flex items-start gap-5">
            {business.logo_url ? (
              <img
                src={business.logo_url}
                alt={business.name}
                className="w-16 h-16 rounded-2xl object-cover border border-zinc-200 shadow-xs flex-shrink-0"
              />
            ) : (
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${config.accentLight} shadow-2xs`}>
                <Icon className={`w-8 h-8 ${config.accentText}`} />
              </div>
            )}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950">
                  {business.name}
                </h1>
                <span className="flex items-center gap-1 text-sm font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 rounded-full px-2 py-0.5 shadow-2xs">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {business.rating || "4.5"}
                </span>
              </div>
              <p className="text-sm text-zinc-550 max-w-xl leading-relaxed font-medium">
                {business.description || "Welcome to our business storefront."}
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-1.5 text-xs text-zinc-450 font-semibold">
                {business.address && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-zinc-650" />
                    {business.address}
                  </span>
                )}
                {business.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-zinc-655" />
                    {business.phone}
                  </span>
                )}
                {business.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-zinc-655" />
                    {business.email}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Columns */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Services Section (2/3 cols) */}
          <div className="lg:col-span-2 space-y-8">
            <h2 className="text-lg font-black text-zinc-900 tracking-tight">
              {config.servicesLabel}
            </h2>

            {Object.keys(grouped).length > 0 ? (
              Object.entries(grouped).map(([category, items]) => (
                <div key={category} className="space-y-3.5">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    {category}
                  </h3>
                  <div className="space-y-2.5">
                    {items.map((service) => (
                      <div
                        key={service.id}
                        className={`flex items-center justify-between p-4 rounded-2xl border ${theme.cardBg} ${theme.borderClass} transition-all duration-200 shadow-3xs`}
                      >
                        <div className="space-y-1">
                          <h4 className="text-sm font-extrabold text-zinc-950">
                            {service.name}
                          </h4>
                          {service.description && (
                            <p className="text-xs text-zinc-500 max-w-md font-medium leading-normal">
                              {service.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-zinc-400 pt-0.5">
                            <span className="flex items-center gap-1 font-semibold">
                              <Clock className="w-3 h-3 text-zinc-500" />
                              {service.duration_minutes} min
                            </span>
                          </div>
                        </div>
                        <span className={`text-sm font-black tracking-tight ${config.accentText} bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-full px-3 py-1 shadow-2xs`}>
                          ₹{service.price?.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 border border-dashed border-zinc-200 rounded-2xl bg-zinc-50/40">
                <p className="text-sm text-zinc-400 font-medium">
                  No {config.servicesLabel.toLowerCase()} listed yet.
                </p>
              </div>
            )}
          </div>

          {/* Booking Widget Column (1/3 cols) */}
          <div className="space-y-4">
            <h2 className="text-lg font-black text-zinc-900 tracking-tight">
              Book {config.bookingTerm}
            </h2>
            <div className={`rounded-2xl border ${theme.cardBg} ${theme.borderClass} p-5 shadow-2xs transition-all duration-200`}>
              <BookingForm
                businessId={business.id}
                isHealthcare={business.industry_type === "healthcare"}
                isRestaurant={business.industry_type === "restaurant" || business.industry_type === "cafe"}
                industryType={business.industry_type}
              />
            </div>
          </div>
        </div>
      </div>

      {/* AI Chatbot */}
      <ChatWidget
        businessName={business.name}
        businessType={business.industry_type}
        businessSlug={business.slug}
        role="customer"
      />
    </div>
  );
}
