const placeholderShows = [
  {
    id: '1',
    title: 'The Exit Interview',
    description: 'A comedy about layoffs, severance, and the things we leave in our desk drawers.',
    date: 'TBA',
  },
  {
    id: '2',
    title: 'Out of Office (Until Further Notice)',
    description: 'One person. One inbox. Zero hope. An evening of automated replies and real despair.',
    date: 'TBA',
  },
  {
    id: '3',
    title: 'Stand-Up: Performance Review',
    description: 'They said “bring your whole self to work.” We did. HR is still writing it up.',
    date: 'TBA',
  },
];

export function OurShows() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="font-display text-4xl font-bold text-ooo-cream mb-2">
        Our Shows
      </h1>
      <p className="text-ooo-muted mb-12">
        Dark humour, sharp writing, and the kind of catharsis only theatre can
        provide.
      </p>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {placeholderShows.map((show) => (
          <article
            key={show.id}
            className="bg-ooo-slate border border-ooo-ink rounded-lg p-6 hover:border-ooo-accent/50 transition-colors"
          >
            <span className="text-xs text-ooo-accent uppercase tracking-wider">
              {show.date}
            </span>
            <h2 className="font-display text-xl font-semibold text-ooo-cream mt-2 mb-3">
              {show.title}
            </h2>
            <p className="text-ooo-muted text-sm">{show.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
