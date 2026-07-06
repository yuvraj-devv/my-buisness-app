"use client";

import { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Loader2, 
  Save, 
  CheckCircle, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  FileText,
  QrCode 
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

type Business = {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  industry_type: string;
  logo_url?: string | null;
};

export default function SettingsPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [storefrontUrl, setStorefrontUrl] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) return;

      const { data } = await supabaseClient
        .from("businesses")
        .select("*")
        .eq("owner_id", user.id)
        .single();

      if (data) {
        setBusiness(data);
        setName(data.name || "");
        setDescription(data.description || "");
        setAddress(data.address || "");
        setPhone(data.phone || "");
        setEmail(data.email || "");
        setLogoUrl(data.logo_url || "");
        setStorefrontUrl(`${window.location.origin}/${data.slug}`);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave() {
    if (!business) return;
    setSaving(true);
    setSaved(false);

    await supabaseClient
      .from("businesses")
      .update({
        name: name.trim(),
        description: description.trim(),
        address: address.trim(),
        phone: phone.trim(),
        email: email.trim(),
        logo_url: logoUrl.trim() || null,
      })
      .eq("id", business.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const handlePrintFlyer = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-zinc-400 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="max-w-2xl mx-auto space-y-8 print:hidden">
        <header className="space-y-1 animate-fade-in-up">
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Settings</h1>
          <p className="text-sm text-zinc-500">
            Update your business profile and contact information.
          </p>
        </header>

        {/* Form Settings */}
        <div className="space-y-5 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          {/* Business Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-600 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Business Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white border-zinc-200 text-zinc-900"
            />
          </div>

          {/* Logo / Profile Picture URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-600 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Logo / Profile Picture URL
            </label>
            <div className="flex items-center gap-3">
              {logoUrl && (
                <div className="w-10 h-10 rounded-lg border border-zinc-200 bg-zinc-50 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  <img
                    src={logoUrl}
                    alt="Logo preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
              )}
              <Input
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="e.g. /ten-eleven-logo.png or https://example.com/logo.png"
                className="bg-white border-zinc-200 text-zinc-900 flex-1"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-600 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="flex w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 resize-none"
              placeholder="Describe your business..."
            />
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-600 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Address
            </label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="bg-white border-zinc-200 text-zinc-900"
              placeholder="123 Main St, City, State"
            />
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-600 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Phone
              </label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-white border-zinc-200 text-zinc-900"
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-600 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Email
              </label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white border-zinc-200 text-zinc-900"
                placeholder="contact@business.com"
              />
            </div>
          </div>

          {/* Slug (read-only) */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-500">
              Storefront URL (read-only)
            </label>
            <p className="text-sm text-zinc-500 bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2">
              /{business?.slug}
            </p>
          </div>

          {/* Industry (read-only) */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-500">
              Industry
            </label>
            <p className="text-sm text-zinc-500 bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2 capitalize">
              {business?.industry_type?.replace("_", " ")}
            </p>
          </div>

          {/* Save */}
          <div className="flex items-center gap-3 pt-1 border-t border-zinc-100">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-zinc-900 text-white hover:bg-zinc-800 font-semibold"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
              ) : (
                <Save className="w-4 h-4 mr-1.5" />
              )}
              Save Changes
            </Button>
            {saved && (
              <span className="flex items-center gap-1 text-xs text-emerald-600">
                <CheckCircle className="w-3.5 h-3.5" /> Saved successfully
              </span>
            )}
          </div>
        </div>

        {/* Marketing QR Toolkit Section */}
        {business && (
          <div className="space-y-5 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm animate-fade-in-up">
            <header className="space-y-1">
              <h2 className="text-lg font-bold text-zinc-900 tracking-tight flex items-center gap-2">
                <QrCode className="w-5 h-5 text-zinc-500" />
                Marketing & QR Code Flyer
              </h2>
              <p className="text-xs text-zinc-500">
                Generate and print a customized booking flyer to place at your storefront.
              </p>
            </header>

            <div className="flex flex-col md:flex-row items-center gap-6 p-5 rounded-xl bg-zinc-50 border border-zinc-200">
              <div className="p-4 bg-white rounded-xl border border-zinc-250/60 shadow-xs flex-shrink-0">
                <QRCodeSVG
                  value={storefrontUrl}
                  size={130}
                  level="H"
                  bgColor="#ffffff"
                  fgColor="#18181b"
                />
              </div>
              <div className="space-y-3 flex-1 text-center md:text-left">
                <h3 className="text-sm font-semibold text-zinc-900">Storefront QR Code</h3>
                <p className="text-xs text-zinc-500 leading-relaxed max-w-sm">
                  Place this flyer in your store windows or tables. Customers can scan it to instantly open your mobile-optimized menu, services, and booking interface.
                </p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-1">
                  <Button
                    onClick={handlePrintFlyer}
                    className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs px-4 py-2 rounded-full flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    Print Flyer
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden Printable Flyer Template */}
      {business && (
        <div className="hidden print:flex fixed inset-0 bg-white z-[9999] flex-col items-center justify-between text-center p-16 font-sans h-screen">
          <div className="max-w-xl w-full border-[6px] border-zinc-950 rounded-[2.5rem] p-12 flex flex-col items-center justify-between h-[90vh] my-auto">
            
            {/* Header */}
            <div className="space-y-4">
              <h1 className="text-4xl font-black text-zinc-950 uppercase tracking-widest leading-none">
                {business.industry_type === "restaurant" || business.industry_type === "cafe"
                  ? "Scan to Dine & Order"
                  : "Scan to Book Now"}
              </h1>
              <p className="text-base text-zinc-500 font-semibold tracking-wide">
                Fast, automated scheduling in under a minute
              </p>
            </div>

            {/* QR Code */}
            <div className="my-8 p-8 bg-white border-[3px] border-zinc-950 rounded-[2rem] shadow-md flex items-center justify-center">
              <QRCodeSVG
                value={storefrontUrl}
                size={260}
                level="H"
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>

            {/* Business Brand Details */}
            <div className="space-y-4">
              {logoUrl && (
                <img
                  src={logoUrl}
                  alt={name}
                  className="w-16 h-16 object-cover rounded-2xl mx-auto border-2 border-zinc-900 shadow-sm"
                />
              )}
              <h2 className="text-3xl font-black text-zinc-950 tracking-tight">{name}</h2>
              {address && (
                <p className="text-sm text-zinc-500 font-medium max-w-sm mx-auto flex items-center justify-center gap-1.5">
                  <MapPin className="w-4 h-4 text-zinc-800 flex-shrink-0" /> {address}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="pt-6 border-t-2 border-zinc-950 w-full">
              <p className="text-[11px] font-black text-zinc-950 uppercase tracking-[0.25em]">
                Powered by BizPlatform.com
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
