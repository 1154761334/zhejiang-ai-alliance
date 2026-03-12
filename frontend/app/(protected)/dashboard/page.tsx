import { createDirectus, rest, staticToken, readItems } from "@directus/sdk";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { CapabilityForm } from "@/components/dashboard/capability-form";

export const metadata = constructMetadata({
  title: "控制台 – 浙江省AI智能体产业联盟",
  description: "Create and manage content.",
});

export default async function DashboardPage() {
  const user = await getCurrentUser();

  // Create an authenticated client to query the user's data
  const client = createDirectus(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8055")
    .with(staticToken(process.env.DIRECTUS_STATIC_TOKEN || ""))
    .with(rest());

  let initialData: any = null;

  if (user?.id) {
    try {
      // Fetch the company record created by this user
      const res = await client.request(readItems('companies', {
        filter: {
          user_created: { _eq: user.id }
        },
        fields: ['*', 'products.*', 'case_studies.*', 'survey_needs.*', 'compliance_risks.*'],
        limit: 1
      }));
      if (res && res.length > 0) {
        initialData = res[0];
      }
    } catch (err) {
      console.error("Failed to fetch user company data:", err);
    }
  }

  const isPendingReview = initialData?.status === 'pending_review' || initialData?.status === 'published';

  return (
    <>
      <DashboardHeader
        heading="会员专属工作台"
        text={
          isPendingReview
            ? "您的资料已提交，目前处于锁定状态。正在等待秘书处审核或已正式收录。"
            : "欢迎加入浙江省 AI 智能体产业发展联盟。请完成以下表格以协助我们摸底全省智能体企业家底。"
        }
      />
      <div className="grid gap-8 pb-10">
        <CapabilityForm initialData={initialData} isLocked={isPendingReview} />
      </div>
    </>
  );
}
