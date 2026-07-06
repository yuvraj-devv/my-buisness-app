"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { supabaseClient } from "@/lib/supabase-client";
import { signUp } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Loader2,
  Mail,
  Lock,
  User,
  CheckCircle,
  Users,
  Building2,
  Phone,
  KeyRound,
} from "lucide-react";

function SignupForm() {
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");
  const [role, setRole] = useState<string>(roleParam === "owner" ? "owner" : "consumer");
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpToken, setOtpToken] = useState("");

  async function handleEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(""); setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("role", role);
    const result = await signUp(formData);
    if (result?.error) { setError(result.error); setLoading(false); }
    else if (result?.success) { setSuccess(true); setLoading(false); }
  }

  async function handleGoogleSignup() {
    setError(""); setLoading(true);
    const intendedRole = role === "owner" ? "owner" : "customer";
    localStorage.setItem("user_role", intendedRole);
    document.cookie = `user_role=${intendedRole}; path=/; max-age=3600; SameSite=Lax`;

    const { error: oAuthError } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?role=${role}` },
    });
    if (oAuthError) { setError(oAuthError.message); setLoading(false); }
  }

  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault();
    if (!phone) { setError("Please enter a valid phone number."); return; }
    if (!fullName) { setError("Please enter your name."); return; }
    setError(""); setLoading(true);
    const { error: otpError } = await supabaseClient.auth.signInWithOtp({ phone, options: { shouldCreateUser: true, data: { role, full_name: fullName } } });
    setLoading(false);
    if (otpError) { setError(otpError.message); } else { setOtpSent(true); }
  }

  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault();
    if (!otpToken) { setError("Please enter the verification code."); return; }
    setError(""); setLoading(true);
    const { data, error: verifyError } = await supabaseClient.auth.verifyOtp({ phone, token: otpToken, type: "sms" });
    if (verifyError) { setError(verifyError.message); setLoading(false); return; }
    const user = data.user;
    if (!user) { setError("Verification failed."); setLoading(false); return; }
    await supabaseClient.from("profiles").upsert({ id: user.id, role, full_name: fullName });
    router.push(role === "owner" ? "/onboarding" : "/explore");
  }

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-sm text-center space-y-6 bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
            <CheckCircle className="w-7 h-7 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-zinc-900">Check your email</h1>
            <p className="text-sm text-zinc-500 leading-relaxed">We&apos;ve sent a confirmation link to your email. Click the link to verify your account.</p>
          </div>
          <Link href="/login" className="inline-flex text-xs text-zinc-400 hover:text-zinc-700 transition-colors underline underline-offset-4">Back to Sign In</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative w-full max-w-sm space-y-6 bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-700 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </Link>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-zinc-900">Create an account</h1>
          <p className="text-sm text-zinc-500">Sign up to get started with BizPlatform.</p>
        </div>

        {/* Role Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-600">I am a...</label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setRole("consumer")} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all ${role === "consumer" ? "border-blue-300 bg-blue-50 text-blue-600" : "border-zinc-200 bg-white text-zinc-500 hover:text-zinc-700"}`}>
              <Users className="w-4 h-4" /> Customer
            </button>
            <button type="button" onClick={() => setRole("owner")} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all ${role === "owner" ? "border-emerald-300 bg-emerald-50 text-emerald-600" : "border-zinc-200 bg-white text-zinc-500 hover:text-zinc-700"}`}>
              <Building2 className="w-4 h-4" /> Business Owner
            </button>
          </div>
        </div>

        {/* Method Switcher */}
        <div className="flex bg-zinc-100 rounded-lg p-1">
          <button onClick={() => { setMethod("email"); setError(""); }} className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${method === "email" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}>Email</button>
          <button onClick={() => { setMethod("phone"); setError(""); }} className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${method === "phone" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}>Phone OTP</button>
        </div>

        {method === "email" ? (
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="signup-name" className="text-xs font-medium text-zinc-600">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input id="signup-name" name="fullName" placeholder="John Doe" required className="pl-10 bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="signup-email" className="text-xs font-medium text-zinc-600">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input id="signup-email" name="email" type="email" placeholder="you@example.com" required className="pl-10 bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="signup-password" className="text-xs font-medium text-zinc-600">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input id="signup-password" name="password" type="password" placeholder="Min 6 characters" required minLength={6} className="pl-10 bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400" />
              </div>
            </div>
            {error && <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full bg-zinc-900 text-white hover:bg-zinc-800 font-semibold">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
            </Button>
          </form>
        ) : (
          <form onSubmit={otpSent ? handleVerifyOTP : handleSendOTP} className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="signup-phone-name" className="text-xs font-medium text-zinc-600">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input id="signup-phone-name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" required disabled={otpSent} className="pl-10 bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400" />
              </div>
            </div>
            {!otpSent ? (
              <div className="space-y-1.5">
                <label htmlFor="signup-phone" className="text-xs font-medium text-zinc-600">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input id="signup-phone" value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="+1234567890" required className="pl-10 bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400" />
                </div>
                <p className="text-[10px] text-zinc-400">Include country code (e.g. +91 for India).</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label htmlFor="signup-otp" className="text-xs font-medium text-zinc-600">One-Time Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input id="signup-otp" value={otpToken} onChange={(e) => setOtpToken(e.target.value)} placeholder="Enter 6-digit code" required className="pl-10 bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 font-mono tracking-widest text-center" />
                </div>
              </div>
            )}
            {error && <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full bg-zinc-900 text-white hover:bg-zinc-800 font-semibold">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : otpSent ? "Verify & Sign Up" : "Send Verification Code"}
            </Button>
            {otpSent && <button type="button" onClick={() => { setOtpSent(false); setOtpToken(""); setError(""); }} className="text-[11px] text-zinc-400 hover:text-zinc-700 transition-colors block mx-auto">Change Details</button>}
          </form>
        )}

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-zinc-200"></div>
          <span className="flex-shrink mx-4 text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">or</span>
          <div className="flex-grow border-t border-zinc-200"></div>
        </div>

        <Button type="button" onClick={handleGoogleSignup} disabled={loading} variant="outline" className="w-full border-zinc-200 hover:border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-700 font-medium text-xs py-5">
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </Button>

        <p className="text-xs text-zinc-400 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-zinc-700 hover:text-zinc-900 transition-colors underline underline-offset-4">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50 flex items-center justify-center"><Loader2 className="w-6 h-6 text-zinc-400 animate-spin" /></div>}>
      <SignupForm />
    </Suspense>
  );
}
