"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { resolveView } from "@/config/workspace";
import AdminDashboard from "@/components/dashboards/AdminDashboard";
import AsesorDashboard from "@/components/dashboards/AsesorDashboard";
import KlienDashboard from "@/components/dashboards/KlienDashboard";
import StaffKlienDashboard from "@/components/dashboards/StaffKlienDashboard";

export default function WorkspaceViewPage({
  params,
}: {
  params: Promise<{ id: string; view: string }>;
}) {
  const { data: session } = useSession();
  const [id, setId] = useState("");
  const [view, setView] = useState("");

  useEffect(() => {
    params.then(({ id: idParam, view: viewParam }) => {
      setId(idParam);
      setView(viewParam);
    });
  }, [params]);

  const role = session?.user?.role;
  const resolved = resolveView(role, view);

  if (!session || !id) return null;

  // resolveView guarantees `resolved` is in the role's allowed view set,
  // so the cast below is safe for each role's tab union.
  switch (role) {
    case "ADMIN":
      return <AdminDashboard assessmentId={id} embedded initialTab={resolved as never} />;
    case "ASESOR":
      return <AsesorDashboard assessmentId={id} embedded initialTab={resolved as never} />;
    case "KLIEN":
      return <KlienDashboard assessmentId={id} embedded initialTab={resolved as never} />;
    case "STAFF_KLIEN":
      return <StaffKlienDashboard assessmentId={id} embedded initialTab={resolved as never} />;
    default:
      return null;
  }
}
