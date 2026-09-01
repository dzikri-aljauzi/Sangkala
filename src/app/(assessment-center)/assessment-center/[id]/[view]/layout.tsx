"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { getNavSections } from "@/config/nav";
import { resolveView, VIEW_TITLES, VIEW_SUBTITLES } from "@/config/workspace";

interface AssessmentInfo {
  id: string;
  name: string;
  clientName: string;
  clientLogo: string | null;
}

export default function WorkspaceViewLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string; view: string }>;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [assessment, setAssessment] = useState<AssessmentInfo | null>(null);
  const [id, setId] = useState("");
  const [view, setView] = useState("");

  useEffect(() => {
    params.then(({ id: idParam, view: viewParam }) => {
      setId(idParam);
      setView(viewParam);
    });
  }, [params]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/assessments/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setAssessment(data))
      .catch(() => setAssessment(null));
  }, [id]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/assessment-center/${id}/login`);
    }
    if (status === "authenticated" && session && id) {
      const userRole = session.user.role;
      const userAssessmentId = session.user.assessmentId;
      if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN" && userAssessmentId !== id) {
        router.push("/assessment-center");
      }
    }
  }, [status, router, id, session]);

  if (status === "loading" || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  const role = session.user.role;
  const resolvedView = resolveView(role, view);
  const sections = getNavSections(role, id);
  const assessmentName = assessment
    ? `${assessment.name} — ${assessment.clientName}`
    : undefined;

  return (
    <AppShell
      sections={sections}
      assessmentName={assessmentName}
      title={VIEW_TITLES[resolvedView]}
      subtitle={VIEW_SUBTITLES[resolvedView]}
    >
      {children}
    </AppShell>
  );
}
