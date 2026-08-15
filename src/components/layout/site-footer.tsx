import { Logo } from "@/components/brand/logo";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <Logo />

        <p className="text-sm text-muted-foreground">
          Engineering evidence for continuous compliance.
        </p>
      </div>
    </footer>
  );
}
