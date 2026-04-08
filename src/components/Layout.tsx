"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Session from "supertokens-auth-react/recipe/session";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shows", label: "Our Shows" },
  { href: "/admin", label: "Admin" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authMenuOpen, setAuthMenuOpen] = useState(false);
  const [sessionExists, setSessionExists] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const authMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const exists = await Session.doesSessionExist();
        if (mounted) {
          setSessionExists(exists);
        }
      } finally {
        if (mounted) {
          setAuthLoading(false);
        }
      }
    };

    void checkSession();

    return () => {
      mounted = false;
    };
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!authMenuRef.current?.contains(event.target as Node)) {
        setAuthMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAuthMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = async () => {
    await Session.signOut();
    setSessionExists(false);
    setAuthMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const closeAllMenus = () => {
    setMenuOpen(false);
    setAuthMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-ooo-ink border-b border-ooo-slate sticky top-0 z-10">
        <nav className="max-w-6xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between gap-4">
          <Link
            href="/"
            onClick={closeAllMenus}
            className="font-display text-lg md:text-xl font-semibold text-ooo-cream hover:text-ooo-accent transition-colors shrink-0"
          >
            Out of Office Creatives
          </Link>
          <div className="flex items-center gap-2 md:gap-4">
            <ul className="hidden md:flex gap-6">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={`text-sm font-medium transition-colors ${
                      pathname === href ? "text-ooo-accent" : "text-ooo-muted hover:text-ooo-cream"
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="relative" ref={authMenuRef}>
              {authLoading ? (
                <div className="min-h-[44px] min-w-[44px] rounded animate-pulse bg-ooo-slate/50" />
              ) : sessionExists ? (
                <>
                  <button
                    type="button"
                    onClick={() => setAuthMenuOpen((open) => !open)}
                    className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded text-ooo-cream hover:bg-ooo-slate transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ooo-accent"
                    aria-label={authMenuOpen ? "Close user menu" : "Open user menu"}
                    aria-haspopup="menu"
                    aria-expanded={authMenuOpen}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 14a4 4 0 10-8 0m8 0a4 4 0 01-8 0m8 0v1a3 3 0 01-3 3H11a3 3 0 01-3-3v-1m8 0H8"
                      />
                    </svg>
                  </button>
                  {authMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-48 bg-ooo-ink border border-ooo-slate rounded-md shadow-lg py-1 z-20"
                      role="menu"
                      aria-label="User menu"
                    >
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-ooo-muted hover:text-ooo-cream hover:bg-ooo-slate/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ooo-accent"
                        role="menuitem"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href="/auth"
                  onClick={() => setAuthMenuOpen(false)}
                  className={`px-4 py-2 min-h-[44px] inline-flex items-center justify-center rounded text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ooo-accent ${
                    pathname === "/auth"
                      ? "text-ooo-accent bg-ooo-slate/40"
                      : "text-ooo-cream border border-ooo-slate hover:bg-ooo-slate"
                  }`}
                  aria-label="Sign in"
                >
                  Sign In
                </Link>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setMenuOpen((o) => !o);
                setAuthMenuOpen(false);
              }}
              className="md:hidden p-2 -mr-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded text-ooo-cream hover:bg-ooo-slate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ooo-accent"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </nav>
        {menuOpen && (
          <div className="md:hidden border-t border-ooo-slate bg-ooo-ink">
            <ul className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={closeAllMenus}
                    className={`block py-3 px-2 text-base font-medium min-h-[44px] flex items-center rounded transition-colors ${
                      pathname === href
                        ? "text-ooo-accent bg-ooo-slate/50"
                        : "text-ooo-muted hover:text-ooo-cream hover:bg-ooo-slate/30"
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
              {/* Auth actions are available from the dedicated right-side auth control. */}
            </ul>
          </div>
        )}
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
