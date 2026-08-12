export function Footer() {
  return (
    <footer className="border-t border-white/10 px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-slate-400 sm:flex-row">
        <span>© {new Date().getFullYear()} System Designer. Built for architecture thinkers.</span>
        <div className="flex items-center gap-6">
          <a href="#features" className="transition hover:text-cyan-200">
            Features
          </a>
          <a href="#how-it-works" className="transition hover:text-cyan-200">
            Workflow
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-cyan-200"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
