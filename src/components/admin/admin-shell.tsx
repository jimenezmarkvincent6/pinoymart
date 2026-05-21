"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Boxes,
  Layers,
  Loader2,
  LogOut,
  MapPin,
  Megaphone,
  Menu,
  ReceiptText,
  Settings,
  X,
} from "lucide-react";
import { Logo } from "@/components/shop/logo";
import { AuthProvider, useAuth } from "@/lib/firebase/auth-context";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/products", label: "Products", icon: Boxes },
  { href: "/admin/orders", label: "Orders", icon: ReceiptText },
  { href: "/admin/categories", label: "Categories", icon: Layers },
  { href: "/admin/branches", label: "Branches", icon: MapPin },
  { href: "/admin/promos", label: "Promos", icon: Megaphone },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

const LOGIN_PATH = "/admin/login";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminShellInner>{children}</AdminShellInner>
    </AuthProvider>
  );
}

function AdminShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isSuperAdmin, ready, signOut } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isLoginPage = pathname === LOGIN_PATH;

  useEffect(() => {
    if (!ready) return;
    if (isLoginPage) {
      if (user && isSuperAdmin) router.replace("/admin");
      return;
    }
    if (!user || !isSuperAdmin) router.replace(LOGIN_PATH);
  }, [ready, user, isSuperAdmin, isLoginPage, router]);

  // Close drawer whenever the route changes
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Close drawer on Escape key
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  // Prevent body scroll when drawer is open on mobile
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [drawerOpen]);

  if (!ready) return <FullScreenLoader />;

  if (isLoginPage) {
    return (
      <div className="grid min-h-screen place-items-center bg-secondary/30 p-4">
        {children}
      </div>
    );
  }

  if (!user || !isSuperAdmin) return <FullScreenLoader />;

  return (
    <div className="flex min-h-screen flex-col bg-secondary/30 md:flex-row">
      {/* Mobile backdrop */}
      {drawerOpen && (
        <button
          aria-label="Close menu"
          onClick={() => setDrawerOpen(false)}
          className="fixed inset-0 z-40 bg-foreground/50 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar — slides in on mobile, static on desktop */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 transform flex-col border-r border-[hsl(var(--brand-green-border))] bg-brand-green-gradient text-white shadow-2xl transition-transform duration-200 md:relative md:w-60 md:translate-x-0 md:shadow-none",
          drawerOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
        aria-label="Admin navigation"
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div>
            <Logo variant="on-dark" showTagline={false} />
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-white/70">
              Admin Console
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
            className="grid h-9 w-9 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {nav.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-white/15 text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-1 border-t border-[hsl(var(--brand-green-border))] p-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Back to shop
          </Link>
          <button
            onClick={async () => {
              await signOut();
              router.replace(LOGIN_PATH);
            }}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/85 px-3 py-3 backdrop-blur md:px-8">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-secondary md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pinoy Mart
            </div>
            <div className="truncate text-base font-bold">Admin Dashboard</div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium">
                {user.displayName || "Super Admin"}
              </div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
            </div>
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {(user.email?.[0] ?? "A").toUpperCase()}
            </div>
          </div>
        </header>
        <main className="px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}

function FullScreenLoader() {
  return (
    <div className="grid min-h-screen place-items-center bg-secondary/30">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm">Loading admin…</p>
      </div>
    </div>
  );
}
