"use client";

import React, { useMemo } from "react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface DashboardChartsProps {
  companies: {
    region: string | null;
    role: string | null;
  }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export function DashboardCharts({ companies }: DashboardChartsProps) {
  const { regionData, roleData } = useMemo(() => {
    const regionMap: Record<string, number> = {};
    const roleMap: Record<string, number> = {};

    companies.forEach(company => {
      // Clean up region name (e.g. "浙江省 杭州市" -> "杭州")
      let r = company.region || '未知';
      if (r.includes('杭州')) r = '杭州';
      else if (r.includes('宁波')) r = '宁波';
      else if (r.includes('温州')) r = '温州';
      else if (r.includes('嘉兴')) r = '嘉兴';
      else if (r.includes('湖州')) r = '湖州';
      else if (r.includes('绍兴')) r = '绍兴';
      else if (r.includes('金华')) r = '金华';
      else if (r.includes('衢州')) r = '衢州';
      else if (r.includes('舟山')) r = '舟山';
      else if (r.includes('台州')) r = '台州';
      else if (r.includes('丽水')) r = '丽水';
      else if (r.includes('北京') || r.includes('上海') || r.includes('广东') || r.includes('江苏')) r = '省外';
      
      regionMap[r] = (regionMap[r] || 0) + 1;

      const role = company.role || '未分类';
      roleMap[role] = (roleMap[role] || 0) + 1;
    });

    const formattedRegionData = Object.entries(regionMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // top 10 regions

    const formattedRoleData = Object.entries(roleMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return { regionData: formattedRegionData, roleData: formattedRoleData };
  }, [companies]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <Card>
        <CardHeader>
          <CardTitle>生态角色分布</CardTitle>
          <CardDescription>各类型智能体企业占比</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {roleData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {roleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} 家`, '数量']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">暂无数据</div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>区域分布Top10</CardTitle>
          <CardDescription>全省及主要地市企业入驻情况</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {regionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={regionData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={60} />
                  <Tooltip formatter={(value) => [`${value} 家`, '数量']} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} name="企业数量" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">暂无数据</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
