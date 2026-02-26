import { useState, useEffect } from 'react';

const slides = [
  { id: 'faustus', title: 'Dr Faustus', imageUrl: 'https://picsum.photos/seed/faustus/1200/600' },
  { id: 'womeninwar', title: 'Women in War', imageUrl: 'https://picsum.photos/seed/womeninwar/1200/600' },
  { id: 'ripper', title: 'Ripper', imageUrl: 'https://picsum.photos/seed/ripper/1200/600' },
  { id: 'spread', title: 'Spread', imageUrl: 'https://picsum.photos/seed/spread/1200/600' },
];

const AUTOPLAY_MS = 5500;

export function Carousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative w-full overflow-hidden flex justify-center" aria-label="Featured shows">
      <div className="relative aspect-[2/1] min-h-[280px] max-h-[50vh] w-full max-w-6xl bg-ooo-slate mx-auto">
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className="absolute inset-0 transition-opacity duration-500 ease-out"
            style={{
              opacity: i === current ? 1 : 0,
              pointerEvents: i === current ? 'auto' : 'none',
            }}
            aria-hidden={i !== current}
          >
            <img
              src={slide.imageUrl}
              alt=""
              className="h-full w-full object-cover"
              loading={i === 0 ? 'eager' : 'lazy'}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ooo-black/90 via-ooo-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-center">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-ooo-cream">
                {slide.title}
              </h2>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 md:bottom-6 flex gap-2 justify-center">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrent(i)}
            className={`min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 rounded-full transition-colors flex items-center justify-center p-2 md:p-0 ${
              i === current ? 'bg-ooo-accent w-4 h-4 md:w-6 md:h-2' : 'bg-ooo-muted/60 hover:bg-ooo-muted w-2 h-2 md:h-2 md:w-2'
            }`}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === current ? 'true' : undefined}
          />
        ))}
      </div>

      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-between px-2 md:px-2 pointer-events-none md:pointer-events-auto">
        <button
          type="button"
          onClick={() => setCurrent((c) => (c - 1 + slides.length) % slides.length)}
          className="min-h-[44px] min-w-[44px] p-2 rounded-full bg-ooo-black/50 text-ooo-cream hover:bg-ooo-accent transition-colors pointer-events-auto flex items-center justify-center"
          aria-label="Previous slide"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => setCurrent((c) => (c + 1) % slides.length)}
          className="min-h-[44px] min-w-[44px] p-2 rounded-full bg-ooo-black/50 text-ooo-cream hover:bg-ooo-accent transition-colors pointer-events-auto flex items-center justify-center"
          aria-label="Next slide"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </section>
  );
}
