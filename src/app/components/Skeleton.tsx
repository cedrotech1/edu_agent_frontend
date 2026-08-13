interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`bg-[#E2E8F0] rounded-lg animate-pulse ${className}`}
      style={{
        backgroundImage: "linear-gradient(90deg, #E2E8F0 25%, #F1F5F9 50%, #E2E8F0 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
      }}
    />
  );
}

export function SkeletonStatCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {[1,2,3,4].map(i => (
        <div key={i} className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
          <Skeleton className="h-3 w-20 mb-3" />
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
      <div className="px-5 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0]">
        <Skeleton className="h-4 w-32" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`flex items-center gap-4 px-5 py-4 border-b border-[#E2E8F0] ${i % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]"}`}>
          <Skeleton className="w-8 h-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonCards({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm space-y-3">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3.5 w-1/2" />
          <Skeleton className="h-9 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="flex items-center gap-4 p-5">
      <Skeleton className="w-16 h-16 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}
