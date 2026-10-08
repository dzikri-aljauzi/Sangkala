"use client";

import { useEffect } from "react";
import DashboardSidebar from "./DashboardSidebar";

interface DashboardWrapperProps {
  children: React.ReactNode;
  assessmentName?: string;
  assessmentId?: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function DashboardWrapper({
  children,
  assessmentName,
  assessmentId,
  activeTab: _activeTab,
  onTabChange,
}: DashboardWrapperProps) {
  useEffect(() => {
    const handleTabChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ tab: string }>;
      if (onTabChange && customEvent.detail?.tab) {
        onTabChange(customEvent.detail.tab);
      }
    };

    window.addEventListener("dashboard-tab-change", handleTabChange);
    return () => {
      window.removeEventListener("dashboard-tab-change", handleTabChange);
    };
  }, [onTabChange]);

  return (
    <div className="flex min-h-screen bg-stone-50">
      <DashboardSidebar
        assessmentName={assessmentName}
        assessmentId={assessmentId}
      />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
