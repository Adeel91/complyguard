import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-[#f5f5f3]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-[1500px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="flex items-center gap-3"
        >
          <div className="relative flex size-9 items-center justify-center overflow-hidden rounded-xl bg-[#111214] text-white">
            <div className="absolute inset-[3px] rounded-[9px] border border-white/10" />
            <span className="relative text-[11px] font-black tracking-[-0.08em]">
              CG
            </span>
          </div>

          <div>
            <div className="text-sm font-bold tracking-[-0.035em]">
              ComplyGuard
            </div>

            <div className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.18em] text-black/35">
              Source compliance intelligence
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/#product"
            className="rounded-lg px-3 py-2 text-xs font-medium text-black/50 transition hover:bg-black/[0.04] hover:text-black"
          >
            Product
          </Link>

          <Link
            href="/#frameworks"
            className="rounded-lg px-3 py-2 text-xs font-medium text-black/50 transition hover:bg-black/[0.04] hover:text-black"
          >
            Frameworks
          </Link>

          <Link
            href="/#workflow"
            className="rounded-lg px-3 py-2 text-xs font-medium text-black/50 transition hover:bg-black/[0.04] hover:text-black"
          >
            Workflow
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="https://github.com/Adeel91/complyguard"
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-xl border border-black/10 bg-white px-4 py-2 text-xs font-semibold text-black/65 transition hover:border-black/20 hover:text-black sm:block"
          >
            GitHub
          </a>

          <Link
            href="/scan"
            className="rounded-xl bg-[#111214] px-4 py-2 text-xs font-semibold text-white transition hover:bg-black"
          >
            Open scanner
          </Link>
        </div>
      </div>
    </header>
  );
}
