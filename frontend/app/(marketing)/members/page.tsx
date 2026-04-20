import { createDirectus, readItems, rest, staticToken } from "@directus/sdk";

import { constructMetadata } from "@/lib/utils";
import { MembersDirectory } from "@/components/members/members-directory";

export const metadata = constructMetadata({
  title: "联盟单位名录 – 浙江省AI智能体产业联盟",
  description: "浙江省AI智能体产业联盟正式入库单位名录。",
});

export default async function MembersPage() {
  const client = createDirectus(
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8055",
  )
    .with(staticToken(process.env.DIRECTUS_STATIC_TOKEN || ""))
    .with(rest());

  let companies: any[] = [];
  try {
    companies = await client.request(
      readItems("companies", {
        filter: { status: { _eq: "published" } },
        fields: [
          "id",
          "company_name",
          "logo",
          "region",
          "company_type",
          "tracks",
          "role",
          "website",
          "company_description",
          "core_business",
        ],
        limit: -1,
        sort: ["company_name"],
      }),
    );
  } catch (error) {
    console.error("Failed to fetch published companies:", error);
  }

  return (
    <div className="container py-10 md:py-14">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          正式入库单位
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          联盟单位名录
        </h1>
        <p className="max-w-[760px] text-muted-foreground sm:text-lg">
          查询浙江省 AI
          智能体产业联盟已入库成员单位，支持按成员类型、单位类型和业务方向筛选。
        </p>
      </div>

      <div className="mt-10">
        <MembersDirectory initialCompanies={companies} />
      </div>
    </div>
  );
}
