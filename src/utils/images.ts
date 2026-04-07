import type { ImageMetadata } from 'astro';

/**
 * Dynamically resolves an image from src/assets/images/ based on its filename.
 * Used for dynamic data like books.json or blog posts.
 */
export async function resolveImage(path: string): Promise<ImageMetadata> {
  const images = import.meta.glob<{ default: ImageMetadata }>('/src/assets/images/**/*.{jpeg,jpg,png,gif,svg,webp,avif}');
  
  // Normalize path: if it's '/images/foo.png', change to '/src/assets/images/foo.png'
  let normalizedPath = path;
  if (path.startsWith('/images/')) {
    normalizedPath = path.replace('/images/', '/src/assets/images/');
  } else if (!path.startsWith('/src/assets/images/')) {
    normalizedPath = `/src/assets/images/${path}`;
  }

  if (!images[normalizedPath]) {
    throw new Error(`Image "${normalizedPath}". Verify the filename in books.json or blog frontmatter matches exactly (case-sensitive)`);
  }
  
  const mod = await images[normalizedPath]();
  return mod.default;
}
