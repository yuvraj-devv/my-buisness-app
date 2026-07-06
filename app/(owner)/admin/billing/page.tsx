"use client";

import { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getIndustryConfig } from "@/lib/industry-config";
import {
  Receipt,
  Plus,
  Minus,
  Trash2,
  Printer,
  Loader2,
  Search,
  Wallet,
  QrCode,
  CreditCard,
  User,
  Phone,
  CheckCircle,
  ArrowLeft,
  ShoppingBag,
} from "lucide-react";

type Service = {
  id: string;
  name: string;
  price: number;
  category: string;
};

type LineItem = {
  serviceId: string;
  name: string;
  price: number;
  qty: number;
};

type BusinessInfo = {
  id: string;
  name: string;
  industry_type: string;
  logo_url?: string | null;
};

export default function BillingPage() {
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMode, setPaymentMode] = useState<"cash" | "upi" | "card">("cash");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  const [loading, setLoading] = useState(true);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceNo, setInvoiceNo] = useState("");
  const [saving, setSaving] = useState(false);
  const taxRate = 0.18; // 18% GST

  useEffect(() => {
    async function fetchServices() {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) return;

      const { data: business } = await supabaseClient
        .from("businesses")
        .select("id, name, industry_type, logo_url")
        .eq("owner_id", user.id)
        .single();

      if (business) {
        setBusinessInfo(business);
        
        // Fetch services using the correct is_active column
        const { data } = await supabaseClient
          .from("services")
          .select("id, name, price, category")
          .eq("business_id", business.id)
          .eq("is_active", true)
          .order("name", { ascending: true });
          
        setServices(data || []);
      }
      setLoading(false);
    }
    fetchServices();
  }, []);

  // Set unique invoice number when opening invoice view
  useEffect(() => {
    if (showInvoice) {
      setInvoiceNo("INV-" + Math.floor(100000 + Math.random() * 900000));
    }
  }, [showInvoice]);

  function addLineItem(service: Service) {
    const existing = lineItems.find((li) => li.serviceId === service.id);
    if (existing) {
      setLineItems(lineItems.map((li) =>
        li.serviceId === service.id ? { ...li, qty: li.qty + 1 } : li
      ));
    } else {
      setLineItems([...lineItems, { serviceId: service.id, name: service.name, price: service.price, qty: 1 }]);
    }
  }

  function removeLineItem(serviceId: string) {
    setLineItems(lineItems.filter((li) => li.serviceId !== serviceId));
  }

  function updateQty(serviceId: string, qty: number) {
    if (qty < 1) return removeLineItem(serviceId);
    setLineItems(lineItems.map((li) =>
      li.serviceId === serviceId ? { ...li, qty } : li
    ));
  }

  function resetBilling() {
    setLineItems([]);
    setCustomerName("");
    setCustomerPhone("");
    setPaymentMode("cash");
    setShowInvoice(false);
    setSearchQuery("");
    setSelectedCategory("All");
  }

  async function generateBill() {
    if (!businessInfo) return;
    setSaving(true);

    const { error } = await supabaseClient
      .from("bookings")
      .insert({
        business_id: businessInfo.id,
        customer_name: customerName.trim() || "Walk-in Guest",
        customer_contact: `BILL|${paymentMode}|${total.toFixed(2)}|${customerPhone.trim()}|${JSON.stringify(lineItems)}`,
        booking_time: new Date().toISOString(),
        status: "completed",
      });

    if (error) {
      console.error("Error saving bill:", error.message);
    } else {
      setShowInvoice(true);
    }
    setSaving(false);
  }

  const subtotal = lineItems.reduce((sum, li) => sum + li.price * li.qty, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  // Extract unique categories for POS tabs
  const categories = ["All", ...Array.from(new Set(services.map(s => s.category || "General").filter(Boolean)))];

  // Filter services by search and selected category tab
  const filteredServices = services.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (service.category && service.category.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || (service.category || "General") === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const indConfig = businessInfo ? getIndustryConfig(businessInfo.industry_type) : null;
  const accentTextClass = indConfig?.accentText || "text-zinc-600";
  const accentBgClass = indConfig?.accentBg || "bg-zinc-900";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 text-zinc-400 animate-spin" />
      </div>
    );
  }

  // Invoice View
  if (showInvoice) {
    return (
      <div className="max-w-md mx-auto space-y-6 animate-scale-in">
        {/* Custom Print Style to print ONLY the receipt card */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page {
              margin: 0; /* Removes default browser headers (Date, Title) and footers (URL, Page No.) */
            }
            body {
              background: white !important;
              color: black !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            /* Hide everything on the page */
            body * {
              visibility: hidden !important;
            }
            /* Make only the invoice container and its contents visible */
            #invoice-print, #invoice-print * {
              visibility: visible !important;
            }
            /* Position and center the invoice container perfectly on the page */
            #invoice-print {
              position: absolute !important;
              left: 50% !important;
              top: 50px !important;
              transform: translateX(-50%) !important;
              width: 380px !important;
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
              margin: 0 !important;
            }
          }
        `}} />

        <div id="invoice-print" className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 space-y-6 text-zinc-800 font-mono text-sm relative">
          
          {/* Header */}
          <div className="text-center border-b border-dashed border-zinc-200 pb-4 space-y-1">
            {businessInfo?.logo_url && (
              <img src={businessInfo.logo_url} alt="Logo" className="w-12 h-12 rounded-lg mx-auto object-cover mb-1 border border-zinc-100" />
            )}
            <h2 className="text-base font-bold text-zinc-950 uppercase tracking-wide">
              {businessInfo?.name || "TEN ELEVEN CAFE"}
            </h2>
            <p className="text-xs text-zinc-500">Invoice: {invoiceNo}</p>
            <p className="text-xs text-zinc-500">{new Date().toLocaleString()}</p>
          </div>

          {/* Customer info */}
          <div className="space-y-1 text-xs border-b border-dashed border-zinc-200 pb-3">
            <p><span className="text-zinc-400">Customer:</span> {customerName || "Walk-in Guest"}</p>
            {customerPhone && <p><span className="text-zinc-400">Contact:</span> {customerPhone}</p>}
            <p><span className="text-zinc-400">Payment:</span> <span className="font-bold uppercase">{paymentMode}</span></p>
          </div>

          {/* Items Table */}
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-100 text-zinc-400">
                <th className="text-left py-1.5 font-medium">ITEM</th>
                <th className="text-center py-1.5 font-medium">QTY</th>
                <th className="text-right py-1.5 font-medium">PRICE</th>
                <th className="text-right py-1.5 font-medium">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((li) => (
                <tr key={li.serviceId} className="border-b border-zinc-50">
                  <td className="py-2 text-zinc-950 font-medium">{li.name}</td>
                  <td className="py-2 text-center">{li.qty}</td>
                  <td className="py-2 text-right">₹{li.price.toFixed(2)}</td>
                  <td className="py-2 text-right font-semibold">₹{(li.price * li.qty).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Calculation */}
          <div className="border-t border-dashed border-zinc-200 pt-3 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-500">Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">GST (18%)</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-2 border-t border-dashed border-zinc-200 text-zinc-950">
              <span>Grand Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-dashed border-zinc-200 text-[10px] text-zinc-400 space-y-1">
            <p>Thank you for visiting us!</p>
            <p>Powered by BizPlatform</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={() => window.print()} 
            className="bg-white border border-zinc-200 text-zinc-800 hover:bg-zinc-50 font-semibold"
          >
            <Printer className="w-4 h-4 mr-1.5" /> Print Receipt
          </Button>
          <Button 
            onClick={resetBilling} 
            className={`${accentBgClass} text-white hover:opacity-90 font-semibold`}
          >
            <CheckCircle className="w-4 h-4 mr-1.5" /> Done (New Bill)
          </Button>
        </div>
        <button 
          onClick={() => setShowInvoice(false)} 
          className="w-full flex items-center justify-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Edit Bill Items
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="space-y-1 animate-fade-in-up">
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Billing & Invoicing</h1>
        <p className="text-sm text-zinc-500">Create, calculate, and print bills for walk-in and active orders.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: POS Menu Picker (7/12 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-zinc-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-zinc-900">
              {indConfig?.servicesLabel || "Menu Items"}
            </h3>
            
            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                placeholder={`Search ${indConfig?.servicesLabel?.toLowerCase() || "items"}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 text-xs h-8 focus:border-zinc-400"
              />
            </div>
          </div>

          {/* Category Tabs */}
          {categories.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin border-b border-zinc-100">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? "bg-zinc-900 text-white"
                      : "bg-zinc-50 border border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Service Grid List */}
          {filteredServices.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
              <ShoppingBag className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
              <p className="text-sm text-zinc-400">No items match your search or filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
              {filteredServices.map((service) => (
                <button
                  key={service.id}
                  onClick={() => addLineItem(service)}
                  className="flex items-center justify-between p-3 rounded-xl border border-zinc-150 bg-white hover:border-zinc-300 hover:bg-zinc-50/50 transition-all text-left shadow-2xs group"
                >
                  <div className="space-y-0.5 pr-2">
                    <p className="text-xs font-semibold text-zinc-900 line-clamp-1 group-hover:text-black">
                      {service.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-400 font-medium">
                        {service.category}
                      </span>
                      <span className={`text-xs font-bold ${accentTextClass}`}>
                        ₹{service.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-zinc-50 flex items-center justify-center group-hover:bg-zinc-950 group-hover:text-white transition-colors flex-shrink-0">
                    <Plus className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Invoice Builder (5/12 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-zinc-200 shadow-xs p-5 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-900 border-b border-zinc-100 pb-2">
            Invoice Builder
          </h3>

          {/* Customer Details Form */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-500 flex items-center gap-1 uppercase tracking-wider">
                <User className="w-3 h-3" /> Guest Name
              </label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Name"
                className="bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 text-xs h-9 focus:border-zinc-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-500 flex items-center gap-1 uppercase tracking-wider">
                <Phone className="w-3 h-3" /> Contact No
              </label>
              <Input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Phone No"
                className="bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 text-xs h-9 focus:border-zinc-400"
              />
            </div>
          </div>

          {/* Payment Mode Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Payment Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "cash" as const, label: "Cash", icon: Wallet },
                { value: "upi" as const, label: "UPI", icon: QrCode },
                { value: "card" as const, label: "Card", icon: CreditCard },
              ].map((mode) => {
                const Icon = mode.icon;
                const isSelected = paymentMode === mode.value;
                return (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => setPaymentMode(mode.value)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-[11px] font-semibold transition-all ${
                      isSelected
                        ? "bg-zinc-950 border-zinc-950 text-white shadow-xs"
                        : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-1 ${isSelected ? "text-white" : "text-zinc-400"}`} />
                    {mode.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Line Items List */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
              Billing Items ({lineItems.length})
            </label>
            {lineItems.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-zinc-150 rounded-xl bg-zinc-50/50">
                <Receipt className="w-6 h-6 text-zinc-300 mx-auto mb-1.5" />
                <p className="text-xs text-zinc-400">Choose items from the left menu to add to bill.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                {lineItems.map((li) => (
                  <div 
                    key={li.serviceId} 
                    className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 border border-zinc-150 hover:bg-zinc-100/30 transition-colors shadow-3xs"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="text-xs font-semibold text-zinc-900 truncate">{li.name}</p>
                      <p className="text-[10px] text-zinc-400">₹{li.price.toFixed(2)} each</p>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Qty Decrement */}
                      <button 
                        onClick={() => updateQty(li.serviceId, li.qty - 1)} 
                        className="w-5 h-5 rounded-md bg-white border border-zinc-200 text-zinc-600 hover:text-black flex items-center justify-center text-xs font-bold hover:bg-zinc-50 shadow-3xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-zinc-900 w-5 text-center">{li.qty}</span>
                      {/* Qty Increment */}
                      <button 
                        onClick={() => updateQty(li.serviceId, li.qty + 1)} 
                        className="w-5 h-5 rounded-md bg-white border border-zinc-200 text-zinc-600 hover:text-black flex items-center justify-center text-xs font-bold hover:bg-zinc-50 shadow-3xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      {/* Delete */}
                      <button 
                        onClick={() => removeLineItem(li.serviceId)} 
                        className="ml-1 p-1 rounded-md text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pricing Totals & Print Button */}
          {lineItems.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-zinc-100">
              <div className="space-y-1.5 text-xs text-zinc-500 font-medium">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-zinc-800">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST Tax (18%)</span>
                  <span className="text-zinc-800">₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-zinc-900 pt-2.5 border-t border-dashed border-zinc-100">
                  <span>Grand Total</span>
                  <span className={`text-base font-extrabold ${accentTextClass}`}>₹{total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={generateBill}
                disabled={saving}
                className={`w-full ${accentBgClass} text-white hover:opacity-90 font-semibold h-10 mt-2`}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                ) : (
                  <Receipt className="w-4 h-4 mr-1.5" />
                )}
                Generate Bill & Print
              </Button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
