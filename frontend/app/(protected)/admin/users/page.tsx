import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { UserTable } from "@/components/admin/user-table";
import { InviteUserModal } from "@/components/admin/invite-user-modal";
import { UserStatsCards } from "@/components/admin/user-stats-cards";
import { getUsers, getRoles, getCompanyList } from "@/actions/user-actions";

export const metadata = constructMetadata({
  title: "账号管理 – 浙江省AI智能体产业联盟",
  description: "Manage system accounts, roles, and enterprise mappings.",
});

export default async function UsersPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/login");

  const [usersRes, rolesRes, companiesRes] = await Promise.all([
    getUsers(),
    getRoles(),
    getCompanyList(),
  ]);

  const users = usersRes.status === "success" && usersRes.data ? (usersRes.data as any[]) : [];
  const roles = rolesRes.status === "success" && rolesRes.data ? (rolesRes.data as any[]) : [];
  const companies = companiesRes.status === "success" && companiesRes.data ? (companiesRes.data as any[]) : [];

  return (
    <>
      <DashboardHeader
        heading="系统账号管理"
        text="视角：秘书处管理员。管理联盟成员账号、分配企业权限及监控访问状态。"
      >
        <InviteUserModal />
      </DashboardHeader>

      <div className="space-y-4">
        <UserStatsCards users={users} />
        <UserTable data={users} roles={roles} companies={companies} />
      </div>
    </>
  );
}
