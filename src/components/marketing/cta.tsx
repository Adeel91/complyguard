import Link from "next/link";

export function CTA() {
  return (
    <section className="bg-[#ef3f46]">
      <div className="mx-auto max-w-[1500px] px-5 py-16 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/60">
              Real repository analysis
            </p>

            <h2 className="mt-3 max-w-3xl text-3xl font-semibold leading-[1.05] tracking-[-0.05em] text-white sm:text-4xl">
              Put actual source code under the scanner.
            </h2>
          </div>

          <Link
            href="/scan"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-black transition hover:bg-white/90"
          >
            Open scanner
            <span className="ml-2">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
