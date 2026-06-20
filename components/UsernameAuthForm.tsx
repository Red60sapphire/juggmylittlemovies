"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, UserRound } from "lucide-react";

interface UsernameAuthFormProps {
  mode: "login" | "signup";
}

export default function UsernameAuthForm({ mode }: UsernameAuthFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#121218]/90 p-6 shadow-2xl shadow-black/30">
        <div className="mb-6">
          <p className="text-sm font-semibold text-accent">{isSignup ? "Create account" : "Welcome back"}</p>
          <h1 className="mt-2 text-2xl font-bold text-white">
            {isSignup ? "Sign up for juggmylittlemovies" : "Log in to juggmylittlemovies"}
          </h1>
          <p className="mt-2 text-sm text-white/45">
            Username and password only. No email required.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-white/70">Username</span>
            <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-3 focus-within:border-accent/60">
              <UserRound className="h-4 w-4 text-white/35" />
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/25"
                placeholder="juggfan"
                required
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-white/70">Password</span>
            <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-3 focus-within:border-accent/60">
              <Lock className="h-4 w-4 text-white/35" />
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                autoComplete={isSignup ? "new-password" : "current-password"}
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/25"
                placeholder="At least 8 characters"
                required
              />
            </div>
          </label>

          {error ? (
            <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          ) : null}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-bold text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Working..." : isSignup ? "Create account" : "Log in"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-white/45">
          {isSignup ? "Already have an account?" : "Need an account?"}{" "}
          <Link className="font-semibold text-accent hover:underline" href={isSignup ? "/login" : "/signup"}>
            {isSignup ? "Log in" : "Sign up"}
          </Link>
        </p>
      </div>
    </div>
  );
}
