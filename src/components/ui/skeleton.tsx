import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-gradient-to-l from-white/[0.04] via-white/[0.09] to-white/[0.04] bg-[length:1000px_100%]",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
