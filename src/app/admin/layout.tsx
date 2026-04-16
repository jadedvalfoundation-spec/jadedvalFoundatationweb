import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "@/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user?.role !== "admin") {
    redirect("/login");
  }

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/admin/users", label: "Users", icon: "👥" },
    { href: "/admin/media", label: "Media", icon: "🖼️" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-gray-900 text-white">
        <div className="flex h-16 items-center border-b border-gray-800 px-6">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-black ring-1 ring-brand/40">
              <Image
                src="/logo.png"
                alt="Jade D'Val Foundation"
                width={36}
                height={36}
                className="h-9 w-9 object-cover"
              />
            </div>
            <span className="font-heading text-sm font-bold">Admin Panel</span>
          </Link>
        </div>

        <nav className="mt-6 px-3">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 w-64 border-t border-gray-800 p-4">
          <div className="mb-3">
            <p className="text-xs font-medium text-white">{session.user?.name}</p>
            <p className="text-xs text-gray-400">{session.user?.email}</p>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
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

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center border-b border-gray-200 bg-white px-6">
          <h1 className="text-sm font-medium text-gray-500">
            Jadedval Foundation — Admin
          </h1>
          <div className="ml-auto flex items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-brand-lighter px-2.5 py-0.5 text-xs font-medium text-brand-darker">
              Admin
            </span>
            <Link
              href="/"
              className="text-xs text-gray-500 hover:text-brand"
            >
              View Site
            </Link>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
