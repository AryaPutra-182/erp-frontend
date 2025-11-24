export default function LoadingSkeleton({ lines = 5 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-6 bg-gray-200 animate-pulse rounded"></div>
      ))}
    </div>
  )
}
