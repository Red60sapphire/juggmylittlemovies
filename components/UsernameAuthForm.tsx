"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, UserRound, LogIn, UserPlus, PlaySquare } from "lucide-react";

interface UsernameAuthFormProps {
  mode: "login" | "signup";
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

export default function UsernameAuthForm({ mode }: UsernameAuthFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<"username" | "password" | null>(null);
  const isSignup = mode === "signup";

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#121218] p-8 shadow-2xl shadow-black/40 overflow-hidden"
      >
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent" />

        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-600/30">
            <PlaySquare className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            {isSignup ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-white/40">
            {isSignup ? "Start watching with a username and password" : "Sign in to pick up where you left off"}
          </p>
        </motion.div>

        <motion.form variants={itemVariants} onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-white/60">Username</span>
            <motion.div
              animate={{
                borderColor: focusedField === "username" ? "rgba(168,85,247,0.5)" : "rgba(255,255,255,0.08)",
                boxShadow: focusedField === "username" ? "0 0 0 1px rgba(168,85,247,0.3)" : "0 0 0 0px transparent",
              }}
              className="flex items-center gap-3 rounded-xl border bg-white/[0.04] px-3 py-3 transition-all"
            >
              <UserRound className="h-4 w-4 text-white/30" />
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                onFocus={() => setFocusedField("username")}
                onBlur={() => setFocusedField(null)}
                autoComplete="username"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/20"
                placeholder="juggfan"
                required
              />
            </motion.div>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-white/60">Password</span>
            <motion.div
              animate={{
                borderColor: focusedField === "password" ? "rgba(168,85,247,0.5)" : "rgba(255,255,255,0.08)",
                boxShadow: focusedField === "password" ? "0 0 0 1px rgba(168,85,247,0.3)" : "0 0 0 0px transparent",
              }}
              className="flex items-center gap-3 rounded-xl border bg-white/[0.04] px-3 py-3 transition-all"
            >
              <Lock className="h-4 w-4 text-white/30" />
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                type="password"
                autoComplete={isSignup ? "new-password" : "current-password"}
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/20"
                placeholder="At least 8 characters"
                required
              />
            </motion.div>
          </label>

          {error ? (
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200"
            >
              {error}
            </motion.p>
          ) : null}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="relative w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 transition-shadow disabled:cursor-not-allowed disabled:opacity-60 overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : isSignup ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
              {loading ? "Working..." : isSignup ? "Create account" : "Sign in"}
            </span>
          </motion.button>
        </motion.form>

        <motion.p variants={itemVariants} className="mt-6 text-center text-sm text-white/40">
          {isSignup ? "Already have an account?" : "Need an account?"}{" "}
          <Link className="font-semibold text-accent hover:text-accent-hover transition-colors" href={isSignup ? "/login" : "/signup"}>
            {isSignup ? "Sign in" : "Sign up"}
          </Link>
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
