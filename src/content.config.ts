import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const blogSchema = z.object({
  title:           z.string(),
  description:     z.string(),
  date:            z.date(),
  image:           z.string().optional(),
  category:        z.string(),
  author:          z.string().optional(),
  relatedBookSlug: z.string().optional(),
  draft:           z.boolean().optional().default(false),
});

export const collections = {
  'blog': defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
    schema: blogSchema,
  }),
  'blog-es': defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/content/blog-es" }),
    schema: blogSchema,
  }),
};