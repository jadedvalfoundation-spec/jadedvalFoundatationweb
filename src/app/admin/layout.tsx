import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "@/auth";
import { isAdminRole } from "@/models/User";
import AdminNav from "@/components/admin/AdminNav";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  roles: string[];
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin/dashboard",    label: "Dashboard",      icon: "📊", roles: ["super_admin","admin","finance","support"] },
  { href: "/admin/admins",       label: "Admin Users",    icon: "🔑", roles: ["super_admin","admin"] },
  { href: "/admin/programs",     label: "Programs",       icon: "📋", roles: ["super_admin","admin"] },
  { href: "/admin/projects",     label: "Projects",       icon: "🚀", roles: ["super_admin","admin"] },
  { href: "/admin/finance",      label: "Finance",        icon: "💰", roles: ["super_admin","admin","finance"] },
  { href: "/admin/donations",    label: "Donations",      icon: "🧾", roles: ["super_admin","finance"] },
  { href: "/admin/requisitions", label: "Requisitions",   icon: "📝", roles: ["super_admin","admin","finance"] },
  { href: "/admin/blog",         label: "Blog",           icon: "📰", roles: ["super_admin","admin","support"] },
  { href: "/admin/impact",       label: "Impact & Stories", icon: "🌟", roles: ["super_admin","admin","support"] },
  { href: "/admin/website-info", label: "Website Info",   icon: "🌐", roles: ["super_admin","admin","support"] },
  { href: "/admin/bank-accounts", label: "Bank Accounts", icon: "🏦", roles: ["super_admin"] },
  { href: "/admin/requests",     label: "Requests",       icon: "📨", roles: ["super_admin","admin"] },
  { href: "/admin/users",        label: "All Users",      icon: "👥", roles: ["super_admin","admin"] },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";

  // Login page renders without sidebar or auth check (avoids redirect loop)
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const session = await auth();

  if (!session || !isAdminRole(session.user?.role ?? "")) {
    redirect("/admin/login");
  }

  const role = session.user.role ?? "";
  const visibleNav = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="flex w-64 flex-shrink-0 flex-col bg-gray-900 text-white">
        {/* Brand */}
        <div className="flex h-16 items-center gap-3 border-b border-gray-800 px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-black ring-1 ring-brand/40">
            <Image src="/logo.png" alt="JD" width={36} height={36} className="h-9 w-9 object-cover" />
          </div>
          <span className="font-heading text-sm font-bold leading-tight">
            Admin Panel
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <AdminNav items={visibleNav} />
        </nav>

        {/* User footer */}
        <div className="border-t border-gray-800 p-4">
          <p className="truncate text-xs font-medium text-white">{session.user?.name}</p>
          <p className="truncate text-xs text-gray-400">{session.user?.email}</p>
          <p className="mt-1 text-xs capitalize text-brand">{role.replace("_", " ")}</p>
          <form
            className="mt-3"
            action={async () => {
              "use server";
              await signOut({ redirect: false });
              redirect("/admin/login");
            }}
          >
            <button
              type="submit"
              className="w-full rounded-md bg-gray-800 py-1.5 text-xs text-gray-300 transition-colors hover:bg-red-900 hover:text-white"
            >
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center border-b border-gray-200 bg-white px-6">
          <h1 className="text-sm font-medium text-gray-500">Jadedval Foundation — Admin</h1>
          <div className="ml-auto flex items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-brand-lighter px-2.5 py-0.5 text-xs font-medium capitalize text-brand-darker">
              {role.replace("_", " ")}
            </span>
            <Link href="/" className="text-xs text-gray-500 hover:text-brand">
              View Site ↗
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
