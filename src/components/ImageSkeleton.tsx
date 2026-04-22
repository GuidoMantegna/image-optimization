import { memo } from "react";

// Pre-defined aspect ratios to simulate real image proportions
const ASPECT_RATIOS = [
  "aspect-[4/5]",
  "aspect-[3/4]",
  "aspect-square",
  "aspect-[4/3]",
  "aspect-[2/3]",
  "aspect-[5/7]",
];

const SkeletonCard = memo(function SkeletonCard({ index }: { index: number }) {
  const ratio = ASPECT_RATIOS[index % ASPECT_RATIOS.length];
  return (
    <div className={`w-full ${ratio} rounded-xl overflow-hidden bg-neutral-800 relative`}>
      <div className="absolute inset-0 skeleton-shimmer" />
    </div>
  );
});

interface ImageSkeletonProps {
  count?: number;
}

const ImageSkeleton = memo(function ImageSkeleton({ count = 12 }: ImageSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="break-inside-avoid mb-4">
          <SkeletonCard index={i} />
        </div>
      ))}
    </>
  );
});

export default ImageSkeleton;
