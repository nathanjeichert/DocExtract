export default function NavBar() {
  return (
    <nav className="sticky top-0 z-10 bg-warm-white border-b border-warm-border">
      <div className="mx-auto max-w-3xl flex items-center justify-between px-6 py-3">
        <span className="font-serif text-xl font-bold text-warm-text tracking-tight">
          DocExtract
        </span>
        <div className="flex items-center gap-4 text-sm text-warm-muted">
          <a
            href="https://github.com/nathanjeichert"
            target="_blank"
            rel="noreferrer"
            className="hover:text-warm-accent transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://nathaneichert.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-warm-accent transition-colors"
          >
            Portfolio
          </a>
        </div>
      </div>
    </nav>
  );
}
