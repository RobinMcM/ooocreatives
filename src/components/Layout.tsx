"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import Session from "supertokens-auth-react/recipe/session";
import { useUserRoles } from "@/lib/useUserRoles";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shows", label: "Our Shows" },
  { href: "/actor-training", label: "Actor Training" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authMenuOpen, setAuthMenuOpen] = useState(false);
  const sessionContext = useSessionContext();
  const sessionExists = !sessionContext.loading && sessionContext.doesSessionExist;
  const authLoading = sessionContext.loading;
  const { roles } = useUserRoles();
  const isAdmin = roles.some((r) => ["admin", "super user", "Admin", "Super User"].includes(r));
  const pathname = usePathname();
  const router = useRouter();
  const authMenuRef = useRef<HTMLDivElement>(null);

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
    try {
      await Session.signOut();
    } catch {
      // signOut failed (e.g. CORS/network) — clear cookies manually
    }
    // Belt-and-suspenders: delete SuperTokens cookies directly so the
    // server stops seeing sFrontToken regardless of signOut outcome
    for (const name of ["sFrontToken", "sAccessToken", "sRefreshToken", "st-last-access-token-update"]) {
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
    }
    // Full reload so React state and SuperTokens context start completely fresh
    window.location.href = "/";
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
                    className="px-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-1 rounded text-ooo-cream hover:bg-ooo-slate transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ooo-accent"
                    aria-label={authMenuOpen ? "Close user menu" : "Open user menu"}
                    aria-haspopup="menu"
                    aria-expanded={authMenuOpen}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.964 0A9 9 0 1112 3a9 9 0 015.982 15.725zM15 9.75A3 3 0 1112 6.75a3 3 0 013 3z"
                      />
                    </svg>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {authMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-ooo-slate bg-ooo-ink/95 backdrop-blur shadow-xl z-20"
                      role="menu"
                      aria-label="User menu"
                    >
                      <div className="px-4 py-3 border-b border-ooo-slate/70">
                        <p className="text-xs uppercase tracking-wide text-ooo-muted">Account</p>
                        <p className="text-sm text-ooo-cream">Signed in</p>
                        {roles.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {roles.map((role) => (
                              <span
                                key={role}
                                className="text-xs px-1.5 py-0.5 rounded bg-ooo-slate text-ooo-accent border border-ooo-accent/30"
                              >
                                {role}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setAuthMenuOpen(false)}
                          className="w-full inline-flex items-center gap-2 text-left px-4 py-3 text-sm text-ooo-muted hover:text-ooo-cream hover:bg-ooo-slate/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ooo-accent"
                          role="menuitem"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3.75 6.75h16.5m-16.5 5.25h16.5m-16.5 5.25h16.5"
                            />
                          </svg>
                          Admin
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full inline-flex items-center gap-2 text-left px-4 py-3 text-sm text-ooo-muted hover:text-ooo-cream hover:bg-ooo-slate/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ooo-accent"
                        role="menuitem"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6.75A2.25 2.25 0 004.5 5.25v13.5A2.25 2.25 0 006.75 21h6.75a2.25 2.25 0 002.25-2.25V15m4.5-3H9m0 0l3-3m-3 3l3 3"
                          />
                        </svg>
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
