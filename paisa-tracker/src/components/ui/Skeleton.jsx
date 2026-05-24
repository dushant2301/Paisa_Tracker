import clsx from 'clsx';

const Skeleton = ({ className = '', width, height }) => (
  <div
    className={clsx('skeleton', className)}
    style={{ width, height: height || '1rem' }}
  />
);

export const SkeletonCard = () => (
  <div className="glass-card p-4 space-y-3">
    <div className="flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <Skeleton className="h-8 w-1/3" />
  </div>
);

export const SkeletonList = ({ count = 3 }) => (
  <div className="space-y-2">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3">
        <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-5 w-16" />
      </div>
    ))}
  </div>
);

export default Skeleton;
