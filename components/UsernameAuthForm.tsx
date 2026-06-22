"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, UserRound, LogIn, UserPlus, Eye, EyeOff, Sparkles } from "lucide-react";

interface UsernameAuthFormProps {
  mode: "login" | "signup";
}

const words = ["Unlimited movies", "Watch anywhere", "Cancel anytime", "Anime & manga"];

export default function UsernameAuthForm({ mode }: UsernameAuthFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const isSignup = mode === "signup";

  useEffect(() => {
    const id = setInterval(() => setWordIndex((i) => (i + 1) % words.length), 3000);
    return () => clearInterval(id);
  }, []);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = (await res.json()) as { error?: string };

    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-accent/5 blur-[120px] animate-pulse" style={{ animationDuration: "8s" }} />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[100px] animate-pulse" style={{ animationDuration: "10s", animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-purple-500/3 blur-[80px] animate-pulse" style={{ animationDuration: "12s", animationDelay: "4s" }} />
      </div>

      {/* Floating orbs */}
      <div className="absolute top-20 right-20 w-2 h-2 rounded-full bg-accent/30 animate-ping" style={{ animationDuration: "3s" }} />
      <div className="absolute bottom-32 left-16 w-1.5 h-1.5 rounded-full bg-blue-400/20 animate-ping" style={{ animationDuration: "4s", animationDelay: "1s" }} />
      <div className="absolute top-1/3 left-1/4 w-1 h-1 rounded-full bg-purple-400/20 animate-ping" style={{ animationDuration: "5s", animationDelay: "2s" }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md"
      >
        {/* Glow border */}
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-accent/20 via-purple-500/10 to-transparent opacity-50 blur-sm" />
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-accent/10 via-transparent to-transparent" />

        <div className="relative rounded-2xl bg-[#0c0c14]/90 backdrop-blur-xl border border-white/[0.06] p-8 shadow-2xl shadow-black/50">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

          {/* Logo + Heading */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-8"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-purple-700 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-accent/20 ring-1 ring-white/10">
              {isSignup ? <UserPlus className="w-7 h-7 text-white" /> : <LogIn className="w-7 h-7 text-white" />}
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              {isSignup ? "Create account" : "Welcome back"}
            </h1>
            <div className="mt-2 h-6 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={words[wordIndex]}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm text-white/40 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-accent/60" />
                  {words[wordIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            onSubmit={submit}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Username</label>
              <div className="group relative">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent/20 to-purple-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm" />
                <div className="relative flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-3 transition-all group-focus-within:border-accent/40 group-focus-within:bg-white/[0.06]">
                  <UserRound className="h-4 w-4 text-white/20 group-focus-within:text-accent/60 transition-colors flex-shrink-0" />
                  <input
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    autoComplete="username"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/15"
                    placeholder="Your username"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Password</label>
              <div className="group relative">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent/20 to-purple-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm" />
                <div className="relative flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-3 transition-all group-focus-within:border-accent/40 group-focus-within:bg-white/[0.06]">
                  <Lock className="h-4 w-4 text-white/20 group-focus-within:text-accent/60 transition-colors flex-shrink-0" />
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type={showPassword ? "text" : "password"}
                    autoComplete={isSignup ? "new-password" : "current-password"}
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/15"
                    placeholder={isSignup ? "Create a password" : "Enter your password"}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-white/20 hover:text-white/50 transition-colors flex-shrink-0"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {error ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-xl border border-red-500/20 bg-red-500/8 px-3.5 py-2.5 text-sm text-red-200 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400/60 flex-shrink-0" />
                    {error}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="relative w-full rounded-xl bg-gradient-to-b from-accent to-purple-700 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-accent/20 hover:shadow-accent/30 transition-all disabled:cursor-not-allowed disabled:opacity-50 overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Working...
                  </>
                ) : (
                  <>
                    {isSignup ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                    {isSignup ? "Create account" : "Sign in"}
                  </>
                )}
              </span>
            </motion.button>
          </motion.form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mt-6 text-center text-sm text-white/40"
          >
            {isSignup ? "Already have an account?" : "Need an account?"}{" "}
            <Link className="font-semibold text-accent hover:text-accent-hover transition-colors" href={isSignup ? "/login" : "/signup"}>
              {isSignup ? "Sign in" : "Sign up"}
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
