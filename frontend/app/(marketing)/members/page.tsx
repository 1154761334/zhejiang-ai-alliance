import { constructMetadata } from "@/lib/utils";
import { createDirectus, rest, staticToken, readItems } from "@directus/sdk";
import { MembersDirectory } from "@/components/members/members-directory";

export const metadata = constructMetadata({
    title: "联盟企业名录 – 浙江省AI智能体产业联盟",
    description: "Browse the directory of published AI companies in the alliance.",
});

export default async function MembersPage() {
    const client = createDirectus(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8055")
        .with(staticToken(process.env.DIRECTUS_STATIC_TOKEN || ""))
        .with(rest());

    let companies: any[] = [];
    try {
        companies = await client.request(readItems('companies', {
            filter: { status: { _eq: 'published' } },
            fields: ['id', 'company_name', 'logo', 'description', 'region', 'company_type', 'tracks', 'role', 'website']
        }));
    } catch (error) {
        console.error("Failed to fetch published companies:", error);
    }

    return (
        <div className="container py-10">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">大家庭</h2>
                <p className="max-w-[700px] text-muted-foreground sm:text-xl">
                    探索浙江省最优质的AI智能体企业，覆盖模型、算力、应用全生态链。
                </p>
            </div>

            <div className="mt-10">
                <MembersDirectory initialCompanies={companies} />
            </div>
        </div>
    );
}
