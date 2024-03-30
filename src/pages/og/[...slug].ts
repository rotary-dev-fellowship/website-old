/**
 * This file is used to generate Open Graph images for each collection pages:
 * - http://localhost:4321/blog/post-2        <-- collection page url
 * - http://localhost:4321/og/blog/post-2.png <-- generated og image
 *                         ^^^           ^^^^
 */

import { getCollection, type ContentEntryMap } from "astro:content";
import { OGImageRoute } from "astro-og-canvas";
import { collections } from "@/content/config";
import { OG, SITE } from "@/data_files/constants";

const _collections = Object.keys(collections) as (keyof ContentEntryMap)[];

const entries = [];

for (const collectionName of _collections) {
  entries.push(...await getCollection(collectionName));
}

const pages = Object.fromEntries(entries.map(({ collection, slug, data }) => {
  // @todo Why is the `docs` collection not using a base path as the other
  // collections? This might cause collisions with pages published in the
  // `pages` directory.
  // http://localhost:4321/guides/getting-started      (actual)
  // http://localhost:4321/docs/guides/getting-started (suggested)
  //                       ^^^^
  const staticPath = collection === 'docs'
    ? slug
    : `${collection}/${slug}`;

  return [staticPath, data]
}));

export const { getStaticPaths, GET } = OGImageRoute({
  pages,
  param: "slug", // The parameter name in the URL.
  // This function is called for each page to get the options for the image.
  getImageOptions: (_path, page: (typeof pages)[number]) => {
    // @todo This is a bit hacky. Should we enforce that the title and
    // description are always required in the collection schemas?
    const title = (page.title !== undefined && typeof page.title === 'string')
      ? page.title
      : SITE.title;

    const description = (page.description !== undefined && typeof page.description === 'string')
      ? page.description
      : SITE.description;

    return OG.generateImageOptions(title, description);
  },
});
