"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shows", label: "Our Shows" },
  { href: "/auth", label: "Account" },
  { href: "/admin", label: "Admin" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-ooo-ink border-b border-ooo-slate sticky top-0 z-10">
        <nav className="max-w-6xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between gap-4">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="font-display text-lg md:text-xl font-semibold text-ooo-cream hover:text-ooo-accent transition-colors shrink-0"
          >
            Out of Office Creatives
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden p-2 -mr-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded text-ooo-cream hover:bg-ooo-slate"
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
        </nav>
        {menuOpen && (
          <div className="md:hidden border-t border-ooo-slate bg-ooo-ink">
            <ul className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setMenuOpen(false)}
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
            </ul>
          </div>
        )}
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
