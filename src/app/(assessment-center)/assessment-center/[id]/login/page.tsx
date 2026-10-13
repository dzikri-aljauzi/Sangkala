"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/layout";
import { AuthFields, AuthError } from "@/components/layout/AuthForm";
import { cn } from "@/lib/utils";

interface Assessment {
  id: string;
  name: string;
  clientName: string;
  clientLogo: string | null;
}

type LoginRole = "ASESOR" | "KLIEN" | "STAFF_KLIEN";

const roleTabs: { role: LoginRole; label: string; description: string }[] = [
  { role: "ASESOR", label: "Asesor", description: "Login sebagai asesor" },
  { role: "KLIEN", label: "Klien", description: "Login sebagai klien" },
  { role: "STAFF_KLIEN", label: "Staff", description: "Login sebagai staff klien (hanya lihat progress)" },
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
  const [showPassword, setShowPassword] = useState(false);
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

  const currentTab = roleTabs.find((tab) => tab.role === selectedRole)!;

  if (!assessment) {
    return (
      <Container className="py-32">
        <p role="status" className="text-stone-700">Memuat…</p>
      </Container>
    );
  }

  return (
    <Container className="py-14 md:py-20">
      <div className="mx-auto w-full max-w-md">
        <button
          type="button"
          onClick={() => router.push("/assessment-center")}
          className="mb-10 text-[0.9375rem] text-stone-700 transition-colors hover:text-petrol-600"
        >
          ← {t("assessmentCenter.listTitle")}
        </button>

        <div className="flex items-center gap-4">
          {assessment.clientLogo ? (
            <div className="grid size-16 shrink-0 place-items-center rounded-lg border border-stone-200 bg-white p-2">
              <Image src={assessment.clientLogo} alt={assessment.clientName} width={64} height={64} className="size-full object-contain" />
            </div>
          ) : (
            <div className="grid size-16 shrink-0 place-items-center rounded-lg bg-petrol-900 font-serif text-2xl text-paper">
              {assessment.clientName.charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <p className="type-meta text-stone-700">{assessment.clientName}</p>
            <h1 className="type-card mt-1">{assessment.name}</h1>
          </div>
        </div>

        <fieldset className="mt-10">
          <legend className="type-meta mb-3 text-stone-700">Login sebagai</legend>
          <div role="radiogroup" className="flex gap-6 border-b border-stone-200">
            {roleTabs.map((tab) => {
              const active = selectedRole === tab.role;
              return (
                <button
                  key={tab.role}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => {
                    setSelectedRole(tab.role);
                    setError("");
                  }}
                  className={cn(
                    "-mb-px border-b-2 py-3 text-[0.9375rem] transition-colors",
                    active ? "border-petrol-600 font-medium text-ink" : "border-transparent text-stone-700 hover:text-ink"
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <p className="mt-5 text-sm text-stone-700">{currentTab.description}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
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
      </div>
    </Container>
  );
}
