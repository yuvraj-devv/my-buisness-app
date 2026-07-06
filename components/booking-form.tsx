"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, ChevronLeft, ChevronRight, Loader2, ChevronDown } from "lucide-react";
import { getIndustryConfig } from "@/lib/industry-config";

type BookingFormProps = {
  businessId: string;
  isHealthcare: boolean;
  isRestaurant?: boolean;
  industryType?: string;
};

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

function generateRestaurantSlots(): string[] {
  return [
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "08:00 PM",
    "08:30 PM",
    "09:00 PM",
    "09:30 PM",
    "10:00 PM"
  ];
}

const slots = generateTimeSlots();
const restaurantSlots = generateRestaurantSlots();

export function BookingForm({ businessId, isHealthcare, isRestaurant, industryType }: BookingFormProps) {
  const [step, setStep] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [selectedTable, setSelectedTable] = useState("");
  const [tableDropdownOpen, setTableDropdownOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const defaultDate = new Date();
    if (!isRestaurant) {
      defaultDate.setDate(defaultDate.getDate() + 1);
    }
    return defaultDate.toISOString().split("T")[0];
  });
  const [selectedSlot, setSelectedSlot] = useState(() => {
    return isRestaurant ? restaurantSlots[0] : slots[0];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [activeBookings, setActiveBookings] = useState<any[]>([]);

  useEffect(() => {
    if (!businessId) return;

    async function loadActiveBookings() {
      const { data } = await supabaseClient
        .from("bookings")
        .select("customer_contact, booking_time")
        .eq("business_id", businessId)
        .eq("status", "confirmed");

      setActiveBookings(data || []);
    }

    loadActiveBookings();
    
    // Poll every 8 seconds to ensure near real-time updates
    const interval = setInterval(loadActiveBookings, 8000);
    return () => clearInterval(interval);
  }, [businessId]);

  const isTableBooked = (tableNum: number) => {
    return activeBookings.some((b) => {
      const match = b.customer_contact?.match(/\|\s*Table\s*(\d+)/);
      return match && Number(match[1]) === tableNum;
    });
  };

  const isSlotBooked = (slotTime: string) => {
    try {
      const targetTimeISO = slotToBookingTime(slotTime, selectedDate);
      const targetTimeMs = new Date(targetTimeISO).getTime();
      return activeBookings.some((b) => {
        return new Date(b.booking_time).getTime() === targetTimeMs;
      });
    } catch (e) {
      return false;
    }
  };

  // Automatically update active slot selection if selectedDate changes and slot is booked
  useEffect(() => {
    const activeSlots = isRestaurant ? restaurantSlots : slots;
    const isCurrentSlotBooked = isSlotBooked(selectedSlot);
    if (isCurrentSlotBooked) {
      const available = activeSlots.find((s) => !isSlotBooked(s));
      if (available) {
        setSelectedSlot(available);
      }
    }
  }, [selectedDate, activeBookings, isRestaurant, selectedSlot]);

  const config = getIndustryConfig(industryType || (isHealthcare ? "healthcare" : isRestaurant ? "restaurant" : "service"));
  const accentBg = config.accentBg || "bg-zinc-900";
  const accentText = config.accentText || "text-zinc-900";
  const accentBorder = config.accentBorder || "border-zinc-200";

  async function handleSubmit() {
    setError("");
    setIsSubmitting(true);

    // Concurrency check before sending insert query
    if (isRestaurant && selectedTable) {
      if (isTableBooked(Number(selectedTable))) {
        setError(`Table ${selectedTable} has just been reserved by another customer.`);
        setIsSubmitting(false);
        return;
      }
    } else if (!isRestaurant) {
      if (isSlotBooked(selectedSlot)) {
        setError(`The ${selectedSlot} slot has just been booked by another customer.`);
        setIsSubmitting(false);
        return;
      }
    }

    const contactString = isRestaurant && selectedTable
      ? `${customerContact.trim()} | Table ${selectedTable}`
      : customerContact.trim();

    const { error: insertError } = await supabaseClient.from("bookings").insert({
      business_id: businessId,
      customer_name: customerName.trim(),
      customer_contact: contactString,
      booking_time: slotToBookingTime(selectedSlot, selectedDate),
      status: "confirmed",
    });

    setIsSubmitting(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8 space-y-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
        >
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
        </motion.div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-zinc-900">Booking Confirmed!</h3>
          <p className="text-xs text-zinc-400">
            {selectedDate} at {selectedSlot}
          </p>
        </div>
        <Button
          onClick={() => {
            setSuccess(false);
            setStep(0);
            setCustomerName("");
            setCustomerContact("");
          }}
          variant="outline"
          className="border-zinc-200 text-zinc-500 text-xs hover:bg-zinc-50 cursor-pointer"
        >
          Book Another
        </Button>
      </motion.div>
    );
  }

  const steps = [
    // Step 0: Personal info
    <motion.div
      key="info"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      className="space-y-4"
    >
      <p className="text-xs font-semibold text-zinc-450 uppercase tracking-wider">
        Your Details
      </p>
      <div className="space-y-3">
        <Input
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Full Name"
          className="bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400 dark:bg-white dark:text-zinc-900 dark:border-zinc-300 dark:placeholder:text-zinc-400 focus:bg-white focus:text-zinc-900 focus:outline-none h-9 text-sm"
        />
        <Input
          value={customerContact}
          onChange={(e) => setCustomerContact(e.target.value)}
          placeholder="Phone Number"
          className="bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400 dark:bg-white dark:text-zinc-900 dark:border-zinc-300 dark:placeholder:text-zinc-400 focus:bg-white focus:text-zinc-900 focus:outline-none h-9 text-sm"
        />
        {isRestaurant && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setTableDropdownOpen(!tableDropdownOpen)}
              className="flex h-9 w-full items-center justify-between rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 focus:outline-none focus:border-zinc-400 cursor-pointer dark:bg-white dark:text-zinc-900 dark:border-zinc-300 select-none"
            >
              <span className="truncate">
                {selectedTable ? `Table ${selectedTable}` : "Select Table Number (sitting at)"}
              </span>
              <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 flex-shrink-0 ${tableDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {tableDropdownOpen && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-30 bg-transparent" 
                    onClick={() => setTableDropdownOpen(false)} 
                  />
                  
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 right-0 z-40 mt-1 max-h-56 overflow-y-auto scrollbar-thin rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg"
                  >
                    {Array.from({ length: 21 }, (_, index) => 100 + index).map((num) => {
                      const booked = isTableBooked(num);
                      const isSelected = selectedTable === String(num);
                      return (
                        <button
                          key={num}
                          type="button"
                          disabled={booked}
                          onClick={() => {
                            setSelectedTable(String(num));
                            setTableDropdownOpen(false);
                          }}
                          className={`flex w-full items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left border-0 cursor-pointer select-none
                            ${isSelected 
                              ? `${accentBg} text-white` 
                              : booked 
                              ? "text-zinc-300 bg-zinc-50 cursor-not-allowed" 
                              : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
                            }
                          `}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : booked ? "bg-zinc-200" : "bg-emerald-500"}`} />
                            <span>Table {num}</span>
                          </div>
                          {booked && (
                            <span className="text-[9px] font-bold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">
                              Occupied
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>,

    // Step 1: Date
    <motion.div
      key="date"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      className="space-y-4"
    >
      <p className="text-xs font-semibold text-zinc-450 uppercase tracking-wider">
        Choose Date
      </p>
      <Input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        min={new Date().toISOString().split("T")[0]}
        className="bg-white border-zinc-300 text-zinc-900 cursor-pointer dark:bg-white dark:text-zinc-900 dark:border-zinc-300 h-9 text-sm"
      />
    </motion.div>,

    // Step 2: Time slot
    <motion.div
      key="time"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      className="space-y-4"
    >
      <p className="text-xs font-semibold text-zinc-450 uppercase tracking-wider">
        Choose Time
      </p>
      <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto scrollbar-thin pr-1">
        {(isRestaurant ? restaurantSlots : slots).map((time) => {
          const booked = isSlotBooked(time);
          return (
            <button
              key={time}
              type="button"
              disabled={booked}
              onClick={() => setSelectedSlot(time)}
              className={`px-2 py-1.5 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                selectedSlot === time
                  ? `${accentBg} text-white border-transparent`
                  : booked
                  ? "border-zinc-100 bg-zinc-100 text-zinc-350 cursor-not-allowed opacity-50"
                  : "border-zinc-200 bg-white text-zinc-500 hover:text-zinc-950 hover:border-zinc-350"
              }`}
            >
              {time} {booked ? " (Full)" : ""}
            </button>
          );
        })}
      </div>
    </motion.div>,
  ];

  const canNext =
    (step === 0 && customerName.trim() && customerContact.trim() && (!isRestaurant || selectedTable)) ||
    (step === 1 && selectedDate) ||
    (step === 2 && selectedSlot);

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              s <= step ? accentBg : "bg-zinc-200"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">{steps[step]}</AnimatePresence>

      {error && (
        <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700 transition-colors disabled:opacity-30 cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Back
        </button>

        {step < 2 ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={!canNext}
            size="sm"
            className={`${accentBg} text-white hover:opacity-95 transition-opacity font-semibold text-xs cursor-pointer`}
          >
            Next
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!canNext || isSubmitting}
            size="sm"
            className={`${accentBg} text-white hover:opacity-95 transition-opacity font-semibold text-xs cursor-pointer`}
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              `Confirm ${isHealthcare ? "Appointment" : "Reservation"}`
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
