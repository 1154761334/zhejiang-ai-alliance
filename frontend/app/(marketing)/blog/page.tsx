import { constructMetadata } from "@/lib/utils";
import { BlogPosts } from "@/components/content/blog-posts";
import { directus } from "@/lib/directus";
import { readItems } from "@directus/sdk";
import { env } from "@/env.mjs";

export const metadata = constructMetadata({
  title: "新闻动态 – 浙江省 AI 智能体产业发展联盟",
  description: "来自联盟的最新动态与行业资讯。",
});

const PLACEHOLDER_BLUR =
  "data:image/webp;base64,AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

export default async function BlogPage() {
  // Fetch from Directus
  const articles = await directus.request(
    // @ts-ignore
    readItems('articles' as any, {
      fields: ['id', 'title', 'summary', 'slug', 'publish_date', 'cover', 'category'],
      sort: ['-publish_date'],
    })
  );

  const posts = articles.map((article: any) => {
    const imageUrl = article.cover
      ? `${env.NEXT_PUBLIC_API_URL}/assets/${article.cover}`
      : "/_static/blog/blog-post-1.jpg"; // fallback

    return {
      _id: article.id,
      title: article.title,
      description: article.summary || "",
      date: article.publish_date || new Date().toISOString(),
      image: imageUrl,
      slug: `/blog/${article.slug || article.id}`,
      authors: ["alliance_admin"],
      categories: [article.category || "news"],
      blurDataURL: PLACEHOLDER_BLUR,
    };
  });

  if (posts.length === 0) {
    return (
      <main className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <h1 className="font-heading text-3xl">暂无新闻动态</h1>
        <p className="text-muted-foreground">请在 Directus 后台添加文章</p>
      </main>
    );
  }

  return <BlogPosts posts={posts as any} />;
}
