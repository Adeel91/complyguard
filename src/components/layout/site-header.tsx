import Link from "next/link";

import { Logo } from "@/components/brand/logo";

function GitHubIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .7a11.3 11.3 0 0 0-3.57 22c.56.1.77-.24.77-.54v-2.1c-3.14.68-3.8-1.34-3.8-1.34-.5-1.3-1.25-1.65-1.25-1.65-1.03-.7.08-.69.08-.69 1.13.08 1.73 1.16 1.73 1.16 1.01 1.73 2.65 1.23 3.3.94.1-.73.4-1.23.72-1.52-2.5-.29-5.14-1.25-5.14-5.58 0-1.23.44-2.24 1.16-3.03-.12-.28-.5-1.43.11-2.98 0 0 .95-.3 3.1 1.16A10.8 10.8 0 0 1 12 6.16c.96 0 1.92.13 2.82.38 2.15-1.46 3.1-1.16 3.1-1.16.62 1.55.23 2.7.12 2.98.72.79 1.16 1.8 1.16 3.03 0 4.34-2.64 5.29-5.15 5.57.4.35.76 1.04.76 2.1v3.11c0 .3.2.65.78.54A11.3 11.3 0 0 0 12 .7Z" />
    </svg>
  );
}

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-gradient-to-b from-[#08070a] via-[#08070a]/85 to-transparent pb-8 pt-3">
      <div className="cg-container flex h-[58px] items-center justify-between">
        <Link href="/">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 text-[11px] text-white/38 md:flex">
          <Link
            href="/#engine"
            className="transition hover:text-white"
          >
            Engine
          </Link>

          <Link
            href="/#mapping"
            className="transition hover:text-white"
          >
            Mapping
          </Link>

          <Link
            href="/#pipeline"
            className="transition hover:text-white"
          >
            Pipeline
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com/Adeel91/complyguard"
            target="_blank"
            rel="noreferrer"
            className="text-white/36 transition hover:text-white"
            aria-label="GitHub"
          >
            <GitHubIcon />
          </a>

          <Link
            href="/scan"
            className="text-[11px] font-semibold text-white transition hover:text-[#c6b4ff]"
          >
            Scan repository →
          </Link>
        </div>
      </div>
    </header>
  );
}
