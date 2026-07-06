"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
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

const slots = generateTimeSlots();

export function BookingForm({ businessId, isHealthcare, isRestaurant, industryType }: BookingFormProps) {
  const [step, setStep] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [selectedTable, setSelectedTable] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => {
    const defaultDate = new Date();
    if (!isRestaurant) {
      defaultDate.setDate(defaultDate.getDate() + 1);
    }
    return defaultDate.toISOString().split("T")[0];
  });
  const [selectedSlot, setSelectedSlot] = useState(slots[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const config = getIndustryConfig(industryType || (isHealthcare ? "healthcare" : isRestaurant ? "restaurant" : "service"));
  const accentBg = config.accentBg || "bg-zinc-900";
  const accentText = config.accentText || "text-zinc-900";
  const accentBorder = config.accentBorder || "border-zinc-200";

  async function handleSubmit() {
    setError("");
    setIsSubmitting(true);

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
          <select
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm text-zinc-900 focus:outline-none focus:border-zinc-400 cursor-pointer dark:bg-white dark:text-zinc-900 dark:border-zinc-300"
            required
          >
            <option value="" disabled>Select Table Number (sitting at)</option>
            {Array.from({ length: 21 }, (_, index) => 100 + index).map((num) => (
              <option key={num} value={num}>
                Table {num}
              </option>
            ))}
          </select>
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
        {slots.map((time) => (
          <button
            key={time}
            onClick={() => setSelectedSlot(time)}
            className={`px-2 py-1.5 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
              selectedSlot === time
                ? `${accentBg} text-white border-transparent`
                : "border-zinc-200 bg-white text-zinc-500 hover:text-zinc-950 hover:border-zinc-350"
            }`}
          >
            {time}
          </button>
        ))}
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
