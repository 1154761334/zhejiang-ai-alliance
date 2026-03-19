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
          _or: [
            { user_created: { _eq: user.id } },
            { contact_email: { _eq: user.email } }
          ]
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
            : initialData?.status === 'rejected' 
              ? "您的资料已被退回，请根据下方的建议进行修润后重新提交。"
              : "欢迎加入浙江省 AI 智能体产业发展联盟。请完成以下表格以协助我们摸底全省智能体企业家底。"
        }
      />
      
      {initialData?.status === 'rejected' && initialData?.rejection_reason && (
        <div className="mb-6 mx-1">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 items-start animate-in fade-in slide-in-from-top-2">
            <div className="bg-red-100 p-1.5 rounded-full mt-0.5">
              <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-red-900 mb-1">退回建议自查室：</h4>
              <p className="text-xs text-red-700 leading-relaxed font-medium">
                {initialData.rejection_reason}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-8 pb-10">
        <CapabilityForm initialData={initialData} isLocked={isPendingReview} />
      </div>
    </>
  );
}
