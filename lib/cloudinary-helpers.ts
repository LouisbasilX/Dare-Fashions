// lib/cloudinary-helpers.ts

/**
 * Generate a thumbnail URL from a Cloudinary video URL
 * @param videoUrl - full Cloudinary video URL (e.g., https://res.cloudinary.com/.../video.mp4)
 * @param options.time - timestamp in seconds to capture (default 2)
 * @param options.width - desired width (default 400)
 * @param options.height - desired height (default 400)
 * @returns thumbnail image URL
 */
export function getVideoThumbnailUrl(
  videoUrl: string | null,
  options: { time?: number; width?: number; height?: number } = {}
): string | null {
  if (!videoUrl) return null

  const { time = 2, width = 400, height = 400 } = options

  // Replace resource_type and add transformation
  // Example: https://res.cloudinary.com/.../video/upload/v12345/folder/file.mp4
  // becomes: https://res.cloudinary.com/.../video/upload/so_2,w_400,h_400,c_fill/folder/file.jpg
  return videoUrl
    .replace('/video/upload/', `/video/upload/so_${time},w_${width},h_${height},c_fill/`)
    .replace(/\.\w+$/, '.jpg')
}