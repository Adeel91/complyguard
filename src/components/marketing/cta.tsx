import Link from "next/link";

export function Cta() {
  return (
    <section className="border-b border-white/[0.08]">
      <div className="cg-container border-x border-white/[0.08] px-8 py-24 text-center md:px-14 md:py-28">
        <div className="cg-eyebrow justify-center">
          Inspect real source
        </div>

        <h2 className="cg-display mx-auto mt-8 max-w-[860px] text-[42px] text-white md:text-[55px]">
          Put a real repository
          <br />
          <span className="text-white/30">
            under evidence.
          </span>
        </h2>

        <p className="mx-auto mt-7 max-w-[650px] text-[14px] leading-7 text-white/44">
          No generated findings. No fake compliance status. Every deterministic result starts from source code.
        </p>

        <Link
          href="/scan"
          className="cg-primary mt-9"
        >
          Open repository scanner →
        </Link>
      </div>
    </section>
  );
}
