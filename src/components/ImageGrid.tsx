import { memo } from "react";
import { UnsplashPhoto } from "@/types/unsplash";
import ImageCard from "./ImageCard";
import ImageSkeleton from "./ImageSkeleton";

interface ImageGridProps {
  images: UnsplashPhoto[];
  isLoading: boolean;
  onImageClick: (index: number) => void;
}

const ImageGrid = memo(function ImageGrid({
  images,
  isLoading,
  onImageClick,
}: ImageGridProps) {
  return (
    <div
      className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 px-4 md:px-6"
      style={{ columnGap: "1rem" }}
    >
      {images.map((photo, index) => (
        <div key={photo.id} className="break-inside-avoid mb-4">
          <ImageCard
            photo={photo}
            priority={index < 6}
            onClick={() => onImageClick(index)}
          />
        </div>
      ))}

      {/* Skeleton placeholders during initial load */}
      {isLoading && <ImageSkeleton count={12} />}
    </div>
  );
});

export default ImageGrid;
