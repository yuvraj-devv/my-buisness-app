"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseClient } from "@/lib/supabase-client";
import { getIndustryConfig } from "@/lib/industry-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Trash2,
  X,
  Check,
  Loader2,
  Package,
  Clock,
} from "lucide-react";

type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  category: string;
  is_active: boolean;
};

function getServiceImage(name: string, category: string) {
  const n = name.toLowerCase();
  const cat = category.toLowerCase();

  // Food / Restaurant
  if (n.includes("burger") || cat.includes("burger")) {
    return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80";
  }
  if (n.includes("pizza") || cat.includes("pizza")) {
    return "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=80";
  }
  if (n.includes("sandwich") || cat.includes("sandwich")) {
    return "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&auto=format&fit=crop&q=80";
  }
  if (n.includes("coffee") || n.includes("tea") || n.includes("cafe") || cat.includes("beverage")) {
    return "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&auto=format&fit=crop&q=80";
  }
  if (n.includes("pasta") || cat.includes("pasta")) {
    return "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80";
  }
  if (n.includes("fries") || cat.includes("fries") || n.includes("potato")) {
    return "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&auto=format&fit=crop&q=80";
  }

  // Healthcare / Medical
  if (cat.includes("health") || cat.includes("medical") || n.includes("checkup") || n.includes("consult")) {
    return "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&auto=format&fit=crop&q=80";
  }

  // Gym / Fitness
  if (cat.includes("fitness") || cat.includes("gym") || n.includes("train") || n.includes("workout")) {
    return "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80";
  }

  // Salon / Beauty
  if (cat.includes("salon") || cat.includes("spa") || n.includes("hair") || n.includes("massage")) {
    return "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&auto=format&fit=crop&q=80";
  }

  // Default clean placeholder
  return "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400&auto=format&fit=crop&q=80";
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [industryLabel, setIndustryLabel] = useState("Services");

  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formDuration, setFormDuration] = useState("30");
  const [formCategory, setFormCategory] = useState("General");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) return;

      const { data: business } = await supabaseClient
        .from("businesses")
        .select("id, industry_type")
        .eq("owner_id", user.id)
        .single();

      if (!business) return;
      setBusinessId(business.id);

      const config = getIndustryConfig(business.industry_type);
      setIndustryLabel(config.servicesLabel);

      const { data } = await supabaseClient
        .from("services")
        .select("*")
        .eq("business_id", business.id)
        .order("created_at", { ascending: true });

      setServices(data || []);
      setLoading(false);
    }
    load();
  }, []);

  async function addService() {
    if (!businessId || !formName.trim()) return;
    setSaving(true);

    const { data, error } = await supabaseClient
      .from("services")
      .insert({
        business_id: businessId,
        name: formName.trim(),
        description: formDesc.trim(),
        price: parseFloat(formPrice) || 0,
        duration_minutes: parseInt(formDuration) || 30,
        category: formCategory.trim() || "General",
      })
      .select()
      .single();

    if (!error && data) {
      setServices((prev) => [...prev, data]);
      resetForm();
    }
    setSaving(false);
  }

  async function deleteService(id: string) {
    await supabaseClient.from("services").delete().eq("id", id);
    setServices((prev) => prev.filter((s) => s.id !== id));
  }

  function resetForm() {
    setShowForm(false);
    setFormName("");
    setFormDesc("");
    setFormPrice("");
    setFormDuration("30");
    setFormCategory("General");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-zinc-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="flex items-center justify-between animate-fade-in-up">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
            {industryLabel}
          </h1>
          <p className="text-sm text-zinc-500">
            Manage your offerings — customers will see these on your storefront.
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-zinc-900 text-white hover:bg-zinc-800 font-semibold"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add {industryLabel.endsWith("s") ? industryLabel.slice(0, -1) : industryLabel}
        </Button>
      </header>

      {/* Add Service Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-900">
                  New {industryLabel.endsWith("s") ? industryLabel.slice(0, -1) : industryLabel}
                </h3>
                <button onClick={resetForm} className="text-zinc-400 hover:text-zinc-700 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Name"
                  className="bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400"
                />
                <Input
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  placeholder="Category (e.g. Consultation)"
                  className="bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400"
                />
                <Input
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  placeholder="Price (₹)"
                  type="number"
                  className="bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400"
                />
                <Input
                  value={formDuration}
                  onChange={(e) => setFormDuration(e.target.value)}
                  placeholder="Duration (minutes)"
                  type="number"
                  className="bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400"
                />
              </div>
              <Input
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Short description..."
                className="bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400"
              />
              <div className="flex justify-end">
                <Button
                  onClick={addService}
                  disabled={!formName.trim() || saving}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white font-semibold"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-1.5" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Services List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {services.length > 0 ? (
            services.map((service, i) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
                className="relative flex gap-4 rounded-xl border border-zinc-200 bg-white p-3 hover:shadow-md hover:border-zinc-300 transition-all duration-200 group"
              >
                {/* Picture */}
                <img
                  src={getServiceImage(service.name, service.category)}
                  alt={service.name}
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0 bg-zinc-50 border border-zinc-100"
                />

                {/* Info Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-zinc-900 truncate">
                        {service.name}
                      </h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-650 flex-shrink-0 capitalize border border-zinc-200/50">
                        {service.category}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                      {service.description || "No description available."}
                    </p>
                  </div>

                  {/* Footer: Price + Duration */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100/60">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-zinc-800">
                        ₹{service.price?.toFixed(2)}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-medium text-zinc-400">
                        <Clock className="w-3.5 h-3.5" />
                        {service.duration_minutes}m
                      </span>
                    </div>

                    {/* Delete Button (visible on hover) */}
                    <button
                      onClick={() => deleteService(service.id)}
                      className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-all p-1 hover:bg-red-50 rounded-lg cursor-pointer flex items-center justify-center border-0"
                      title="Delete offering"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-16 border border-dashed border-zinc-200 rounded-xl bg-zinc-50 col-span-full">
              <Package className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
              <p className="text-sm text-zinc-400">
                No {industryLabel.toLowerCase()} yet. Add your first one above.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
