/**
 * Cloudinary Image Optimization Utilities
 *
 * Applies auto-format (f_auto), auto-quality (q_auto), and responsive
 * width transforms to Cloudinary URLs for optimal performance.
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";

/**
 * Build an optimized Cloudinary URL with transforms.
 *
 * Usage:
 *   cloudinaryUrl("lucky3dp/posters/iron-man.jpg", { width: 400 })
 *   → https://res.cloudinary.com/CLOUD/image/upload/f_auto,q_auto,w_400/lucky3dp/posters/iron-man.jpg
 */
export function cloudinaryUrl(
  publicIdOrUrl: string,
  options: {
    width?: number;
    height?: number;
    crop?: "fill" | "fit" | "limit" | "thumb" | "scale";
    quality?: "auto" | "auto:low" | "auto:eco" | "auto:good" | "auto:best" | number;
    format?: "auto" | "webp" | "avif" | "jpg" | "png";
    gravity?: "auto" | "face" | "center";
    blur?: number;
  } = {}
): string {
  // If it's already a full Cloudinary URL, insert transforms
  if (publicIdOrUrl.includes("res.cloudinary.com")) {
    return insertTransforms(publicIdOrUrl, options);
  }

  // Build from public ID
  const transforms = buildTransformString(options);
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}${publicIdOrUrl}`;
}

function buildTransformString(options: Record<string, any>): string {
  const parts: string[] = ["f_auto", "q_auto"];

  if (options.width) parts.push(`w_${options.width}`);
  if (options.height) parts.push(`h_${options.height}`);
  if (options.crop) parts.push(`c_${options.crop}`);
  if (options.quality && options.quality !== "auto") parts.push(`q_${options.quality}`);
  if (options.format && options.format !== "auto") parts.push(`f_${options.format}`);
  if (options.gravity) parts.push(`g_${options.gravity}`);
  if (options.blur) parts.push(`e_blur:${options.blur}`);

  return parts.join(",") + "/";
}

function insertTransforms(url: string, options: Record<string, any>): string {
  const transforms = buildTransformString(options);
  // Insert after /upload/
  return url.replace("/upload/", `/upload/${transforms}`);
}

/**
 * Next.js Image loader for Cloudinary URLs.
 * Use with next/image: <Image loader={cloudinaryLoader} ... />
 */
export function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  if (src.includes("res.cloudinary.com")) {
    const transforms = `f_auto,q_${quality || "auto"},w_${width}`;
    return src.replace("/upload/", `/upload/${transforms}/`);
  }

  // Fallback for non-Cloudinary images
  return src;
}

/**
 * Generate responsive srcSet for a Cloudinary image.
 */
export function cloudinarySrcSet(
  publicIdOrUrl: string,
  widths: number[] = [320, 640, 960, 1280]
): string {
  return widths
    .map((w) => `${cloudinaryUrl(publicIdOrUrl, { width: w })} ${w}w`)
    .join(", ");
}

/**
 * Cloudinary blur placeholder (tiny 20px version).
 * Use as blurDataURL in next/image.
 */
export function cloudinaryBlurUrl(publicIdOrUrl: string): string {
  return cloudinaryUrl(publicIdOrUrl, {
    width: 20,
    quality: "auto:low" as any,
    blur: 1000,
  });
}
