"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "Accueil" },
  { href: "/dashboard/profil", label: "Profil" },
  { href: "/dashboard/matches", label: "Matches" },
  { href: "/dashboard/simulateur", label: "Simulateur" },
  { href: "/dashboard/confidentialite", label: "Confidentialité" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex bg-ice">
      <aside className="hidden md:flex w-64 shrink-0 bg-ink text-white flex-col p-6 sticky top-0 h-screen">
        <div className="font-heading text-xl font-extrabold mb-1">
          Job<span className="text-sea2">Swap</span>
        </div>
        <div className="text-mist font-mono text-[11px] mb-8">
          Espace salarié
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2.5 rounded-sm text-sm font-medium transition-colors ${
                  active
                    ? "bg-sea2/15 text-[#5FD9B4] border border-sea2/30"
                    : "text-mist hover:text-white hover:bg-white/5"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={logout}
          className="mt-auto text-xs text-fog hover:text-white text-left pt-6 border-t border-white/10 mt-6"
        >
          Se déconnecter
        </button>
      </aside>

      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 md:p-10 max-w-4xl w-full mx-auto pb-24 md:pb-10">
          {children}
        </main>

        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-ice2 flex justify-around py-2">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-[11px] px-2 py-1.5 rounded-sm ${
                  active ? "text-sea font-semibold" : "text-fog"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
