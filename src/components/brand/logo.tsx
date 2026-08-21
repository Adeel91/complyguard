import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  className?: string;
  href?: string;
  showWordmark?: boolean;
  priority?: boolean;
};

export function Logo({
  className = "",
  href = "/",
  showWordmark = true,
  priority = false,
}: LogoProps) {
  const content = (
    <span
      className={[
        "inline-flex items-center gap-3",
        "transition-opacity duration-200 hover:opacity-90",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="relative flex size-9 shrink-0 items-center justify-center">
        <Image
          src="/logo.png"
          alt=""
          width={36}
          height={36}
          priority={priority}
          className="size-9 object-contain"
        />
      </span>

      {showWordmark ? (
        <span className="flex items-baseline whitespace-nowrap">
          <span className="text-[17px] font-semibold tracking-[-0.045em] text-white">
            ComplyGuard
          </span>

          <span
            aria-hidden="true"
            className="ml-[2px] size-[5px] rounded-full bg-violet-300"
          />
        </span>
      ) : (
        <span className="sr-only">ComplyGuard</span>
      )}
    </span>
  );

  return (
    <Link
      href={href}
      aria-label="ComplyGuard home"
      className="inline-flex"
    >
      {content}
    </Link>
  );
}

export default Logo;
