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
      <div className="space-y-3">
        <AnimatePresence>
          {services.length > 0 ? (
            services.map((service, i) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 hover:shadow-sm transition-all group shadow-xs"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center">
                    <Package className="w-5 h-5 text-zinc-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-900">
                      {service.name}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {service.description || "No description"}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">
                        {service.category}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-zinc-500">
                        ₹{service.price?.toFixed(2)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-zinc-500">
                        <Clock className="w-3 h-3" />
                        {service.duration_minutes}min
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteService(service.id)}
                  className="opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-red-500 transition-all p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-16 border border-dashed border-zinc-200 rounded-xl bg-zinc-50">
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
