"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, AlertCircle, UserCheck, Building2, Users, type LucideIcon } from "lucide-react";

interface Assessment {
  id: string;
  name: string;
  clientName: string;
  clientLogo: string | null;
}

type LoginRole = "ASESOR" | "KLIEN" | "STAFF_KLIEN";

const roleTabs: { role: LoginRole; label: string; icon: LucideIcon; color: string; description: string }[] = [
  {
    role: "ASESOR",
    label: "Asesor",
    icon: UserCheck,
    color: "from-blue-500 to-cyan-600",
    description: "Login sebagai asesor",
  },
  {
    role: "KLIEN",
    label: "Klien",
    icon: Building2,
    color: "from-emerald-500 to-teal-600",
    description: "Login sebagai klien",
  },
  {
    role: "STAFF_KLIEN",
    label: "Staff",
    icon: Users,
    color: "from-orange-500 to-amber-600",
    description: "Login sebagai staff klien (hanya lihat progress)",
  },
];

export default function AssessmentLoginPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const [assessmentId, setAssessmentId] = useState<string>("");
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<LoginRole>("ASESOR");

  useEffect(() => {
    params.then((resolvedParams) => {
      setAssessmentId(resolvedParams.id);
      fetchAssessment(resolvedParams.id);
    });
  }, []);

  const fetchAssessment = async (id: string) => {
    try {
      const res = await fetch(`/api/assessments/${id}`);
      if (res.ok) {
        const data = await res.json();
        setAssessment(data);
      } else {
        router.push("/assessment-center");
      }
    } catch (error) {
      console.error("Error fetching assessment:", error);
      router.push("/assessment-center");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // STAFF_KLIEN uses KLIEN as loginRole for auth validation
      const loginRole = selectedRole === "STAFF_KLIEN" ? "KLIEN" : selectedRole;

      const result = await signIn("credentials", {
        email,
        password,
        assessmentId,
        loginRole: loginRole,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push(`/assessment-center/${assessmentId}/overview`);
      }
    } catch (error) {
      setError(t("assessmentCenter.loginError"));
    } finally {
      setLoading(false);
    }
  };

  // Get current role tab config
  const currentTab = roleTabs.find((tab) => tab.role === selectedRole)!;

  if (!assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header with Logo & Assessment Info */}
          <div className={`bg-gradient-to-r ${currentTab.color} px-8 py-8 text-center transition-all duration-500`}>
            <div className="flex justify-center mb-4">
              {assessment.clientLogo ? (
                <div className="bg-white rounded-xl p-3 shadow-lg">
                  <Image
                    src={assessment.clientLogo}
                    alt={assessment.clientName}
                    width={100}
                    height={100}
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-3xl font-bold text-white">
                    {assessment.clientName.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <h1 className="text-xl font-bold text-white mb-1">
              {assessment.name}
            </h1>
            <p className="text-white/80 text-sm">
              {assessment.clientName}
            </p>
          </div>

          {/* Role Selection Tabs */}
          <div className="px-6 pt-6">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3 text-center">
              Login Sebagai
            </p>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
              {roleTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = selectedRole === tab.role;
                return (
                  <button
                    key={tab.role}
                    onClick={() => {
                      setSelectedRole(tab.role);
                      setError("");
                    }}
                    className={`relative flex flex-col items-center gap-0.5 py-2.5 px-1.5 rounded-lg text-[11px] font-medium transition-all duration-300 ${
                      isActive
                        ? "bg-white shadow-md text-slate-900"
                        : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-blue-600" : ""}`} />
                    <span>{tab.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-white rounded-lg shadow-md -z-10"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Login Form */}
          <div className="px-8 py-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedRole}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Role description */}
                <p className="text-sm text-slate-500 mb-5 text-center">
                  {currentTab.description}
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Error Message */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3"
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
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="••••••••"
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
              </motion.div>
            </AnimatePresence>

            {/* Footer */}
            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                Leadership Nasional Asia — Assessment Center
              </p>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-4 text-center">
          <button
            onClick={() => router.push("/assessment-center")}
            className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
          >
            ← {t("assessmentCenter.listTitle")}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
