import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { UserNameForm } from "@/components/forms/user-name-form";
import { PasswordChangeForm } from "@/components/forms/password-change-form";

export const metadata = constructMetadata({
  title: "账号设置 – 浙江省AI智能体产业联盟",
  description: "管理您的账号信息。",
});

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user?.id) redirect("/login");

  return (
    <>
      <DashboardHeader
        heading="账号设置"
        text="管理您的账号信息与偏好。"
      />
      <div className="divide-y divide-muted pb-10">
        <UserNameForm user={{ id: user.id, name: user.name || user.email || "" }} />
        <PasswordChangeForm />
      </div>
    </>
  );
}
