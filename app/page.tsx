"use client";

import Link from "next/link";
import { motion } from "framer-motion";
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
  ArrowRight,
  CalendarCheck,
  BarChart3,
  Users,
  CheckCircle,
} from "lucide-react";
import { InteractiveSphereBackground } from "../components/interactive-sphere";
import { ThemeSwitcher } from "../components/theme-switcher";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } },
};

const industries = [
  { name: "Healthcare", icon: Stethoscope, desc: "Clinics, offices & medical practices" },
  { name: "Restaurants & Cafes", icon: UtensilsCrossed, desc: "Dining, reservations & menus" },
  { name: "Education", icon: GraduationCap, desc: "Schools, tutoring & platforms" },
  { name: "Hospitality", icon: Hotel, desc: "Hotels, resorts & travel services" },
  { name: "Retail", icon: ShoppingBag, desc: "Shops, stores & local business" },
  { name: "Real Estate", icon: Building2, desc: "Listings, viewings & management" },
  { name: "Manufacturing", icon: Factory, desc: "Production, orders & supply chain" },
  { name: "Agriculture", icon: Tractor, desc: "Farms, harvests & direct sales" },
  { name: "Service Businesses", icon: Wrench, desc: "Salons, fitness, repairs & more" },
];

const features = [
  {
    title: "Plan your schedules",
    desc: "Streamline customer subscriptions and billing with automated scheduling tools.",
    icon: CalendarCheck,
  },
  {
    title: "Analytics & insights",
    desc: "Transform your business data into actionable insights with real-time analytics.",
    icon: BarChart3,
  },
  {
    title: "Collaborate seamlessly",
    desc: "Keep your team aligned with shared dashboards and collaborative workflows.",
    icon: Users,
  },
];

const stats = [
  { value: "10,000+", label: "Businesses powered" },
  { value: "2M+", label: "Bookings processed" },
  { value: "99.9%", label: "Uptime guarantee" },
  { value: "4.9/5", label: "Customer rating" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-transparent text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      {/* Interactive 3D Particle Sphere Background */}
      <InteractiveSphereBackground />

      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-zinc-950/75 backdrop-blur-xl border-b border-zinc-200/50 dark:border-zinc-800/50 transition-colors duration-300"
      >
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white hover:opacity-80 transition-opacity cursor-pointer"
          >
            BizPlatform
          </a>
          <div className="hidden md:flex items-center gap-8 text-sm text-zinc-500 dark:text-zinc-400">
            <a href="#industries" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Industries</a>
            <a href="#features" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Features</a>
            <a href="#social-proof" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Proof</a>
          </div>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <Link
              href="/login"
              className="text-sm font-medium px-4 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 dark:text-zinc-300 dark:hover:text-white text-zinc-900 transition-all"
            >
              Log in
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center"
      >
        <motion.h1
          variants={item}
          className="text-5xl md:text-7xl font-serif font-normal leading-[1.1] tracking-tight text-zinc-900 dark:text-white"
        >
          Effortless business
          <br />
          management by{" "}
          <span 
            className="bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-zinc-600 to-zinc-900 dark:from-white dark:via-zinc-300 dark:to-white"
            style={{ margin: "2px" }}
          >
            BizPlatform
          </span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-6 text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed"
        >
          Streamline your operations with seamless automation for every industry, tailored to your business.
        </motion.p>

        <motion.div variants={item} className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/signup?role=owner"
            onClick={() => {
              localStorage.setItem("user_role", "owner");
              document.cookie = "user_role=owner; path=/; max-age=3600; SameSite=Lax";
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-sm text-sm font-medium"
          >
            Start for free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/signup?role=consumer"
            onClick={() => {
              localStorage.setItem("user_role", "customer");
              document.cookie = "user_role=customer; path=/; max-age=3600; SameSite=Lax";
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white border border-zinc-200 hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-700 transition-colors text-sm font-medium"
          >
            I&apos;m a customer
          </Link>
        </motion.div>
      </motion.section>

      {/* Features Strip */}
      <section id="features" className="border-t border-zinc-150/40 dark:border-zinc-900 bg-zinc-50/20 dark:bg-zinc-950/20 transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className="p-6 rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/30 backdrop-blur-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <Icon className="w-5 h-5 text-zinc-400 dark:text-zinc-500 mb-4" />
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{feat.title}</h3>
                  <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{feat.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section id="social-proof" className="bg-transparent border-t border-zinc-150/40 dark:border-zinc-900 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-6"
          >
            <BarChart3 className="w-3 h-3" />
            Social Proof
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-serif font-normal text-zinc-900 dark:text-zinc-100 leading-tight"
          >
            Confidence backed
            <br />
            by results
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-base text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto"
          >
            Our customers achieve more each day because their tools are simple, powerful, and clear.
          </motion.p>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
              >
                <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{stat.value}</div>
                <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Industries */}
      <section id="industries" className="border-t border-zinc-150/40 dark:border-zinc-900 bg-zinc-50/20 dark:bg-zinc-950/20 transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-normal text-zinc-900 dark:text-zinc-100">
              Built for every industry
            </h2>
            <p className="mt-3 text-base text-zinc-500 dark:text-zinc-400">
              One platform, infinitely customized for your vertical.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {industries.map((ind, i) => {
              const Icon = ind.icon;
              return (
                <motion.div
                  key={ind.name}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group flex items-start gap-3 p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/30 backdrop-blur-sm hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-700 hover:-translate-y-0.5 transition-all duration-300 cursor-default"
                >
                  <div className="w-9 h-9 rounded-lg bg-zinc-100/80 dark:bg-zinc-800/80 flex items-center justify-center flex-shrink-0 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors">
                    <Icon className="w-4.5 h-4.5 text-zinc-600 dark:text-zinc-300" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{ind.name}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">{ind.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-transparent border-t border-zinc-150/40 dark:border-zinc-900 transition-colors duration-300">
        <div className="max-w-3xl mx-auto px-6 py-24 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-serif font-normal text-zinc-900 dark:text-zinc-100 leading-tight"
          >
            Ready to transform your business?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-base text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto"
          >
            Join thousands of businesses streamlining their operations, managing schedules, and growing with data-driven insights.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-sm text-sm font-medium"
            >
              Start for free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-150/40 dark:border-zinc-900 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-md transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <span className="text-lg font-bold text-zinc-900 dark:text-white">BizPlatform</span>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Business made effortless</p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
                <li><a href="#features" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Features</a></li>
                <li><a href="#industries" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Industries</a></li>
                <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
                <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">About us</a></li>
                <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
                <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-zinc-150/40 dark:border-zinc-900 flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500">
            <span>&copy; {new Date().getFullYear()} BizPlatform. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-zinc-650 dark:hover:text-zinc-300 transition-colors">Terms</a>
              <a href="#" className="hover:text-zinc-650 dark:hover:text-zinc-300 transition-colors">Privacy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}