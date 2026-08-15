import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <div className="flex size-9 items-center justify-center rounded-xl bg-foreground text-background shadow-sm">
        <ShieldCheck className="size-5" />
      </div>

      <span className="text-lg font-semibold tracking-tight">
        ComplyGuard
      </span>
    </Link>
  );
}
