"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { AuthFields, AuthError } from "@/components/layout/AuthForm";

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
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <p role="status" className="text-stone-700">Memuat…</p>
      </div>
    );
  }

  // Hide login form if already authenticated (will redirect)
  if (status === "authenticated" && (session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN")) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <p role="status" className="text-stone-700">Memuat…</p>
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
        setError(
          result.error.startsWith("Terlalu banyak")
            ? result.error
            : "Email atau password salah, atau akun ini bukan admin."
        );
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
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="mx-auto flex h-16 w-full max-w-content items-center px-5 md:px-8">
        <Link href="/" aria-label="Sangkala, beranda">
          <Logo className="h-8" />
        </Link>
      </header>
      <main className="mx-auto w-full max-w-md grow px-5 pb-20 pt-12 md:pt-20">
        <p className="type-meta mb-4 text-petrol-600">Sangkala</p>
        <h1 className="type-h1 !text-[2rem] !leading-[2.5rem]">Admin Login</h1>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5 border-t border-ink pt-8">
          <AuthError message={error} />
          <AuthFields
            email={email}
            onEmail={setEmail}
            password={password}
            onPassword={setPassword}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            emailLabel={t("assessmentCenter.email")}
            passwordLabel={t("assessmentCenter.password")}
          />
          <Button type="submit" size="lg" className="w-full" isLoading={loading} disabled={loading}>
            {t("assessmentCenter.loginButton")}
          </Button>
        </form>
        <Link href="/" className="mt-8 inline-block text-[0.9375rem] text-petrol-600 underline-offset-4 hover:underline">
          ← Kembali ke Beranda
        </Link>
      </main>
    </div>
  );
}
