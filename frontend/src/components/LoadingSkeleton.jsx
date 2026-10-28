export default function LoadingSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl overflow-hidden bg-navy-800 border border-white/10 animate-pulse">
          {/* Poster skeleton */}
          <div className="aspect-[2/3] bg-white/10" />
          {/* Info skeleton */}
          <div className="p-3 space-y-2">
            <div className="h-4 bg-white/10 rounded w-3/4" />
            <div className="h-3 bg-white/10 rounded w-1/2" />
            <div className="h-3 bg-white/10 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="card p-5 animate-pulse space-y-4">
      <div className="h-5 bg-white/10 rounded w-2/5" />
      <div className="h-4 bg-white/10 rounded w-full" />
      <div className="h-4 bg-white/10 rounded w-3/4" />
      <div className="h-10 bg-white/10 rounded w-1/3" />
    </div>
  )
}

export function TableRowSkeleton({ cols = 5 }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-white/5">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-4 bg-white/10 rounded" style={{ width: `${60 + Math.random() * 30}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}
