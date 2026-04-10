"use client";

/* ── Base shimmer block ───────────────────────────────── */

export function Skeleton({
  className = "",
  rounded = "rounded-xl",
}: {
  className?: string;
  rounded?: string;
}) {
  return <div className={`shimmer ${rounded} ${className}`} />;
}

/* ── Poster card skeleton ─────────────────────────────── */

export function PosterCardSkeleton() {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <Skeleton className="aspect-[3/4]" rounded="rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-3 w-3/4" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-7 w-20 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function PosterGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <PosterCardSkeleton key={i} />
      ))}
    </div>
  );
}

/* ── Post card skeleton ───────────────────────────────── */

export function PostCardSkeleton() {
  return (
    <div className="glass rounded-3xl overflow-hidden">
      <div className="px-5 py-4 flex items-center gap-3">
        <Skeleton className="w-9 h-9 shrink-0" rounded="rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-2 w-16" />
        </div>
        <Skeleton className="h-6 w-16 rounded-lg" />
      </div>
      <Skeleton className="aspect-[4/3]" rounded="rounded-none" />
      <div className="px-5 py-4 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function PostFeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-5">
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}

/* ── Cart item skeleton ───────────────────────────────── */

export function CartItemSkeleton() {
  return (
    <div className="glass rounded-2xl p-5 flex gap-4">
      <Skeleton className="w-24 h-24 shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-20" />
        <div className="flex gap-1 pt-2">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="w-10 h-8 rounded-lg" />
          <Skeleton className="w-8 h-8 rounded-lg" />
        </div>
      </div>
      <Skeleton className="h-5 w-12 shrink-0" />
    </div>
  );
}

/* ── Generic content skeleton ─────────────────────────── */

export function ContentSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}
