import Link from "next/link";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export function Nav() {
  return (
    <header className="sticky top-0 z-50 px-4 py-4 sm:px-6">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between rounded-2xl border border-white/15 bg-[#060a10]/75 px-4 shadow-[0_18px_55px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:px-6">
        <Link href="/" className="group inline-flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-300/30 bg-cyan-400/15 text-sm font-bold text-cyan-200 shadow-[0_0_30px_rgba(56,189,248,0.35)]">
            SD
          </span>
          <span className="text-sm font-semibold tracking-tight text-white sm:text-base">
            System Designer
          </span>
          <span className="hidden rounded-full border border-emerald-300/25 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-200 sm:inline-flex">
            live
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          <a href="#product-showcase" className="transition hover:text-cyan-200">
            Product
          </a>
          <a href="#features" className="transition hover:text-cyan-200">
            Features
          </a>
          <a href="#how-it-works" className="transition hover:text-cyan-200">
            Workflow
          </a>
          <a href="#get-started" className="transition hover:text-cyan-200">
            Get Started
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Show when="signed-out">
            <SignInButton mode="modal" forceRedirectUrl="/design">
              <button className="rounded-lg border border-transparent px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-white/15 hover:text-white">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal" forceRedirectUrl="/design">
              <button className="rounded-xl bg-linear-to-r from-cyan-300 to-emerald-300 px-4 py-2 text-sm font-semibold text-[#051018] shadow-[0_10px_30px_rgba(16,185,129,0.35)] transition hover:brightness-110">
                Get Started
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Link
              href="/design"
              className="rounded-xl bg-linear-to-r from-cyan-300 to-emerald-300 px-4 py-2 text-sm font-semibold text-[#051018] shadow-[0_10px_30px_rgba(16,185,129,0.35)] transition hover:brightness-110"
            >
              Go to App
            </Link>
            <UserButton />
          </Show>
        </div>
      </div>
    </header>
  );
}
