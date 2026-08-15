import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Logo />

        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <Link href="/#frameworks" className="transition hover:text-foreground">
            Frameworks
          </Link>

          <Link href="/#workflow" className="transition hover:text-foreground">
            Workflow
          </Link>

          <Link href="/dashboard" className="transition hover:text-foreground">
            Dashboard
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "rounded-xl",
            )}
          >
            <span className="text-xs font-semibold">GH</span>
          </a>

          <Link
            href="/scan"
            className={buttonVariants({ variant: "default" })}
          >
            Scan project
          </Link>
        </div>
      </div>
    </header>
  );
}
