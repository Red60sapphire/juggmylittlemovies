export function CardSkeleton() {
  return (
    <div className="flex-shrink-0 w-[220px] sm:w-[180px] md:w-[200px] snap-start">
      <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-[#1B1B1B] animate-pulse relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-shimmer" />
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative w-full h-[55vh] min-h-[420px] md:min-h-[420px] md:h-[55vh] md:max-h-[680px] rounded-2xl overflow-hidden bg-[#1B1B1B] animate-pulse mb-6 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-shimmer" />
    </div>
  );
}

export function RowSkeleton() {
  return (
    <div className="mb-6">
      <div className="h-5 bg-[#1B1B1B] rounded-lg w-40 mb-3 animate-pulse" />
      <div className="flex gap-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function CollectionSkeleton() {
  return (
    <div className="mb-6">
      <div className="h-5 bg-[#1B1B1B] rounded-lg w-32 mb-3 animate-pulse" />
      <div className="flex gap-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-[280px] sm:w-[240px] h-[160px] sm:h-[130px] rounded-2xl bg-[#1B1B1B] animate-pulse relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function StudioSkeleton() {
  return (
    <div className="mb-6">
      <div className="md:hidden">
        <div className="h-5 bg-[#1B1B1B] rounded-lg w-20 mb-3 animate-pulse" />
        <div className="flex gap-2.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[200px] snap-start">
              <div className="aspect-[2/3] rounded-2xl bg-[#1B1B1B] animate-pulse relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-shimmer" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="hidden md:block">
        <div className="h-5 bg-[#1B1B1B] rounded-lg w-20 mb-3 animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-[170px] rounded-2xl bg-white/[0.03] border border-white/[0.06] animate-pulse relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-shimmer" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
