import { SHOP_DEFAULT_IMAGE } from "../config";

interface ImageData {
  url?: string;
  thumbnailUrl?: string;
  altText?: string | null;
}

interface SafeImage {
  url: string;
  thumbnailUrl: string;
  altText: string;
}

export const createSafeImage = (
  imageData: ImageData | null | undefined,
    fallbackAltText = "Product image",
    defaultImageUrl = SHOP_DEFAULT_IMAGE
): SafeImage => {
  return {
    url: imageData?.url || defaultImageUrl,
    thumbnailUrl: imageData?.thumbnailUrl || defaultImageUrl,
    altText: imageData?.altText || fallbackAltText
  };
};

export const getImageSrc = (image: SafeImage, preferThumbnail = true): string => {
  return preferThumbnail ? image.thumbnailUrl : image.url;
};