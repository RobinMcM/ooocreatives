import Link from "next/link";

const adminSections = [
  {
    href: "/admin/carousel",
    label: "Carousel",
    description: "Manage the homepage image carousel — add, edit, and remove slides.",
  },
  {
    href: "/admin/shows",
    label: "Shows",
    description: "Coming soon — manage show listings, dates, and descriptions.",
    disabled: true,
  },
  {
    href: "/admin/actors",
    label: "Actor Profiles",
    description: "Coming soon — manage actor bios and headshots.",
    disabled: true,
  },
];

export default function Admin() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="font-display text-4xl font-bold text-ooo-cream mb-2">Admin</h1>
      <p className="text-ooo-muted mb-10">Manage shows and content.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {adminSections.map(({ href, label, description, disabled }) =>
          disabled ? (
            <div
              key={href}
              className="bg-ooo-slate border border-ooo-ink rounded-lg p-6 opacity-40 cursor-not-allowed"
            >
              <h2 className="font-display text-xl font-bold text-ooo-cream mb-1">{label}</h2>
              <p className="text-sm text-ooo-muted">{description}</p>
            </div>
          ) : (
            <Link
              key={href}
              href={href}
              className="bg-ooo-slate border border-ooo-ink rounded-lg p-6 hover:border-ooo-accent/60 transition-colors group"
            >
              <h2 className="font-display text-xl font-bold text-ooo-cream mb-1 group-hover:text-ooo-accent transition-colors">
                {label}
              </h2>
              <p className="text-sm text-ooo-muted">{description}</p>
            </Link>
          )
        )}
      </div>
    </div>
  );
}
