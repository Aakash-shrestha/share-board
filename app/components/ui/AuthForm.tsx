"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

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
      const endpoint = isLogin ? "/api/auth/signin" : "/api/auth/signup";
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

      router.push(`/dashboard/${data.id}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-10 w-10 items-center justify-center border border-neutral-700 bg-neutral-900 text-lg font-bold text-red-500">
          S
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          {isLogin ? "Welcome back" : "Create account"}
        </h1>
        <p className="mt-2 text-xs text-neutral-500">
          {isLogin
            ? "Sign in to access your boards"
            : "Get started with ShareBoard"}
        </p>
      </div>

      {/* Form */}
      <div className="border border-neutral-800 bg-neutral-900/60 p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name (signup only) */}
          {!isLogin && (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="name"
                className="text-xs font-medium uppercase tracking-wider text-neutral-500"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required={!isLogin}
                className="border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-red-500"
              />
            </div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-xs font-medium uppercase tracking-wider text-neutral-500"
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
              className="border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-red-500"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-xs font-medium uppercase tracking-wider text-neutral-500"
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
              className="border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-red-500"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="mt-1 h-10 w-full bg-red-600 text-white hover:bg-red-500 disabled:opacity-50"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : isLogin ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-neutral-800" />
          <span className="text-[10px] uppercase tracking-widest text-neutral-600">
            or
          </span>
          <div className="h-px flex-1 bg-neutral-800" />
        </div>

        {/* Toggle */}
        <Button
          variant="outline"
          onClick={() => {
            setIsLogin(!isLogin);
            setError("");
          }}
          className="w-full border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-white"
        >
          {isLogin
            ? "Don't have an account? Sign up"
            : "Already have an account? Sign in"}
        </Button>
      </div>

      {/* Footer */}
      <p className="mt-4 text-center text-[10px] text-neutral-700">
        By continuing, you agree to our Terms of Service
      </p>
    </div>
  );
}
