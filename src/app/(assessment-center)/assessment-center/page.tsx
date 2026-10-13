"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { Band, PageHeader } from "@/components/ui/layout";

interface Assessment {
  id: string;
  name: string;
  description: string | null;
  clientName: string;
  clientLogo: string | null;
  createdAt: string;
  _count: {
    users: number;
    documents: number;
    resumes: number;
    documentations: number;
  };
}

export default function AssessmentCenterPage() {
  const { t } = useLanguage();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const res = await fetch("/api/assessments");
      if (res.ok) {
        const data = await res.json();
        setAssessments(data);
      }
    } catch (error) {
      console.error("Error fetching assessments:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        crumbs={[{ href: "/assessment-center", label: "Assessment Center" }]}
        art={{ variant: "grid", seed: 33 }}
        eyebrow={t("assessmentCenter.subtitle")}
        title={t("assessmentCenter.title")}
        lead={t("assessmentCenter.pageDescription")}
      />

      <Band>
        <h2 className="type-meta mb-2 text-stone-700">{t("assessmentCenter.listTitle")}</h2>
        <p className="mb-8 text-stone-700">{t("assessmentCenter.selectAssessment")}</p>

        {loading ? (
          <p role="status" className="text-stone-700">Memuat…</p>
        ) : assessments.length === 0 ? (
          <p className="border-t border-ink pt-6 text-lg text-stone-700">{t("assessmentCenter.noAssessments")}</p>
        ) : (
          <ul className="border-t border-ink">
            {assessments.map((a) => (
              <li key={a.id} className="border-b border-stone-200">
                <Link
                  href={`/assessment-center/${a.id}/login`}
                  className="group flex items-center gap-5 py-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol-600"
                >
                  {a.clientLogo ? (
                    <div className="grid size-14 shrink-0 place-items-center rounded-lg border border-stone-200 bg-white p-1.5">
                      <Image src={a.clientLogo} alt={a.clientName} width={56} height={56} className="size-full object-contain" />
                    </div>
                  ) : (
                    <div className="grid size-14 shrink-0 place-items-center rounded-lg bg-petrol-900 font-serif text-xl text-paper">
                      {a.clientName.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="type-meta text-stone-700">{a.clientName}</p>
                    <h3 className="type-card mt-1 transition-colors group-hover:text-petrol-600">{a.name}</h3>
                    {a.description && <p className="mt-1 line-clamp-1 text-[0.9375rem] text-stone-700">{a.description}</p>}
                  </div>
                  <p className="type-meta hidden shrink-0 !tracking-normal text-stone-700 md:block">
                    {a._count.users} user · {a._count.documents} dok · {new Date(a.createdAt).toLocaleDateString("id-ID")}
                  </p>
                  <span className="shrink-0 text-[0.9375rem] font-semibold text-petrol-600">
                    {t("assessmentCenter.login")} →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Band>
    </>
  );
}
