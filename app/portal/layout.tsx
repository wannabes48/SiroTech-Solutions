"use client";

import { mainUrl, portalPath } from "@/lib/hosts";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  ReceiptText,
  LifeBuoy,
  MessageSquare,
  Search,
  Bell,
  User,
  Users,
  LogOut,
  Calendar,
  ExternalLink,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { PortalUser, defaultPortalUser } from "@/data/portal-data";
import { SearchModal } from "@/components/portal/shared/SearchModal";
import { NotificationsDropdown } from "@/components/portal/shared/NotificationsDropdown";
import { ConfirmDialog } from "@/components/portal/shared/ConfirmDialog";
import { PortalAutoSync } from "@/components/portal/shared/PortalAutoSync";

const navItems = [
  { label: "Dashboard", href: portalPath(), icon: LayoutDashboard },
  { label: "Projects", href: portalPath("/projects"), icon: FolderKanban },
  { label: "Invoices", href: portalPath("/invoices"), icon: ReceiptText },
  { label: "Support", href: portalPath("/support"), icon: LifeBuoy },
  { label: "Messages", href: portalPath("/messages"), icon: MessageSquare },
];

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<PortalUser>(defaultPortalUser);
  const [searchOpen, setSearchOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const avatarMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/portal/me")
      .then((res) => {
        if (res.status === 401) {
          router.push("/sign-in");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.user) {
          setUser({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            company: data.user.orgName,
            role: data.user.role,
            orgId: data.user.orgId,
            orgRole: data.user.orgRole || "OWNER",
            timezone: data.user.timezone || "Africa/Nairobi",
            avatarUrl: "/media_1791747604286.png",
          });
        }
      })
      .catch(() => {});
  }, [router]);

  // Keyboard shortcut Cmd/Ctrl + K for search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close avatar dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target as Node)) {
        setAvatarMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [signOutConfirmOpen, setSignOutConfirmOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const confirmSignOut = async () => {
    setSigningOut(true);
    try {
      const { signOutAction } = await import("@/app/portal/actions");
      await signOutAction();
    } catch {
      router.push("/sign-in");
    } finally {
      setSigningOut(false);
      setSignOutConfirmOpen(false);
    }
  };

  const handleSignOut = () => {
    setAvatarMenuOpen(false);
    setSignOutConfirmOpen(true);
  };

  const isLinkActive = (href: string) => {
    if (href === portalPath()) {
      return pathname === portalPath();
    }
    if (href === portalPath("/support")) {
      return pathname.startsWith(portalPath("/support")) || pathname.startsWith(portalPath("/tickets"));
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col antialiased">
      {/* Accessibility Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-600 focus:text-white focus:rounded-full focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>

      {/* Global Cmd+K Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Mobile Top Bar */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-rule/80 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Link href={portalPath()} className="flex items-center gap-2" aria-label="SiroTech Portal Home">
            <Logo variant="light" className="h-6 w-auto" />
            <span className="text-[10px] font-bold tracking-wider uppercase bg-sage-100 text-sage-900 border border-sage-300 px-2 py-0.5 rounded-md">
              Portal
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Search Button */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search site (Cmd+K)"
            className="p-2 rounded-xl border border-rule hover:bg-surface text-ink transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Mobile Notifications Bell */}
          <NotificationsDropdown />

          {/* Mobile Avatar Menu */}
          <div className="relative" ref={avatarMenuRef}>
            <button
              type="button"
              onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
              aria-label="Account menu"
              aria-expanded={avatarMenuOpen}
              className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center border border-emerald-300 cursor-pointer"
            >
              {user.name.charAt(0)}
            </button>

            {avatarMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl border border-rule/80 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2 border-b border-rule/60">
                  <div className="text-xs font-bold text-ink truncate">{user.name}</div>
                  <div className="text-[10px] text-muted truncate">{user.company}</div>
                </div>
                <Link
                  href={portalPath("/account?tab=profile")}
                  onClick={() => setAvatarMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-ink hover:bg-surface transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-muted" />
                  <span>Profile</span>
                </Link>
                <Link
                  href={portalPath("/account?tab=team")}
                  onClick={() => setAvatarMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-ink hover:bg-surface transition-colors"
                >
                  <Users className="w-3.5 h-3.5 text-muted" />
                  <span>Team</span>
                </Link>
                <div className="my-1 border-t border-rule/60" />
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex-1 flex flex-row min-w-0">
        {/* Desktop Sidebar (240px, white background, mark + wordmark top, five items with 20px line icons) */}
        <aside
          aria-label="Portal Navigation"
          className="hidden lg:flex flex-col w-[240px] shrink-0 bg-white border-r border-rule/80 h-screen sticky top-0 justify-between p-4 z-30"
        >
          {/* Top Brand & Wordmark */}
          <div>
            <div className="px-3 pt-2 pb-6 border-b border-rule/70">
              <Link href="/" className="inline-block group" aria-label="SiroTech Solutions Home">
                <Logo variant="light" className="h-7 w-auto transition-transform group-hover:scale-[1.02]" />
              </Link>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  Client Portal
                </span>
                <span className="text-[10px] text-muted">v2.4</span>
              </div>
            </div>

            {/* Five Core Items with 20px Line Icons */}
            <nav className="mt-5 space-y-1.5" aria-label="Sidebar Navigation">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isLinkActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all relative ${
                      active
                        ? "bg-sage-100 text-ink shadow-2xs font-bold"
                        : "text-muted hover:text-ink hover:bg-surface"
                    }`}
                  >
                    {/* Emerald left indicator for active item */}
                    {active && (
                      <span
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-emerald-600 rounded-r-full"
                        aria-hidden="true"
                      />
                    )}
                    <Icon className={`w-5 h-5 shrink-0 ${active ? "text-emerald-700" : "text-muted"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Footer Card: "Need help? Book a call" */}
          <div className="space-y-3 pt-4 border-t border-rule/70">
            <div className="p-3.5 rounded-2xl bg-surface border border-rule/80 text-left">
              <div className="flex items-center gap-2 text-xs font-bold text-ink">
                <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Need help?</span>
              </div>
              <p className="text-[11px] text-muted mt-1 leading-relaxed">
                Connect directly with Daniel Siro and our lead technical architects.
              </p>
              <Link
                href="/book"
                className="mt-3 w-full py-1.5 px-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <span>Book a call</span>
              </Link>
            </div>

            {/* Public site & Account links */}
            <div className="px-2 flex items-center justify-between text-[11px] text-muted">
              <Link href={mainUrl()} className="hover:text-ink flex items-center gap-1 transition-colors">
                <ExternalLink className="w-3 h-3" />
                <span>Public site</span>
              </Link>
              <div className="flex items-center gap-2">
                <Link href={portalPath("/account")} className="hover:text-ink transition-colors font-medium">
                  Account
                </Link>
                <span>&bull;</span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="hover:text-red-600 transition-colors font-medium cursor-pointer"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Desktop Top Bar */}
          <header className="hidden lg:flex items-center justify-between px-8 py-3.5 bg-white border-b border-rule/80 sticky top-0 z-30 shadow-xs">
            {/* Page Search (projects, files, invoices, tickets) */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-surface border border-rule/80 hover:border-emerald-600/40 text-muted hover:text-ink text-xs transition-colors cursor-pointer w-72 shadow-2xs"
              >
                <Search className="w-3.5 h-3.5 text-muted" />
                <span className="flex-1 text-left">Search portal records...</span>
                <kbd className="px-1.5 py-0.5 text-[10px] font-bold text-muted bg-white border border-rule rounded">
                  ⌘K
                </kbd>
              </button>

              <div className="flex items-center gap-2 pl-4 border-l border-rule text-xs font-semibold text-muted">
                <span>Org:</span>
                <strong className="text-ink truncate max-w-[200px]">{user.company}</strong>
              </div>
            </div>

            {/* Top Bar Right: Bell, New Ticket, Avatar Menu */}
            <div className="flex items-center gap-3">
              <Link
                href={portalPath("/support/new")}
                className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <span>+ Raise Ticket</span>
              </Link>

              {/* Notification Bell with unread dot */}
              <NotificationsDropdown />

              <div className="h-6 w-px bg-rule/70 mx-1" />

              {/* Avatar menu (Profile, Team, Sign out) */}
              <div className="relative" ref={avatarMenuRef}>
                <button
                  type="button"
                  onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
                  aria-expanded={avatarMenuOpen}
                  aria-label="User account menu"
                  className="flex items-center gap-2.5 p-1 rounded-full hover:bg-surface transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center border border-emerald-300">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left hidden xl:block">
                    <div className="text-xs font-bold text-ink leading-tight">{user.name}</div>
                    <div className="text-[10px] text-muted">{user.orgRole || "Client"}</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-muted hidden xl:block" />
                </button>

                {avatarMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-rule/80 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2 border-b border-rule/60">
                      <div className="text-xs font-bold text-ink truncate">{user.name}</div>
                      <div className="text-[10px] text-muted truncate">{user.email}</div>
                    </div>

                    <Link
                      href={portalPath("/account?tab=profile")}
                      onClick={() => setAvatarMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-ink hover:bg-surface transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-muted" />
                      <span>Profile Settings</span>
                    </Link>

                    <Link
                      href={portalPath("/account?tab=team")}
                      onClick={() => setAvatarMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-ink hover:bg-surface transition-colors"
                    >
                      <Users className="w-3.5 h-3.5 text-muted" />
                      <span>Team Members</span>
                    </Link>

                    <Link
                      href={portalPath("/account?tab=billing")}
                      onClick={() => setAvatarMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-ink hover:bg-surface transition-colors"
                    >
                      <ReceiptText className="w-3.5 h-3.5 text-muted" />
                      <span>Company &amp; Billing</span>
                    </Link>

                    <div className="my-1 border-t border-rule/60" />

                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Main Landmark for Page Content */}
          <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-8">
            <PortalAutoSync intervalMs={20000} />
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Tab Bar (Five items with 20px line icons, aria-current="page") */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-rule/80 px-2 py-2 flex items-center justify-around shadow-lg"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isLinkActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-colors relative ${
                active ? "text-emerald-700 font-bold" : "text-muted hover:text-ink"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${active ? "text-emerald-700 stroke-[2.5]" : "text-muted"}`} />
                {active && (
                  <span
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-emerald-600 rounded-full"
                    aria-hidden="true"
                  />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Warning Constraint: Sign Out Confirmation Dialog */}
      <ConfirmDialog
        isOpen={signOutConfirmOpen}
        title="Sign out of SiroTech Portal?"
        description="Are you sure you want to end your active session? Any unsaved edits, active thread replies, or unsubmitted drafts will be closed."
        confirmLabel="Yes, Sign Out"
        cancelLabel="Stay Signed In"
        isDestructive={true}
        isLoading={signingOut}
        onConfirm={confirmSignOut}
        onCancel={() => setSignOutConfirmOpen(false)}
      />
    </div>
  );
}
