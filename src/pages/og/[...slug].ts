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
  // @todo This feels hacky. Why is the docs collection not using the same
  // path as the other collections?
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
    const title = (page.title === undefined && typeof page.title === 'string')
      ? page.title
      : SITE.title;

    const description = (page.description === undefined && typeof page.description === 'string')
      ? page.description
      : SITE.description;

    return OG.generateImageOptions(title, description);
  },
});
