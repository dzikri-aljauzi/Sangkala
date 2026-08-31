import {
  Award,
  BarChart3,
  BellRing,
  Camera,
  FileText,
  FolderOpen,
  GraduationCap,
  History,
  LayoutDashboard,
  Layers,
  Newspaper,
  Upload,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type AppRole = "ADMIN" | "ASESOR" | "KLIEN" | "STAFF_KLIEN";

export interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}

const workspacePath = (assessmentId: string, path: string) =>
  `/assessment-center/${assessmentId}${path}`;

const workspaceSection = (assessmentId: string, items: Omit<NavItem, "href">[]): NavSection => ({
  id: "workspace",
  label: "Workspace",
  items: items.map((item) => ({
    ...item,
    href: workspacePath(assessmentId, item.key === "overview" ? "/overview" : `/${item.key}`),
  })),
});

const globalSection = (items: Omit<NavItem, "href">[]): NavSection => ({
  id: "global",
  label: "Semua",
  items: items.map((item) => ({
    ...item,
    href: item.key === "overview" ? "/admin" : `/admin/${item.key}`,
  })),
});

export const getNavSections = (
  role: AppRole | string | null | undefined,
  assessmentId?: string
): NavSection[] => {
  const sections: NavSection[] = [];

  if (role === "ADMIN") {
    sections.push(
      globalSection([
        { key: "overview", label: "Overview", icon: LayoutDashboard },
        { key: "pelatihan", label: "Pelatihan", icon: GraduationCap },
        { key: "sertifikat", label: "Sertifikat", icon: Award },
        { key: "manage", label: "Insights", icon: Newspaper },
        { key: "reminder-sertifikat", label: "Reminder Sertifikasi", icon: BellRing },
      ])
    );
  }

  if (!assessmentId) return sections;

  const adminWorkspace = workspaceSection(assessmentId, [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "users", label: "Users", icon: Users },
    { key: "documents", label: "Documents", icon: FileText },
    { key: "resumes", label: "Resumes", icon: FolderOpen },
    { key: "documentations", label: "Dokumentasi", icon: Camera },
    { key: "progress", label: "Progress", icon: BarChart3 },
    { key: "echelons", label: "Eselon", icon: Layers },
  ]);

  switch (role) {
    case "ADMIN":
      sections.push(adminWorkspace);
      break;
    case "ASESOR":
      sections.push(
        workspaceSection(assessmentId, [
          { key: "overview", label: "Overview", icon: LayoutDashboard },
          { key: "upload", label: "Upload Dokumen", icon: Upload },
          { key: "history", label: "Riwayat Upload", icon: History },
        ])
      );
      break;
    case "KLIEN":
      sections.push(
        workspaceSection(assessmentId, [
          { key: "overview", label: "Overview", icon: LayoutDashboard },
          { key: "resumes", label: "Resumes", icon: FolderOpen },
          { key: "documentations", label: "Dokumentasi", icon: Camera },
          { key: "progress", label: "Progress", icon: BarChart3 },
        ])
      );
      break;
    case "STAFF_KLIEN":
      sections.push(
        workspaceSection(assessmentId, [
          { key: "overview", label: "Overview", icon: LayoutDashboard },
          { key: "progress", label: "Progress", icon: BarChart3 },
        ])
      );
      break;
    default:
      sections.push(
        workspaceSection(assessmentId, [
          { key: "overview", label: "Overview", icon: LayoutDashboard },
        ])
      );
  }

  return sections;
};