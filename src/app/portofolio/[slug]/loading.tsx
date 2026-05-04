// app/portfolio/[slug]/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Skeleton hero */}
      <div className="h-[45vh] min-h-[280px] w-full animate-pulse bg-gray-100 sm:h-[55vh] dark:bg-gray-900 t" />

      <div className="mx-auto max-w-6xl px-6 py-8 sm:px-8">
        {/* Skeleton tags */}
        <div className="mb-3 flex gap-2">
          <div className="h-5 w-16 animate-pulse rounded-full bg-gray-100 dark:bg-gray-800" />
          <div className="h-5 w-20 animate-pulse rounded-full bg-gray-100 dark:bg-gray-800" />
        </div>

        {/* Skeleton title */}
        <div className="h-8 w-2/3 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
        <div className="mt-2 h-4 w-1/2 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
        <div className="mt-3 h-3 w-24 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />

        <div className="mt-8 border-t border-gray-100 dark:border-gray-800" />

        <div className="mt-10 lg:grid lg:grid-cols-[220px_1fr] lg:gap-16">
          {/* Skeleton sidebar */}
          <div className="hidden space-y-2 lg:block">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-8 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"
              />
            ))}
          </div>

          {/* Skeleton content */}
          <div className="space-y-4">
            <div className="h-6 w-32 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
            <div className="h-4 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
            <div className="h-4 w-5/6 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
            <div className="h-4 w-4/6 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
            <div className="mt-4 h-48 w-full animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
          </div>
        </div>
      </div>
    </div>
  )
}
