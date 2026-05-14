"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AdminDashboard from "@/components/dashboards/AdminDashboard";
import AsesorDashboard from "@/components/dashboards/AsesorDashboard";
import KlienDashboard from "@/components/dashboards/KlienDashboard";
import StaffKlienDashboard from "@/components/dashboards/StaffKlienDashboard";

export default function DashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [assessmentId, setAssessmentId] = useState<string>("");

  useEffect(() => {
    params.then((resolvedParams) => {
      setAssessmentId(resolvedParams.id);
    });
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/assessment-center/${assessmentId}/login`);
    }

    // Additional security: Verify non-admin users can only access their assigned assessment
    if (status === "authenticated" && session && assessmentId) {
      const userRole = session.user.role;
      const userAssessmentId = session.user.assessmentId;

      if (userRole !== "ADMIN" && userAssessmentId !== assessmentId) {
        // Redirect to their own assessment or back to assessment list
        router.push("/assessment-center");
      }
    }
  }, [status, router, assessmentId, session]);

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Route to appropriate dashboard based on role
  switch (session.user.role) {
    case "ADMIN":
      return <AdminDashboard assessmentId={assessmentId} />;
    case "ASESOR":
      return <AsesorDashboard assessmentId={assessmentId} />;
    case "KLIEN":
      return <KlienDashboard assessmentId={assessmentId} />;
    case "STAFF_KLIEN":
      return <StaffKlienDashboard assessmentId={assessmentId} />;
    default:
      return (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-red-600">Invalid role</p>
        </div>
      );
  }
}
