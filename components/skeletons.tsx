export function CardSkeleton() {
  return (
    <div className="flex-shrink-0 w-[160px] snap-start">
      <div className="aspect-[2/3] rounded-xl overflow-hidden bg-[#1B1B1B] animate-pulse" />
      <div className="h-3 bg-[#1B1B1B] rounded-md mt-1.5 w-3/4 animate-pulse" />
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative w-full h-[55vh] min-h-[400px] max-h-[650px] rounded-2xl overflow-hidden bg-[#1B1B1B] animate-pulse" />
  );
}

export function RowSkeleton() {
  return (
    <div className="mb-6">
      <div className="h-5 bg-[#1B1B1B] rounded-lg w-48 mb-3 animate-pulse" />
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function CollectionSkeleton() {
  return (
    <div className="mb-6">
      <div className="h-5 bg-[#1B1B1B] rounded-lg w-36 mb-3 animate-pulse" />
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-[240px] h-[120px] rounded-xl bg-[#1B1B1B] animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export function StudioSkeleton() {
  return (
    <div className="mb-6">
      <div className="h-5 bg-[#1B1B1B] rounded-lg w-24 mb-3 animate-pulse" />
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-[140px] rounded-xl bg-[#1B1B1B] animate-pulse" />
        ))}
      </div>
    </div>
  );
}
