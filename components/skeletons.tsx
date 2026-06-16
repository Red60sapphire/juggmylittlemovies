export function CardSkeleton() {
  return (
    <div className="flex-shrink-0 w-[220px] sm:w-[160px] snap-start">
      <div className="aspect-[2/3] rounded-xl overflow-hidden bg-[#1B1B1B] animate-pulse" />
      <div className="h-3 bg-[#1B1B1B] rounded-md mt-1.5 w-3/4 animate-pulse" />
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative w-full h-[60vh] min-h-[480px] md:min-h-[400px] md:h-[55vh] md:max-h-[650px] rounded-none md:rounded-2xl overflow-hidden bg-[#1B1B1B] animate-pulse" />
  );
}

export function RowSkeleton() {
  return (
    <div className="mb-8 md:mb-6">
      <div className="h-6 bg-[#1B1B1B] rounded-lg w-48 mb-4 animate-pulse" />
      <div className="flex gap-4 md:gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function CollectionSkeleton() {
  return (
    <div className="mb-8 md:mb-6">
      <div className="h-6 bg-[#1B1B1B] rounded-lg w-36 mb-4 animate-pulse" />
      <div className="flex gap-4 md:gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-[300px] sm:w-[240px] h-[160px] sm:h-[120px] rounded-2xl bg-[#1B1B1B] animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export function StudioSkeleton() {
  return (
    <div className="mb-8 md:mb-6">
      <div className="h-6 bg-[#1B1B1B] rounded-lg w-24 mb-4 animate-pulse" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-[120px] rounded-[18px] bg-[#e5e5e5] animate-pulse" />
        ))}
      </div>
    </div>
  );
}
