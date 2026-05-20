export default function RegisterPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
        <div className="bg-ooo-slate border border-ooo-ink rounded-xl p-12 max-w-md w-full">
          <svg className="w-12 h-12 text-ooo-accent mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="font-display text-3xl font-bold text-ooo-cream mb-3">Registration</h1>
          <p className="text-ooo-muted text-lg">This will be activated soon.</p>
        </div>
      </div>
    </div>
  );
}
