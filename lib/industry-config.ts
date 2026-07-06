import {
  Stethoscope,
  UtensilsCrossed,
  GraduationCap,
  Hotel,
  ShoppingBag,
  Building2,
  Factory,
  Tractor,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export type IndustryKey =
  | "healthcare"
  | "restaurant"
  | "cafe"
  | "education"
  | "hospitality"
  | "retail"
  | "real_estate"
  | "manufacturing"
  | "agriculture"
  | "service";

export type IndustryConfig = {
  label: string;
  bookingTerm: string;
  bookingTermPlural: string;
  customerTerm: string;
  customerTermPlural: string;
  metrics: [string, string, string, string];
  accent: string;
  accentBg: string;
  accentText: string;
  accentBorder: string;
  accentLight: string;
  icon: LucideIcon;
  features: {
    qrCode: boolean;
    billing: boolean;
  };
  columnHeader: string;
  actionVerbs: {
    confirm: string;
    complete: string;
    cancel: string;
  };
  activityVerbs: {
    booked: string;
    confirmed: string;
    completed: string;
    cancelled: string;
  };
  servicesLabel: string;
};

export const industryConfig: Record<string, IndustryConfig> = {
  healthcare: {
    label: "Healthcare",
    bookingTerm: "Appointment",
    bookingTermPlural: "Appointments",
    customerTerm: "Patient",
    customerTermPlural: "Patients",
    metrics: ["Patients Today", "Upcoming Appointments", "Completed", "Total Patients"],
    accent: "emerald",
    accentBg: "bg-emerald-500",
    accentText: "text-emerald-600",
    accentBorder: "border-emerald-200",
    accentLight: "bg-emerald-50",
    icon: Stethoscope,
    features: { qrCode: false, billing: true },
    columnHeader: "Patient",
    actionVerbs: { confirm: "Confirm", complete: "Complete", cancel: "Cancel" },
    activityVerbs: { booked: "booked an appointment", confirmed: "appointment confirmed", completed: "consultation completed", cancelled: "appointment cancelled" },
    servicesLabel: "Services",
  },
  restaurant: {
    label: "Restaurant & Cafe",
    bookingTerm: "Reservation",
    bookingTermPlural: "Reservations",
    customerTerm: "Guest",
    customerTermPlural: "Guests",
    metrics: ["Revenue Today", "Active Tables", "New Guests", "Total Reservations"],
    accent: "amber",
    accentBg: "bg-amber-500",
    accentText: "text-amber-600",
    accentBorder: "border-amber-200",
    accentLight: "bg-amber-50",
    icon: UtensilsCrossed,
    features: { qrCode: true, billing: true },
    columnHeader: "Guest",
    actionVerbs: { confirm: "Confirm", complete: "Seat", cancel: "Cancel" },
    activityVerbs: { booked: "made a reservation", confirmed: "reservation confirmed", completed: "guest seated", cancelled: "reservation cancelled" },
    servicesLabel: "Menu Items",
  },
  cafe: {
    label: "Cafe",
    bookingTerm: "Reservation",
    bookingTermPlural: "Reservations",
    customerTerm: "Guest",
    customerTermPlural: "Guests",
    metrics: ["Revenue Today", "Active Tables", "New Guests", "Total Reservations"],
    accent: "orange",
    accentBg: "bg-orange-500",
    accentText: "text-orange-600",
    accentBorder: "border-orange-200",
    accentLight: "bg-orange-50",
    icon: UtensilsCrossed,
    features: { qrCode: true, billing: true },
    columnHeader: "Guest",
    actionVerbs: { confirm: "Confirm", complete: "Seat", cancel: "Cancel" },
    activityVerbs: { booked: "made a reservation", confirmed: "reservation confirmed", completed: "guest seated", cancelled: "reservation cancelled" },
    servicesLabel: "Menu Items",
  },
  education: {
    label: "Education",
    bookingTerm: "Session",
    bookingTermPlural: "Sessions",
    customerTerm: "Student",
    customerTermPlural: "Students",
    metrics: ["Enrolled Students", "Sessions Today", "Completed Sessions", "Total Enrollments"],
    accent: "blue",
    accentBg: "bg-blue-500",
    accentText: "text-blue-600",
    accentBorder: "border-blue-200",
    accentLight: "bg-blue-50",
    icon: GraduationCap,
    features: { qrCode: false, billing: true },
    columnHeader: "Student",
    actionVerbs: { confirm: "Confirm", complete: "Complete", cancel: "Cancel" },
    activityVerbs: { booked: "enrolled in a session", confirmed: "session confirmed", completed: "session completed", cancelled: "session cancelled" },
    servicesLabel: "Courses",
  },
  hospitality: {
    label: "Hospitality",
    bookingTerm: "Booking",
    bookingTermPlural: "Bookings",
    customerTerm: "Guest",
    customerTermPlural: "Guests",
    metrics: ["Rooms Occupied", "Check-ins Today", "Revenue Today", "Total Bookings"],
    accent: "violet",
    accentBg: "bg-violet-500",
    accentText: "text-violet-600",
    accentBorder: "border-violet-200",
    accentLight: "bg-violet-50",
    icon: Hotel,
    features: { qrCode: true, billing: true },
    columnHeader: "Guest",
    actionVerbs: { confirm: "Confirm", complete: "Check In", cancel: "Cancel" },
    activityVerbs: { booked: "made a booking", confirmed: "booking confirmed", completed: "checked in", cancelled: "booking cancelled" },
    servicesLabel: "Room Types",
  },
  retail: {
    label: "Retail & Local Business",
    bookingTerm: "Order",
    bookingTermPlural: "Orders",
    customerTerm: "Customer",
    customerTermPlural: "Customers",
    metrics: ["Revenue Today", "Orders Today", "New Customers", "Total Orders"],
    accent: "pink",
    accentBg: "bg-pink-500",
    accentText: "text-pink-600",
    accentBorder: "border-pink-200",
    accentLight: "bg-pink-50",
    icon: ShoppingBag,
    features: { qrCode: false, billing: true },
    columnHeader: "Customer",
    actionVerbs: { confirm: "Confirm", complete: "Fulfill", cancel: "Cancel" },
    activityVerbs: { booked: "placed an order", confirmed: "order confirmed", completed: "order fulfilled", cancelled: "order cancelled" },
    servicesLabel: "Products",
  },
  real_estate: {
    label: "Real Estate",
    bookingTerm: "Viewing",
    bookingTermPlural: "Viewings",
    customerTerm: "Client",
    customerTermPlural: "Clients",
    metrics: ["Active Listings", "Viewings Today", "Deals Closed", "Total Clients"],
    accent: "teal",
    accentBg: "bg-teal-500",
    accentText: "text-teal-600",
    accentBorder: "border-teal-200",
    accentLight: "bg-teal-50",
    icon: Building2,
    features: { qrCode: false, billing: true },
    columnHeader: "Client",
    actionVerbs: { confirm: "Confirm", complete: "Close", cancel: "Cancel" },
    activityVerbs: { booked: "scheduled a viewing", confirmed: "viewing confirmed", completed: "deal closed", cancelled: "viewing cancelled" },
    servicesLabel: "Listings",
  },
  manufacturing: {
    label: "Manufacturing",
    bookingTerm: "Order",
    bookingTermPlural: "Orders",
    customerTerm: "Client",
    customerTermPlural: "Clients",
    metrics: ["Production Output", "Pending Orders", "Dispatched Today", "Total Orders"],
    accent: "slate",
    accentBg: "bg-slate-500",
    accentText: "text-slate-600",
    accentBorder: "border-slate-200",
    accentLight: "bg-slate-50",
    icon: Factory,
    features: { qrCode: false, billing: true },
    columnHeader: "Client",
    actionVerbs: { confirm: "Confirm", complete: "Dispatch", cancel: "Cancel" },
    activityVerbs: { booked: "placed an order", confirmed: "order confirmed", completed: "order dispatched", cancelled: "order cancelled" },
    servicesLabel: "Products",
  },
  agriculture: {
    label: "Agriculture",
    bookingTerm: "Order",
    bookingTermPlural: "Orders",
    customerTerm: "Buyer",
    customerTermPlural: "Buyers",
    metrics: ["Harvest Output", "Active Orders", "Revenue Today", "Total Orders"],
    accent: "lime",
    accentBg: "bg-lime-600",
    accentText: "text-lime-700",
    accentBorder: "border-lime-200",
    accentLight: "bg-lime-50",
    icon: Tractor,
    features: { qrCode: false, billing: true },
    columnHeader: "Buyer",
    actionVerbs: { confirm: "Confirm", complete: "Deliver", cancel: "Cancel" },
    activityVerbs: { booked: "placed an order", confirmed: "order confirmed", completed: "order delivered", cancelled: "order cancelled" },
    servicesLabel: "Products",
  },
  service: {
    label: "Service Business",
    bookingTerm: "Appointment",
    bookingTermPlural: "Appointments",
    customerTerm: "Client",
    customerTermPlural: "Clients",
    metrics: ["Revenue Today", "Appointments Today", "Returning Clients", "Total Appointments"],
    accent: "cyan",
    accentBg: "bg-cyan-500",
    accentText: "text-cyan-600",
    accentBorder: "border-cyan-200",
    accentLight: "bg-cyan-50",
    icon: Wrench,
    features: { qrCode: false, billing: true },
    columnHeader: "Client",
    actionVerbs: { confirm: "Confirm", complete: "Complete", cancel: "Cancel" },
    activityVerbs: { booked: "booked an appointment", confirmed: "appointment confirmed", completed: "service completed", cancelled: "appointment cancelled" },
    servicesLabel: "Services",
  },
};

// Alias mapping: normalize industry_type values from the database
const aliases: Record<string, string> = {
  salon: "service",
  fitness: "service",
  cafe: "cafe",
  restaurant: "restaurant",
  hospitality: "hospitality",
  healthcare: "healthcare",
  education: "education",
  retail: "retail",
  real_estate: "real_estate",
  manufacturing: "manufacturing",
  agriculture: "agriculture",
  service: "service",
};

export function getIndustryConfig(industryType: string | null | undefined): IndustryConfig {
  const key = aliases[industryType || ""] || "service";
  return industryConfig[key] || industryConfig.service;
}
