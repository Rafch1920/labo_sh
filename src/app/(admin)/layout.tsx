import Link from "next/link";
import {
  Shield,
  Users,
  BarChart3,
  ScrollText,
  Settings,
  Wrench,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{
        background: "radial-gradient(ellipse at 20% 30%, rgba(217,119,6,0.06) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(245,158,11,0.04) 0%, transparent 45%), #fffbeb",
      }}
    >
      {/* Top shimmer */}
      <div className="fixed top-0 left-0 right-0 h-[1px] z-50 overflow-hidden pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(217,119,6,0.4), transparent)",
            animation: "shimmer-line 3s ease-in-out infinite",
          }}
        />
      </div>

      <header className="relative z-10 border-b border-amber-900/8 bg-white/70 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/admin/users" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center shadow-sm">
              <Shield className="w-[18px] h-[18px] text-amber-100" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-amber-900">
              Administration
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            <NavLink href="/admin/users" icon={Users} label="Utilisateurs" />
            <NavLink href="/admin/analytics" icon={BarChart3} label="Analytiques" />
            <NavLink href="/admin/audit-logs" icon={ScrollText} label="Audit" />
            <NavLink href="/admin/config" icon={Settings} label="Configuration" />
            <NavLink href="/admin/fix-docs" icon={Wrench} label="Documents" />
            <div className="w-px h-5 bg-amber-200 mx-2" />
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-amber-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                title="Déconnexion"
              >
                <Users className="w-4 h-4" />
              </button>
            </form>
          </nav>
        </div>
      </header>

      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {children}
      </main>
    </div>
  );
}

function NavLink({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-amber-700 hover:text-amber-900 hover:bg-amber-50/70 transition-all"
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
