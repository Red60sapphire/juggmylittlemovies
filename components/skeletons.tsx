export function CardSkeleton() {
  return (
    <div className="flex-shrink-0 w-[180px] sm:w-[200px] snap-start">
      <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-white/[0.03] animate-pulse" />
      <div className="h-4 bg-white/[0.03] rounded-lg mt-2 w-3/4 animate-pulse" />
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative w-full h-[75vh] min-h-[500px] max-h-[850px] rounded-2xl overflow-hidden bg-white/[0.03] animate-pulse" />
  );
}

export function RowSkeleton() {
  return (
    <div className="mb-8">
      <div className="h-6 bg-white/[0.03] rounded-lg w-48 mb-4 animate-pulse" />
      <div className="flex gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function CollectionSkeleton() {
  return (
    <div className="mb-10">
      <div className="h-6 bg-white/[0.03] rounded-lg w-36 mb-4 animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-[180px] rounded-2xl bg-white/[0.03] animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export function StudioSkeleton() {
  return (
    <div className="mb-10">
      <div className="h-6 bg-white/[0.03] rounded-lg w-24 mb-4 animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[170px] rounded-2xl bg-white/[0.03] animate-pulse" />
        ))}
      </div>
    </div>
  );
}
