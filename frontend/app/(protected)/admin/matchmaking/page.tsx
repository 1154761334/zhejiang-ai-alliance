import { constructMetadata } from "@/lib/utils";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
import { MatchmakingBoard } from "@/components/admin/matchmaking-board";

export const metadata = constructMetadata({
    title: "供需撮合单中心 – 浙江省AI智能体产业联盟",
});

export default async function MatchmakingPage() {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") redirect("/login");

    return (
        <>
            <DashboardHeader
                heading="供需撮合工作台"
                text="集中处理全省智能体企业的核心痛点和资源需求对接。"
            />
            <div className="flex-1 mt-6">
                <MatchmakingBoard />
            </div>
        </>
    );
}
