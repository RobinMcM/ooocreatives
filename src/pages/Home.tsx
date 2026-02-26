import { Carousel } from '../components/Carousel';

export function Home() {
  return (
    <div>
      <Carousel />
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-display text-5xl md:text-6xl font-bold text-ooo-cream mb-6">
            Out of Office Creatives
          </h1>
          <p className="text-xl text-ooo-muted max-w-2xl mx-auto mb-8">
            Theatre that doesn’t clock out. We make work that’s bleak, sharp, and
            a little bit wrong—exactly like your inbox on a Monday.
          </p>
          <p className="text-ooo-muted">
            No corporate retreats. No trust falls. Just good, dark fun.
          </p>
        </div>
      </section>
      <section className="border-t border-ooo-slate py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-2xl text-ooo-cream mb-4">
            What we do
          </h2>
          <p className="text-ooo-muted">
            Shows, readings, and the occasional existential crisis—all in one
            place. Browse what’s on, register to stay in the loop, or drop by
            and say hello.
          </p>
        </div>
      </section>
    </div>
  );
}
