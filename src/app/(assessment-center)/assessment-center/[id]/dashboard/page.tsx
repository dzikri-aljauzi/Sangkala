"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Legacy entry point: /assessment-center/[id]/dashboard.
 * The tab-based dashboard was replaced by real URL views
 * (/assessment-center/[id]/[view]); keep old links working by redirecting
 * to the new overview route (auth/guard handled by the [view] layout).
 */
export default function LegacyDashboardRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();

  useEffect(() => {
    params.then(({ id }) => {
      router.replace(`/assessment-center/${id}/overview`);
    });
  }, [params, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper">
      <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
    </div>
  );
}