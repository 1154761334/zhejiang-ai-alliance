"use client";

import { Users, Clock, CheckCircle, Ban } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRecord } from "@/types/user";

interface UserStatsCardsProps {
  users: UserRecord[];
}

export function UserStatsCards({ users }: UserStatsCardsProps) {
  // 计算统计数据
  const total = users.length;
  const pending = users.filter(u => u.status === "invited").length;
  const active = users.filter(u => u.status === "active").length;
  const suspended = users.filter(u => u.status === "suspended").length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* 总用户数 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">总用户数</CardTitle>
          <Users className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{total}</div>
          <p className="text-xs text-muted-foreground">
            联盟所有注册用户
          </p>
        </CardContent>
      </Card>

      {/* 待认领 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">待认领账号</CardTitle>
          <Clock className="size-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{pending}</div>
          <p className="text-xs text-muted-foreground">
            已邀请未激活的用户
          </p>
        </CardContent>
      </Card>

      {/* 已激活 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">正常使用</CardTitle>
          <CheckCircle className="size-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{active}</div>
          <p className="text-xs text-muted-foreground">
            已激活正常使用的用户
          </p>
        </CardContent>
      </Card>

      {/* 已封禁 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">已封禁</CardTitle>
          <Ban className="size-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{suspended}</div>
          <p className="text-xs text-muted-foreground">
            已被封禁的用户账号
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
