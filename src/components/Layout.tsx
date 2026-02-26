import { Outlet, NavLink } from 'react-router-dom';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/shows', label: 'Our Shows' },
  { to: '/register', label: 'Register' },
  { to: '/admin', label: 'Admin' },
];

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-ooo-ink border-b border-ooo-slate sticky top-0 z-10">
        <nav className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <NavLink
            to="/"
            className="font-display text-xl font-semibold text-ooo-cream hover:text-ooo-accent transition-colors"
          >
            Out of Office Creatives
          </NavLink>
          <ul className="flex gap-6">
            {navLinks.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-ooo-accent'
                        : 'text-ooo-muted hover:text-ooo-cream'
                    }`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
