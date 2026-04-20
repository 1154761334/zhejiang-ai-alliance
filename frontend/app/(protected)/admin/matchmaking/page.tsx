import { constructMetadata } from "@/lib/utils";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
import { MatchmakingBoard } from "@/components/admin/matchmaking-board";
import { createDirectus, readItems, rest, staticToken } from "@directus/sdk";

export const metadata = constructMetadata({
    title: "供需撮合单中心 – 浙江省AI智能体产业联盟",
});

export default async function MatchmakingPage() {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") redirect("/login");

    const client = createDirectus(
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8055",
    )
        .with(staticToken(process.env.DIRECTUS_STATIC_TOKEN || ""))
        .with(rest());

    let needs: any[] = [];
    try {
        needs = await client.request(
            readItems("survey_needs", {
                fields: [
                    "id",
                    "company_id.id",
                    "company_id.company_name",
                    "company_id.region",
                    "company_id.role",
                    "financing_need",
                    "market_need",
                    "market_needs",
                    "compute_pain_points",
                    "tech_need",
                    "tech_needs",
                    "policy_intent",
                    "tech_complement_desc",
                    "ticket_status",
                    "assignee",
                    "tags",
                    "date_created",
                ],
                sort: ["ticket_status", "-date_created"],
                limit: -1,
            }),
        );
    } catch (error) {
        console.error("Failed to fetch matchmaking needs:", error);
    }

    return (
        <>
            <DashboardHeader
                heading="供需撮合工作台"
                text="集中处理全省智能体企业的核心痛点和资源需求对接。"
            />
            <div className="mt-6 flex-1">
                <MatchmakingBoard initialItems={needs} />
            </div>
        </>
    );
}
