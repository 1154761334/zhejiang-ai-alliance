"use client";

import * as React from "react";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Building2, Globe } from "lucide-react";

interface Company {
    id: string;
    company_name: string;
    logo: string | null;
    description: string;
    region: string;
    company_type: string;
    tracks: string[];
    role: string | null;
    website: string | null;
}

export function MembersDirectory({ initialCompanies }: { initialCompanies: Company[] }) {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [roleFilter, setRoleFilter] = React.useState("all");

    const filteredCompanies = React.useMemo(() => {
        return initialCompanies.filter(company => {
            const matchesSearch = company.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                company.description?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesRole = roleFilter === "all" || company.role === roleFilter;
            return matchesSearch && matchesRole;
        });
    }, [initialCompanies, searchQuery, roleFilter]);

    const uniqueRoles = Array.from(new Set(initialCompanies.map(c => c.role).filter(Boolean))) as string[];

    return (
        <div className="flex flex-col gap-8 md:flex-row">
            <aside className="w-full md:w-64 shrink-0 space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>搜索企业</Label>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="名称或关键词"
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>生态角色划分</Label>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="所有角色" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">所有角色</SelectItem>
                                {uniqueRoles.map(role => (
                                    <SelectItem key={role} value={role}>{role}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </aside>

            <div className="flex-1">
                <div className="mb-4 text-sm text-muted-foreground">
                    显示 {filteredCompanies.length} 家认证企业
                </div>

                {filteredCompanies.length === 0 ? (
                    <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
                        <p className="text-muted-foreground">没有找到匹配的联盟企业</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredCompanies.map(company => (
                            <Card key={company.id} className="flex flex-col overflow-hidden hover:shadow-md transition-shadow">
                                <CardHeader className="p-5 pb-4 items-start gap-4 space-y-0">
                                    <div className="flex w-full items-start justify-between">
                                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-slate-100 flex items-center justify-center">
                                            {company.logo ? (
                                                <Image
                                                    src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8055"}/assets/${company.logo}`}
                                                    alt={company.company_name}
                                                    width={40}
                                                    height={40}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <Building2 className="h-5 w-5 text-slate-400" />
                                            )}
                                        </div>
                                        {company.role && (
                                            <Badge variant="secondary" className="whitespace-nowrap text-xs text-blue-700 bg-blue-50">
                                                {company.role}
                                            </Badge>
                                        )}
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg line-clamp-1" title={company.company_name}>
                                            {company.company_name}
                                        </CardTitle>
                                        <div className="mt-1 flex items-center text-xs text-muted-foreground gap-3">
                                            {company.region && (
                                                <div className="flex items-center">
                                                    <MapPin className="mr-1 h-3 w-3" />
                                                    {company.region}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-5 pt-0 flex-1">
                                    <CardDescription className="line-clamp-3 text-sm">
                                        {company.description || "这家企业很低调，暂无公开简介。"}
                                    </CardDescription>

                                    {company.tracks && company.tracks.length > 0 && (
                                        <div className="mt-4 flex flex-wrap gap-1">
                                            {company.tracks.slice(0, 3).map((track, i) => (
                                                <Badge key={i} variant="outline" className="text-[10px] leading-none py-1">
                                                    {track}
                                                </Badge>
                                            ))}
                                            {company.tracks.length > 3 && (
                                                <Badge variant="outline" className="text-[10px] leading-none py-1">+{company.tracks.length - 3}</Badge>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                                {company.website && (
                                    <CardFooter className="p-4 pt-0 text-sm">
                                        <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-muted-foreground hover:text-blue-600 transition-colors">
                                            <Globe className="mr-2 h-3.5 w-3.5" />
                                            访问官网
                                        </a>
                                    </CardFooter>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
