"use client";

import * as React from "react";
import Image from "next/image";
import { Building2, Globe, LayoutGrid, List, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Company {
  id: string;
  company_name: string;
  logo: string | null;
  region: string | null;
  company_type: string | null;
  tracks: string[] | null;
  role: string | null;
  website: string | null;
  company_description: string | null;
  core_business: string | null;
}

type ViewMode = "cards" | "list";

const companyTypeLabels: Record<string, string> = {
  private: "企业单位",
  state_owned: "国有企业",
  institution: "服务机构",
  academic: "科研院校",
  university: "科研院校",
};

function normalizeText(value: string | null | undefined) {
  return (value || "").toLowerCase().trim();
}

function splitTrack(track: string) {
  return track
    .split(/[、,，;；]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getTracks(company: Company) {
  return (company.tracks || []).flatMap(splitTrack);
}

function getCompanyType(company: Company) {
  if (!company.company_type) return "未分类";
  return companyTypeLabels[company.company_type] || company.company_type;
}

function getSummary(company: Company) {
  const text = company.core_business || company.company_description || "";
  if (!text.trim()) return "该单位已正式入库，公开能力摘要待秘书处补充。";
  return text
    .replace(/【[^】]+】/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getWebsiteUrl(website: string | null) {
  if (!website) return null;
  return website.startsWith("http") ? website : `https://${website}`;
}

export function MembersDirectory({
  initialCompanies,
}: {
  initialCompanies: Company[];
}) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [trackFilter, setTrackFilter] = React.useState("all");
  const [viewMode, setViewMode] = React.useState<ViewMode>("cards");

  const roleOptions = React.useMemo(
    () =>
      Array.from(
        new Set(initialCompanies.map((c) => c.role).filter(Boolean)),
      ) as string[],
    [initialCompanies],
  );

  const typeOptions = React.useMemo(
    () =>
      Array.from(new Set(initialCompanies.map(getCompanyType))).filter(
        (item) => item !== "未分类",
      ),
    [initialCompanies],
  );

  const trackOptions = React.useMemo(
    () =>
      Array.from(new Set(initialCompanies.flatMap(getTracks))).sort((a, b) =>
        a.localeCompare(b, "zh-CN"),
      ),
    [initialCompanies],
  );

  const filteredCompanies = React.useMemo(() => {
    const query = normalizeText(searchQuery);

    return initialCompanies.filter((company) => {
      const tracks = getTracks(company);
      const searchable = [
        company.company_name,
        company.role,
        company.region,
        getCompanyType(company),
        company.core_business,
        company.company_description,
        tracks.join(" "),
      ]
        .map(normalizeText)
        .join(" ");

      const matchesSearch = !query || searchable.includes(query);
      const matchesRole = roleFilter === "all" || company.role === roleFilter;
      const matchesType =
        typeFilter === "all" || getCompanyType(company) === typeFilter;
      const matchesTrack =
        trackFilter === "all" || tracks.includes(trackFilter);

      return matchesSearch && matchesRole && matchesType && matchesTrack;
    });
  }, [initialCompanies, roleFilter, searchQuery, trackFilter, typeFilter]);

  const hasFilters =
    Boolean(searchQuery) ||
    roleFilter !== "all" ||
    typeFilter !== "all" ||
    trackFilter !== "all";

  const resetFilters = () => {
    setSearchQuery("");
    setRoleFilter("all");
    setTypeFilter("all");
    setTrackFilter("all");
  };

  return (
    <div className="flex flex-col gap-8 md:flex-row">
      <aside className="w-full shrink-0 space-y-5 md:w-72">
        <div className="rounded-lg border bg-card p-4">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label>搜索单位</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="单位名称、能力或赛道"
                  className="pl-8"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>成员类型</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="全部成员类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部成员类型</SelectItem>
                  {roleOptions.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>单位类型</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="全部单位类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部单位类型</SelectItem>
                  {typeOptions.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>细分方向</Label>
              <Select value={trackFilter} onValueChange={setTrackFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="全部方向" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部方向</SelectItem>
                  {trackOptions.map((track) => (
                    <SelectItem key={track} value={track}>
                      {track}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {hasFilters && (
              <Button
                variant="outline"
                className="w-full"
                onClick={resetFilters}
              >
                <X className="mr-2 size-4" />
                重置筛选
              </Button>
            )}
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            共 {initialCompanies.length} 家正式入库单位，当前显示{" "}
            {filteredCompanies.length} 家
          </div>
          <div className="flex w-fit rounded-lg border bg-card p-1">
            <Button
              variant={viewMode === "cards" ? "secondary" : "ghost"}
              size="sm"
              className="h-8"
              onClick={() => setViewMode("cards")}
            >
              <LayoutGrid className="mr-1 size-4" />
              卡片
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              className="h-8"
              onClick={() => setViewMode("list")}
            >
              <List className="mr-1 size-4" />
              列表
            </Button>
          </div>
        </div>

        {filteredCompanies.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/20 text-center">
            <p className="text-sm text-muted-foreground">
              没有找到匹配的联盟单位
            </p>
            <Button variant="outline" size="sm" onClick={resetFilters}>
              重置筛选
            </Button>
          </div>
        ) : viewMode === "cards" ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredCompanies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border bg-card">
            {filteredCompanies.map((company) => (
              <CompanyListItem key={company.id} company={company} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CompanyLogo({ company }: { company: Company }) {
  return (
    <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
      {company.logo ? (
        <Image
          src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8055"}/assets/${company.logo}`}
          alt={company.company_name}
          width={40}
          height={40}
          className="size-full object-cover"
        />
      ) : (
        <Building2 className="size-5 text-muted-foreground" />
      )}
    </div>
  );
}

function CompanyBadges({ company }: { company: Company }) {
  const tracks = getTracks(company);

  return (
    <div className="flex flex-wrap gap-1.5">
      {company.role && <Badge className="bg-emerald-600">{company.role}</Badge>}
      {company.region && <Badge variant="outline">{company.region}</Badge>}
      <Badge variant="secondary">{getCompanyType(company)}</Badge>
      {tracks.slice(0, 3).map((track) => (
        <Badge key={track} variant="outline">
          {track}
        </Badge>
      ))}
      {tracks.length > 3 && (
        <Badge variant="outline">+{tracks.length - 3}</Badge>
      )}
    </div>
  );
}

function CompanyCard({ company }: { company: Company }) {
  const websiteUrl = getWebsiteUrl(company.website);

  return (
    <Card className="flex h-full flex-col overflow-hidden rounded-lg">
      <CardHeader className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <CompanyLogo company={company} />
          <CompanyBadges company={company} />
        </div>
        <CardTitle
          className="line-clamp-2 text-lg leading-snug"
          title={company.company_name}
        >
          {company.company_name}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-5 pt-0">
        <p className="line-clamp-4 text-sm leading-6 text-muted-foreground">
          {getSummary(company)}
        </p>
      </CardContent>
      {websiteUrl && (
        <CardFooter className="p-5 pt-0">
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <Globe className="mr-2 size-4" />
            访问官网
          </a>
        </CardFooter>
      )}
    </Card>
  );
}

function CompanyListItem({ company }: { company: Company }) {
  const websiteUrl = getWebsiteUrl(company.website);

  return (
    <div className="grid gap-4 border-b p-4 last:border-b-0 md:grid-cols-[minmax(220px,1.2fr)_minmax(260px,2fr)_auto] md:items-center">
      <div className="flex min-w-0 items-center gap-3">
        <CompanyLogo company={company} />
        <div className="min-w-0">
          <div className="truncate font-medium" title={company.company_name}>
            {company.company_name}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {company.role || "成员单位"}
          </div>
        </div>
      </div>
      <div className="min-w-0">
        <CompanyBadges company={company} />
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {getSummary(company)}
        </p>
      </div>
      <div>
        {websiteUrl ? (
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <Globe className="mr-2 size-4" />
            官网
          </a>
        ) : (
          <span className="text-xs text-muted-foreground">暂无官网</span>
        )}
      </div>
    </div>
  );
}
