export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-md animate-pulse">
      <div className="h-4 bg-gray-200 rounded-full w-3/4 mb-4" />
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <div key={i} className={`h-3 bg-gray-100 rounded-full mb-3 ${i % 2 === 0 ? "w-full" : "w-2/3"}`} />
      ))}
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} lines={3} />
      ))}
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="bg-white rounded-2xl p-12 shadow-md text-center">
      <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl">⚠️</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Something went wrong</h3>
      <p className="text-gray-500 mb-6">We couldn't load this content. Please try again.</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2.5 bg-[#272757] text-white rounded-xl font-medium hover:bg-[#505081] transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}
