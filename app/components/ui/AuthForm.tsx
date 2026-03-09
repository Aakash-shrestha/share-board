"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
      const body = isLogin ? { email, password } : { name, email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      router.push(`/note/${data.id}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 text-2xl font-bold shadow-lg shadow-purple-500/20">
          S
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isLogin ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-2 text-neutral-400">
          {isLogin
            ? "Sign in to access your boards"
            : "Get started with ShareBoard for free"}
        </p>
      </div>

      {/* Form Card */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-8 shadow-2xl backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Name (signup only) */}
          {!isLogin && (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-neutral-300"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required={!isLogin}
                className="rounded-xl border border-neutral-700 bg-neutral-800/50 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-neutral-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50"
              />
            </div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-neutral-300"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="rounded-xl border border-neutral-700 bg-neutral-800/50 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-neutral-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-neutral-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="rounded-xl border border-neutral-700 bg-neutral-800/50 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-neutral-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="mt-1 flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 font-medium text-white shadow-lg shadow-purple-500/20 transition-all hover:from-purple-500 hover:to-blue-500 hover:shadow-purple-500/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : isLogin ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-neutral-800" />
          <span className="text-xs text-neutral-500">OR</span>
          <div className="h-px flex-1 bg-neutral-800" />
        </div>

        {/* Toggle */}
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setError("");
          }}
          className="w-full rounded-xl border border-neutral-700 bg-neutral-800/30 py-3 text-sm font-medium text-neutral-300 transition-all hover:border-neutral-600 hover:bg-neutral-800/60 hover:text-white"
        >
          {isLogin
            ? "Don't have an account? Sign up"
            : "Already have an account? Sign in"}
        </button>
      </div>

      {/* Footer */}
      <p className="mt-6 text-center text-xs text-neutral-600">
        By continuing, you agree to our Terms of Service
      </p>
    </div>
  );
}
