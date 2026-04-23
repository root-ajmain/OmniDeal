export function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-gray-50 rounded-lg ${className}`}
      style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)', backgroundSize: '200% 100%', animation: 'shimmer 2s infinite' }}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
