import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";

import { BLOG_CATEGORIES } from "@/config/blog";
import {
  cn,
  constructMetadata,
  formatDate,
  placeholderBlurhash,
} from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import BlurImage from "@/components/shared/blur-image";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import { directus } from "@/lib/directus";
import { readItems } from "@directus/sdk";
import { env } from "@/env.mjs";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata | undefined> {
  const articles = await directus.request(
    // @ts-ignore
    readItems('articles' as any, {
      filter: { slug: { _eq: params.slug } },
      fields: ['title', 'summary', 'cover'],
      limit: 1,
    })
  ) as any[];

  const post = articles[0];
  if (!post) return;

  const imageUrl = post.cover
    ? `${env.NEXT_PUBLIC_API_URL}/assets/${post.cover}`
    : "/_static/blog/blog-post-1.jpg";

  return constructMetadata({
    title: `${post.title} – 浙江省AI智能体产业联盟`,
    description: post.summary,
    image: imageUrl,
  });
}

export default async function PostPage({
  params,
}: {
  params: {
    slug: string;
  };
}) {
  const articles = await directus.request(
    // @ts-ignore
    readItems('articles' as any, {
      filter: { slug: { _eq: params.slug } },
      fields: ['id', 'title', 'content', 'summary', 'publish_date', 'cover', 'category'],
      limit: 1,
    })
  ) as any[];

  const post = articles[0];

  if (!post) {
    notFound();
  }

  const category = BLOG_CATEGORIES.find(
    (c) => c.slug === post.category,
  ) || { title: "新闻动态", slug: "news", description: "" };

  const imageUrl = post.cover
    ? `${env.NEXT_PUBLIC_API_URL}/assets/${post.cover}`
    : "/_static/blog/blog-post-1.jpg";

  const thumbnailBlurhash = placeholderBlurhash;

  return (
    <>
      <MaxWidthWrapper className="pt-6 md:pt-10">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-4">
            <Link
              href={`/blog/category/${category.slug}`}
              className={cn(
                buttonVariants({
                  variant: "outline",
                  size: "sm",
                  rounded: "lg",
                }),
                "h-8",
              )}
            >
              {category.title}
            </Link>
            <time
              dateTime={post.publish_date}
              className="text-sm font-medium text-muted-foreground"
            >
              {formatDate(post.publish_date || new Date().toISOString())}
            </time>
          </div>
          <h1 className="font-heading text-3xl text-foreground sm:text-4xl">
            {post.title}
          </h1>
          <p className="text-base text-muted-foreground md:text-lg">
            {post.summary}
          </p>
        </div>
      </MaxWidthWrapper>

      <div className="relative">
        <div className="absolute top-52 w-full border-t" />

        <MaxWidthWrapper className="grid grid-cols-4 gap-10 pt-8 max-md:px-0">
          <div className="relative col-span-4 mb-10 flex flex-col space-y-8 border-y bg-background md:rounded-xl md:border lg:col-span-3">
            <BlurImage
              alt={post.title}
              blurDataURL={thumbnailBlurhash ?? placeholderBlurhash}
              className="aspect-[1200/630] border-b object-cover md:rounded-t-xl"
              width={1200}
              height={630}
              priority
              placeholder="blur"
              src={imageUrl}
              sizes="(max-width: 768px) 770px, 1000px"
            />
            <div className="prose prose-slate dark:prose-invert max-w-none px-[.8rem] pb-10 md:px-8">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>
          </div>
        </MaxWidthWrapper>
      </div>
    </>
  );
}
