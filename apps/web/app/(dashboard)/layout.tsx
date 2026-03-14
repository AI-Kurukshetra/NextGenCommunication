import { SidebarShell } from "@/components/dashboard/sidebar-shell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-[radial-gradient(circle_at_88%_0%,rgba(34,197,94,0.08),transparent_33%),radial-gradient(circle_at_0%_100%,rgba(14,165,233,0.08),transparent_38%)] lg:grid-cols-[300px_1fr]">
      <SidebarShell />
      <main className="p-5 lg:p-8">{children}</main>
    </div>
  );
}
