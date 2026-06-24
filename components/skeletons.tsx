const shimmer = "relative overflow-hidden bg-white/[0.03] before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/[0.04] before:to-transparent";

export function PosterSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`flex-shrink-0 w-[200px] sm:w-[150px] ${className}`}>
      <div className={`aspect-[2/3] rounded-xl ${shimmer}`} />
      <div className="h-3 rounded-md mt-1.5 w-3/4 bg-white/[0.03] relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
      </div>
    </div>
  );
}

export function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`aspect-[2/3] rounded-xl ${shimmer} ${className}`} />
  );
}

export function HeroSkeleton() {
  return (
    <div className={`relative w-full h-[55vh] min-h-[420px] md:min-h-[400px] md:h-[52vh] md:max-h-[600px] rounded-none md:rounded-2xl overflow-hidden ${shimmer}`} />
  );
}

export function RowSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="mb-8 md:mb-6">
      <div className="h-5 w-40 rounded-lg mb-4 bg-white/[0.03] relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
      </div>
      <div className="flex gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <PosterSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 24 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
