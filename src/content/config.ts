import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    image: z.string().optional(),
    category: z.string().default('General'),
    relatedBookSlug: z.string().optional(),
  }),
});

export const collections = {
  'blog': blogCollection,
  'blog-es': blogCollection,
};
