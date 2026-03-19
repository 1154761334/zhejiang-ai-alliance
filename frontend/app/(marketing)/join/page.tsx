import { constructMetadata } from "@/lib/utils";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import { HeaderSection } from "@/components/shared/header-section";
import { JoinForm } from "@/components/forms/join-form";

export const metadata = constructMetadata({
    title: "申请入会 – 浙江省 AI 智能体产业发展联盟",
    description: "提交您的申请，加入浙江省 AI 智能体产业发展联盟。",
});

export default function JoinPage() {
    return (
        <div className="py-10">
            <MaxWidthWrapper>
                <div className="mx-auto max-w-2xl">
                    <HeaderSection
                        label="JOIN US"
                        title="申请加入联盟"
                        subtitle="请填写下方表单，我们的工作人员将在 1-3 个工作日内与您联系。"
                    />
                    <div className="mt-10 rounded-xl border bg-card p-8 shadow-sm">
                        <JoinForm />
                    </div>
                </div>
            </MaxWidthWrapper>
        </div>
    );
}
