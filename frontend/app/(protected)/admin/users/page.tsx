import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { UserTable } from "@/components/admin/user-table";
import { InviteUserModal } from "@/components/admin/invite-user-modal";
import { getUsers } from "@/actions/user-actions";

export const metadata = constructMetadata({
  title: "账号管理 – 浙江省AI智能体产业联盟",
  description: "Manage system accounts, roles, and enterprise mappings.",
});

export default async function UsersPage() {
  const user = await getCurrentUser();
  console.log(`[UsersPage] Current User: ${user?.email}, Role: ${user?.role}`);
  if (!user || user.role !== "ADMIN") redirect("/login");

  const res = await getUsers();
  const users = res.status === "success" && res.data ? (res.data as any[]) : [];

  return (
    <>
      <DashboardHeader
        heading="系统账号管理"
        text="视角：秘书处管理员。管理联盟成员账号、分配企业权限及监控访问状态。"
      >
        <InviteUserModal />
      </DashboardHeader>

      <div className="space-y-4">
          <UserTable data={users} />
      </div>
    </>
  );
}
