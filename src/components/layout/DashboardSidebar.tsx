"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Upload,
  LogOut,
  ChevronLeft,
  Menu,
  ChevronDown,
  FolderOpen,
  BarChart3,
  Layers,
  Newspaper,
  ExternalLink,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

interface DashboardSidebarProps {
  assessmentName?: string;
  assessmentId?: string;
}

interface AssessmentItem {
  id: string;
  name: string;
  clientName: string;
  clientLogo: string | null;
}

export default function DashboardSidebar({
  assessmentName,
  assessmentId
}: DashboardSidebarProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [assessments, setAssessments] = useState<AssessmentItem[]>([]);
  const switcherRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/assessment-center");
  };

  const role = session?.user?.role;

  const fetchAssessments = useCallback(async () => {
    try {
      const res = await fetch("/api/assessments");
      if (res.ok) {
        const data = await res.json();
        setAssessments(data);
      }
    } catch (error) {
      console.error("Error fetching assessments:", error);
    }
  }, []);

  // Fetch all assessments for admin switcher
  useEffect(() => {
    let isMounted = true;
    if (role === "ADMIN") {
      fetch("/api/assessments")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (isMounted && data) {
            setAssessments(data);
          }
        })
        .catch((error) => console.error("Error fetching assessments:", error));
    }
    return () => {
      isMounted = false;
    };
  }, [role]);

  // Close switcher on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) {
        setShowSwitcher(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const switchAssessment = (targetId: string) => {
    setShowSwitcher(false);
    router.push(`/assessment-center/${targetId}/overview`);
  };

  // Define menu items based on role
  const getMenuItems = () => {
    const baseItems = [
      {
        id: "overview",
        label: "Overview",
        icon: LayoutDashboard,
        tab: "overview",
      },
    ];

    if (role === "ADMIN") {
      return [
        ...baseItems,
        {
          id: "users",
          label: "Manage Users",
          icon: Users,
          tab: "users",
        },
        {
          id: "documents",
          label: "All Documents",
          icon: FileText,
          tab: "documents",
        },
        {
          id: "resumes",
          label: "Resumes",
          icon: Upload,
          tab: "resumes",
        },
        {
          id: "documentations",
          label: "Documentations",
          icon: Upload,
          tab: "documentations",
        },
        {
          id: "progress",
          label: "Progress",
          icon: BarChart3,
          tab: "progress",
        },
        {
          id: "echelons",
          label: "Kelola Eselon",
          icon: Layers,
          tab: "echelons",
        },
      ];
    } else if (role === "ASESOR") {
      return [
        ...baseItems,
        {
          id: "upload",
          label: "Upload Dokumen",
          icon: Upload,
          tab: "upload",
        },
        {
          id: "history",
          label: "Riwayat Upload",
          icon: FileText,
          tab: "history",
        },
      ];
    } else if (role === "KLIEN") {
      return [
        ...baseItems,
        {
          id: "resumes",
          label: "Resumes",
          icon: FileText,
          tab: "resumes",
        },
        {
          id: "documentations",
          label: "Documentations",
          icon: Upload,
          tab: "documentations",
        },
        {
          id: "progress",
          label: "Progress",
          icon: BarChart3,
          tab: "progress",
        },
      ];
    } else if (role === "STAFF_KLIEN") {
      // Staff Klien hanya bisa melihat progress
      return [
        ...baseItems,
        {
          id: "progress",
          label: "Progress",
          icon: BarChart3,
          tab: "progress",
        },
      ];
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  return (
    <div
      className={`${
        collapsed ? "w-20" : "w-64"
      } min-h-screen bg-stone-900 text-white flex flex-col transition-all duration-300`}
    >
      {/* Header */}
      <div className="p-6 border-b border-stone-700">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-petrol-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-medium text-sm">Sangkala</h2>
                <p className="text-xs text-stone-400">Assessment Center</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-stone-700 rounded-lg transition-colors"
          >
            {collapsed ? (
              <Menu className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-stone-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-petrol-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold">
              {session?.user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {session?.user?.name}
              </p>
              <p className="text-xs text-stone-400">{role}</p>
            </div>
          )}
        </div>
      </div>

      {/* Assessment Switcher (Admin Only) */}
      {role === "ADMIN" && !collapsed && (
        <div className="px-4 pt-4" ref={switcherRef}>
          <div className="relative">
            <button
              onClick={() => setShowSwitcher(!showSwitcher)}
              className="w-full flex items-center justify-between p-3 bg-stone-800/80 hover:bg-stone-700 rounded-lg transition-colors border border-stone-700"
            >
              <div className="flex items-center gap-2 min-w-0">
                <FolderOpen className="w-4 h-4 text-petrol-400 flex-shrink-0" />
                <span className="text-xs font-medium truncate">
                  {assessmentName || "Pilih Assessment"}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-stone-400 flex-shrink-0 transition-transform ${
                  showSwitcher ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown */}
            {showSwitcher && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-stone-800 border border-stone-700 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                {assessments.length === 0 ? (
                  <div className="px-3 py-4 text-xs text-stone-500 text-center">
                    Belum ada assessment
                  </div>
                ) : (
                  assessments.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => switchAssessment(a.id)}
                      className={`w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-stone-700 transition-colors text-sm ${
                        a.id === assessmentId
                          ? "bg-petrol-600/20 text-petrol-300"
                          : "text-stone-300"
                      }`}
                    >
                      {a.clientLogo ? (
                        <div className="w-8 h-8 rounded bg-white p-1 flex-shrink-0">
                          <img
                            src={a.clientLogo}
                            alt={a.clientName}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded bg-stone-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold">
                            {a.clientName.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium truncate text-xs">{a.name}</p>
                        <p className="text-xs text-stone-500 truncate">
                          {a.clientName}
                        </p>
                      </div>
                      {a.id === assessmentId && (
                        <div className="ml-auto w-2 h-2 rounded-full bg-petrol-400 flex-shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Collapsed Assessment Indicator */}
      {role === "ADMIN" && collapsed && assessmentName && (
        <div className="px-2 pt-4">
          <div className="w-10 h-10 mx-auto bg-stone-800 rounded-lg flex items-center justify-center border border-stone-700" title={assessmentName}>
            <FolderOpen className="w-5 h-5 text-petrol-400" />
          </div>
        </div>
      )}

      {/* Non-admin Assessment Info */}
      {role !== "ADMIN" && !collapsed && assessmentName && (
        <div className="px-4 pt-4">
          <div className="p-2 bg-stone-800 rounded-lg">
            <p className="text-xs text-stone-400 mb-1">Assessment:</p>
            <p className="text-sm font-medium truncate">{assessmentName}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              // This will be handled by parent component via URL params or state
              window.dispatchEvent(
                new CustomEvent("dashboard-tab-change", {
                  detail: { tab: item.tab },
                })
              );
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              collapsed ? "justify-center" : ""
            } hover:bg-stone-700 hover:translate-x-1`}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && (
              <span className="text-sm font-medium">{item.label}</span>
            )}
          </button>
        ))}

        {/* Admin: Kelola Insights */}
        {role === "ADMIN" && (
          <>
            <div className={`my-3 border-t border-stone-700 ${collapsed ? "mx-2" : ""}`} />
            <button
              onClick={() => router.push("/admin/manage")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                collapsed ? "justify-center" : ""
              } hover:bg-stone-700 hover:translate-x-1 text-petrol-400`}
            >
              <Newspaper className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium flex items-center gap-2">
                  Kelola Insights
                  <ExternalLink className="w-3 h-3" />
                </span>
              )}
            </button>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-stone-700">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
            collapsed ? "justify-center" : ""
          } hover:bg-red-600 text-red-400 hover:text-white`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
}
