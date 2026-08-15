import type { LucideIcon } from "lucide-react";

type FrameworkCardProps = {
  name: string;
  description: string;
  icon: LucideIcon;
};

export function FrameworkCard({
  name,
  description,
  icon: Icon,
}: FrameworkCardProps) {
  return (
    <article className="group rounded-3xl border bg-card p-7 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-foreground/5">
      <div className="mb-8 flex size-12 items-center justify-center rounded-2xl border bg-muted">
        <Icon className="size-5" />
      </div>

      <h3 className="text-xl font-semibold tracking-tight">{name}</h3>

      <p className="mt-3 leading-7 text-muted-foreground">
        {description}
      </p>
    </article>
  );
}
