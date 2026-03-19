export default function Footer() {
  return (
    <footer className="border-t border-warm-border py-6">
      <p className="text-center text-xs text-warm-dim">
        Built by{" "}
        <a
          href="https://nathaneichert.com"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-warm-muted transition-colors"
        >
          Nathan Eichert
        </a>
      </p>
    </footer>
  );
}
