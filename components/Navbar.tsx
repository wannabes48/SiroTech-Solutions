"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Menu, X, ArrowRight, Search } from "lucide-react";
import { navItems, navConfig, type NavItem } from "@/content/nav";
import { SearchCommandDialog } from "@/components/search/SearchCommandDialog";
import { Logo } from "@/components/brand/Logo";

export default function Navbar({
  isHeroOverlay,
}: {
  isHeroOverlay?: boolean;
}) {
  const pathname = usePathname();
  const isHome = isHeroOverlay !== undefined ? isHeroOverlay : pathname === "/";

  // Search command dialog state
  const [searchOpen, setSearchOpen] = useState(false);

  // Dropdown states
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mobile menu drawer
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  // Hide on scroll down, show on scroll up
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 120) {
        if (currentScrollY > lastScrollY.current && currentScrollY - lastScrollY.current > 10) {
          setIsVisible(false); // scrolling down
        } else if (lastScrollY.current - currentScrollY > 10) {
          setIsVisible(true); // scrolling up
        }
      } else {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on outside click or Esc key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setActiveDropdown(null);
        setMobileOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  const toggleDropdown = (label: string) => {
    setActiveDropdown((prev) => (prev === label ? null : label));
  };

  // Visual appearance
  const pillClasses = isHome
    ? "bg-white/15 backdrop-blur-md border border-white/20 text-white shadow-xs"
    : "bg-white/95 backdrop-blur-md border border-rule text-ink shadow-sm";

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-transform duration-300 pt-5 px-4 sm:px-6 lg:px-10 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="max-w-[1248px] mx-auto">
          <div
            ref={dropdownRef}
            className={`flex items-center justify-between h-16 px-4 sm:px-6 rounded-full transition-colors relative ${pillClasses}`}
          >
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500 rounded-lg group"
              aria-label="SiroTech Solutions Home"
            >
              <Logo
                variant={isHome ? "dark" : "light"}
                className="h-8 sm:h-9 w-auto transition-transform group-hover:scale-[1.02]"
              />
            </Link>

            {/* Desktop Navigation Links: fluid flex-1 layout preventing collisions */}
            <nav className="hidden lg:flex items-center justify-center gap-0.5 xl:gap-1.5 flex-1 min-w-0 mx-2">
              {navItems.map((item) => {
                const isChildActive = item.children?.some(
                  (c) => pathname === c.href || pathname.startsWith(c.href + "/")
                );
                const isActive = pathname === item.href || isChildActive;
                const hasChildren = !!item.children;
                const isOpen = activeDropdown === item.label;

                if (hasChildren) {
                  return (
                    <div key={item.label} className="relative">
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => toggleDropdown(item.label)}
                        className={`relative flex items-center gap-1 text-xs font-semibold px-2.5 xl:px-3 py-1.5 rounded-full transition-colors cursor-pointer whitespace-nowrap ${
                          isActive
                            ? isHome
                              ? "text-ink"
                              : "text-ink"
                            : isHome
                            ? "text-white/85 hover:text-white hover:bg-white/10"
                            : "text-body hover:text-ink hover:bg-surface"
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeNavPill"
                            className={`absolute inset-0 rounded-full -z-10 ${
                              isHome ? "bg-white shadow-xs" : "bg-sage-100 text-sage-800"
                            }`}
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                        <span>{item.label}</span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 opacity-70 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.98 }}
                            transition={{ duration: 0.16 }}
                            className="absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50 w-72 sm:w-80"
                          >
                            <div className="bg-white rounded-2xl shadow-xl border border-rule/80 p-2.5 text-ink flex flex-col gap-1 ring-1 ring-black/5">
                              {item.children?.map((child) => {
                                const isDropActive =
                                  pathname === child.href ||
                                  pathname.startsWith(child.href + "/");
                                return (
                                  <Link
                                    key={child.label}
                                    href={child.href}
                                    onClick={() => setActiveDropdown(null)}
                                    className={`p-3 rounded-xl transition-colors block text-left ${
                                      isDropActive
                                        ? "bg-sage-100 text-sage-800"
                                        : "hover:bg-surface"
                                    }`}
                                  >
                                    <div className="text-xs font-bold text-ink">
                                      {child.label}
                                    </div>
                                    {child.description && (
                                      <p className="text-[11px] text-muted line-clamp-1 mt-0.5 font-normal">
                                        {child.description}
                                      </p>
                                    )}
                                  </Link>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`relative text-xs font-semibold px-2.5 xl:px-3 py-1.5 rounded-full transition-colors whitespace-nowrap ${
                      isActive
                        ? isHome
                          ? "text-ink"
                          : "text-ink"
                        : isHome
                        ? "text-white/85 hover:text-white hover:bg-white/10"
                        : "text-body hover:text-ink hover:bg-surface"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNavPill"
                        className={`absolute inset-0 rounded-full -z-10 ${
                          isHome ? "bg-white shadow-xs" : "bg-sage-100"
                        }`}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Side CTAs */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Search Trigger Button */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search site (Cmd+K)"
                title="Search site (⌘K)"
                className={`p-2 rounded-full transition-colors cursor-pointer flex items-center justify-center ${
                  isHome
                    ? "text-white/90 hover:text-white hover:bg-white/15"
                    : "text-ink/80 hover:text-ink hover:bg-surface"
                }`}
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Feature-flagged Sign In pill */}
              {navConfig.features.showSignIn && (
                <Link
                  href={navConfig.signInCta.href}
                  className={`hidden md:inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    isHome
                      ? "bg-white/20 text-white hover:bg-white/30"
                      : "bg-surface text-ink hover:bg-rule"
                  }`}
                >
                  {navConfig.signInCta.label}
                </Link>
              )}

              {/* Get a quote CTA button */}
              <Link
                href={navConfig.quoteCta.href}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-sage-300 text-ink text-xs font-bold uppercase tracking-wider hover:bg-sage-100 transition-colors shadow-xs"
              >
                <span>{navConfig.quoteCta.label}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              {/* Mobile Hamburger Button */}
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation drawer"
                className={`lg:hidden p-2 rounded-full transition-colors cursor-pointer ${
                  isHome ? "text-white hover:bg-white/10" : "text-ink hover:bg-surface"
                }`}
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden flex justify-end"
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="w-full max-w-sm bg-bg h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto"
            >
              <div>
                {/* Drawer Top Header */}
                <div className="flex items-center justify-between pb-6 border-b border-rule">
                  <Link
                    href="/"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center"
                    aria-label="SiroTech Solutions Home"
                  >
                    <Logo variant="light" className="h-8 w-auto" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    aria-label="Close navigation drawer"
                    className="p-2 rounded-full bg-surface text-ink hover:bg-rule transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Nav Links Accordion */}
                <div className="py-6 space-y-2">
                  {navItems.map((item) => {
                    if (item.children) {
                      const isExpanded = mobileExpanded === item.label;
                      return (
                        <div key={item.label} className="rounded-xl overflow-hidden">
                          <button
                            type="button"
                            onClick={() =>
                              setMobileExpanded(isExpanded ? null : item.label)
                            }
                            className="w-full flex items-center justify-between p-3 text-sm font-semibold text-ink hover:bg-surface rounded-xl transition-colors"
                          >
                            <span>{item.label}</span>
                            <ChevronDown
                              className={`w-4 h-4 transition-transform duration-200 ${
                                isExpanded ? "rotate-180 text-sage-700" : "text-muted"
                              }`}
                            />
                          </button>
                          {isExpanded && (
                            <div className="pl-4 pr-2 py-2 space-y-1 bg-surface/60 rounded-xl mt-1">
                              {item.children.map((child) => (
                                <Link
                                  key={child.label}
                                  href={child.href}
                                  onClick={() => setMobileOpen(false)}
                                  className="block py-2 text-xs font-medium text-body hover:text-ink transition-colors"
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }

                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`block p-3 rounded-xl text-sm font-semibold transition-colors ${
                          isActive
                            ? "bg-sage-100 text-sage-800"
                            : "text-ink hover:bg-surface"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}

                  <Link
                    href="/contact"
                    onClick={() => setMobileOpen(false)}
                    className={`block p-3 rounded-xl text-sm font-semibold transition-colors ${
                      pathname === "/contact"
                        ? "bg-sage-100 text-sage-800"
                        : "text-ink hover:bg-surface"
                    }`}
                  >
                    Contact Us
                  </Link>
                </div>
              </div>

              {/* Drawer Bottom Actions */}
              <div className="pt-6 border-t border-rule space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    setSearchOpen(true);
                  }}
                  className="w-full py-3 rounded-full bg-surface border border-rule text-ink text-center text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-sage-100 transition-colors"
                >
                  <Search className="w-4 h-4 text-muted" />
                  <span>Search Knowledge Base</span>
                </button>

                <Link
                  href={navConfig.quoteCta.href}
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-3.5 rounded-full bg-sage-300 text-ink text-center text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-sage-100 transition-colors shadow-sm"
                >
                  <span>{navConfig.quoteCta.label}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {navConfig.features.showSignIn && (
                  <Link
                    href={navConfig.signInCta.href}
                    onClick={() => setMobileOpen(false)}
                    className="w-full py-3 rounded-full bg-surface text-ink text-center text-xs font-semibold hover:bg-rule transition-colors block"
                  >
                    {navConfig.signInCta.label}
                  </Link>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cmd+K Search Command Dialog Modal */}
      <SearchCommandDialog
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </>
  );
}
