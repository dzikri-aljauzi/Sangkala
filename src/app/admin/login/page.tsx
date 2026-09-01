"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Mail, Lock, AlertCircle, Shield } from "lucide-react";
import { PasswordToggleButton } from "@/components/ui/password-toggle-button";

export default function AdminLoginPage() {
  const { data: session, status } = useSession();
  const { t } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-redirect if admin session is still active
  useEffect(() => {
    if (status === "authenticated" && (session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN")) {
      router.push("/admin");
    }
  }, [status, session, router]);

  // Show loading while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Hide login form if already authenticated (will redirect)
  if (status === "authenticated" && (session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        loginRole: "ADMIN",
        redirect: false,
      });

      if (result?.error) {
        setError("Email atau password salah, atau akun ini bukan admin.");
      } else {
        router.push("/admin");
      }
    } catch (error) {
      setError(t("assessmentCenter.loginError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4 pt-20 sm:pt-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-8 sm:px-8 sm:py-10 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
              Admin Login
            </h1>
            <p className="text-blue-100 text-sm">
              Leadership Nasional Asia
            </p>
          </div>

          {/* Login Form */}
          <div className="px-6 py-6 sm:px-8 sm:py-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </motion.div>
              )}

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  {t("assessmentCenter.email")}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="example@example.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  {t("assessmentCenter.password")}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-11 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                  <PasswordToggleButton
                    visible={showPassword}
                    onToggle={() => setShowPassword(!showPassword)}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={loading}
                disabled={loading}
              >
                {t("assessmentCenter.loginButton")}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <Link
                href="/"
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                ← Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
