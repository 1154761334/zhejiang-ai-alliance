"use client";

import { useState } from "react";
import {
  addInternalInvestigation,
  updateCompanyTierA,
} from "@/actions/update-company-crm";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  Copy,
  History,
  Printer,
  Save,
  SearchCode,
  ShieldAlert,
} from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";

import { evaluateCompanyData } from "@/lib/evaluation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

import { BasicInfoStep } from "../dashboard/survey-steps/basic-info-step";
import { CasesStep } from "../dashboard/survey-steps/cases-step";
import { NeedsStep } from "../dashboard/survey-steps/needs-step";
import { ProductsStep } from "../dashboard/survey-steps/products-step";
import {
  surveyFormSchema,
  type SurveyFormValues,
} from "../dashboard/survey-steps/schema";

function normalizeProducts(products: any[] | undefined) {
  if (!products?.length) {
    return [{ name: "", form_factor: "", maturity_stage: "", description: "" }];
  }

  return products.map((product) => ({
    ...product,
    name: product.name || product.product_name || "",
    form_factor: product.form_factor || product.product_type || "",
    maturity_stage: product.maturity_stage || "",
    description: product.description || product.product_description || "",
    advantages: product.advantages || product.advantage || "",
  }));
}

function normalizeCases(cases: any[] | undefined) {
  if (!cases?.length) return [];

  return cases.map((caseStudy) => ({
    ...caseStudy,
    title: caseStudy.title || caseStudy.case_title || "",
  }));
}

export function CompanyCrmView({
  companyId,
  initialCompanyData,
}: {
  companyId: string;
  initialCompanyData: any;
}) {
  const [aTierData, setATierData] = useState(initialCompanyData);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingInvestigation, setIsAddingInvestigation] = useState(false);
  const [isInvestigationDialogOpen, setIsInvestigationDialogOpen] =
    useState(false);
  const [isSurveyDialogOpen, setIsSurveyDialogOpen] = useState(false);

  // Initialize unified form
  const form = useForm<SurveyFormValues>({
    resolver: zodResolver(surveyFormSchema),
    defaultValues: {
      company_name: initialCompanyData?.company_name || "",
      company_description: initialCompanyData?.company_description || "",
      awards_honors: initialCompanyData?.awards_honors || "",
      credit_code: initialCompanyData?.credit_code || "",
      established_date: initialCompanyData?.established_date || "",
      region: initialCompanyData?.region || "",
      address: initialCompanyData?.address || "",
      website: initialCompanyData?.website || "",
      company_type: initialCompanyData?.company_type || "",
      employee_count: initialCompanyData?.employee_count || 0,
      rnd_count: initialCompanyData?.rnd_count || 0,
      revenue_range: initialCompanyData?.revenue_range || "",
      tracks: initialCompanyData?.tracks || [],
      role: initialCompanyData?.role || "",
      contact_name: initialCompanyData?.contact_name || "",
      contact_position: initialCompanyData?.contact_position || "",
      contact_phone: initialCompanyData?.contact_phone || "",
      contact_email: initialCompanyData?.contact_email || "",
      contact_preference: initialCompanyData?.contact_preference || "",
      info_provider_name_position:
        initialCompanyData?.info_provider_name_position || "",
      products: normalizeProducts(initialCompanyData?.products),
      case_studies: normalizeCases(initialCompanyData?.case_studies),
      financing_need:
        initialCompanyData?.survey_needs?.[0]?.financing_need || [],
      market_need:
        initialCompanyData?.survey_needs?.[0]?.market_need ||
        initialCompanyData?.survey_needs?.[0]?.market_needs ||
        [],
      tech_need:
        initialCompanyData?.survey_needs?.[0]?.tech_need ||
        initialCompanyData?.survey_needs?.[0]?.tech_needs ||
        [],
      compute_pain_points:
        initialCompanyData?.survey_needs?.[0]?.compute_pain_points || [],
      tech_complement_desc:
        initialCompanyData?.survey_needs?.[0]?.tech_complement_desc || "",
      policy_intent: initialCompanyData?.survey_needs?.[0]?.policy_intent || [],
      data_security_measures:
        initialCompanyData?.compliance_risks?.[0]?.data_security_measures || "",
      has_mlps_certification:
        initialCompanyData?.compliance_risks?.[0]?.has_mlps_certification ||
        false,
      processes_pii:
        initialCompanyData?.compliance_risks?.[0]?.processes_pii || false,
      confidentiality_commitment:
        initialCompanyData?.confidentiality_commitment || false,
    },
  });

  const [newInvestigation, setNewInvestigation] = useState({
    actual_capacity: "",
    technical_team_eval: "",
    real_key_clients: "",
    cooperation_willingness: "B",
    internal_notes: "",
    actual_team_size: 0,
    tech_maturity_score: 3,
    market_influence_score: 3,
    risk_level: "Low",
  });

  const handleATierSave = async () => {
    setIsSaving(true);
    try {
      const formValues = form.getValues();
      const payload = {
        ...formValues,
        status: aTierData.status,
        rejection_reason: aTierData.rejection_reason,
        core_business: formValues.company_description,
        expected_resources: aTierData.expected_resources,
        key_clients_claimed: aTierData.key_clients_claimed,
        credit_code_status: aTierData.credit_code_status,
        evidence_status: aTierData.evidence_status,
        contact_status: aTierData.contact_status,
        completion_rate: aTierData.completion_rate,
        recommended_scenarios: aTierData.recommended_scenarios,
        secretariat_comments: aTierData.secretariat_comments,
      };
      const result = await updateCompanyTierA(companyId, payload);
      if (result.status === "success") {
        toast.success("公共信息已同步至数据库，展示已更新。");
      } else {
        toast.error("保存失败: " + result.message);
      }
    } catch (err) {
      toast.error("网络异常，请稍后重试");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateSurvey = () => {
    setIsSurveyDialogOpen(true);
  };

  const handleAddInvestigation = async () => {
    setIsAddingInvestigation(true);
    try {
      const result = await addInternalInvestigation(
        companyId,
        newInvestigation,
      );
      if (result.status === "success") {
        toast.success("尽调记录已添加！");
        setIsInvestigationDialogOpen(false);
        // Optimistically update the UI
        const newRecord = {
          ...newInvestigation,
          id: Math.random().toString(), // fake ID for optimistic UI
          investigator: "Admin", // default since we don't have session data in the client easily here, it updates on refresh
          investigation_date: new Date().toISOString(),
        };
        setATierData({
          ...aTierData,
          org_internal_investigations: [
            newRecord,
            ...(aTierData.org_internal_investigations || []),
          ],
        });
        // reset form
        setNewInvestigation({
          actual_capacity: "",
          technical_team_eval: "",
          real_key_clients: "",
          cooperation_willingness: "B",
          internal_notes: "",
          actual_team_size: 0,
          tech_maturity_score: 3,
          market_influence_score: 3,
          risk_level: "Low",
        });
      } else {
        toast.error("添加失败", {
          description:
            result.message ||
            "输入数据可能超出范围（例如：评分需为1-5分，人数不能为负数）。",
        });
      }
    } catch (err) {
      toast.error("网络异常，请重试");
    } finally {
      setIsAddingInvestigation(false);
    }
  };

  const sortedInvestigations = [
    ...(aTierData.org_internal_investigations || []),
  ].sort(
    (a, b) =>
      new Date(b.investigation_date).getTime() -
      new Date(a.investigation_date).getTime(),
  );

  return (
    <>
      <div className="grid h-[calc(100vh-140px)] grid-cols-1 gap-8 md:grid-cols-12">
        {/* 左侧：A层全景信息 (占5列) */}
        <div className="col-span-5 flex h-full min-h-0 flex-col overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b bg-slate-50 px-4 py-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="flex items-center gap-2 font-semibold text-slate-800">
                  <Briefcase className="h-4 w-4 text-blue-500" />
                  企业管理全景 (A 层)
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  展示企业填报的全量维度，支持秘书处审核修润与状态变更。
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 border-t border-dashed border-slate-200 pt-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-700">
                    业务状态:
                  </span>
                  <Select
                    value={aTierData.status || "pending_review"}
                    onValueChange={(val) =>
                      setATierData({ ...aTierData, status: val })
                    }
                  >
                    <SelectTrigger className="h-8 w-[140px] bg-white text-xs">
                      <SelectValue placeholder="状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">草稿</SelectItem>
                      <SelectItem value="pending_review">待出访尽调</SelectItem>
                      <SelectItem value="published">正式入库</SelectItem>
                      <SelectItem value="rejected">作废退回</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button size="sm" onClick={handleATierSave} disabled={isSaving}>
                  <Save className="mr-1 h-4 w-4" /> 保存全案
                </Button>
              </div>

              {aTierData.status === "rejected" && (
                <div className="mt-1 space-y-1 animate-in fade-in slide-in-from-top-1">
                  <Label className="text-[10px] font-semibold uppercase text-red-600">
                    退回理由 (企业可见)
                  </Label>
                  <Textarea
                    className="h-16 border-red-200 bg-red-50/30 text-xs"
                    placeholder="请输入退回具体理由，告知企业如何修改..."
                    value={aTierData.rejection_reason || ""}
                    onChange={(e) =>
                      setATierData({
                        ...aTierData,
                        rejection_reason: e.target.value,
                      })
                    }
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <FormProvider {...form}>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="mb-4 grid w-full grid-cols-4">
                  <TabsTrigger value="basic" className="text-xs">
                    基础信息
                  </TabsTrigger>
                  <TabsTrigger value="products" className="text-xs">
                    产品能力
                  </TabsTrigger>
                  <TabsTrigger value="cases" className="text-xs">
                    场景案例
                  </TabsTrigger>
                  <TabsTrigger value="needs" className="text-xs">
                    合规需求
                  </TabsTrigger>
                </TabsList>
                <div className="space-y-4">
                  <TabsContent
                    value="basic"
                    className="mt-0 rounded-lg border p-4"
                  >
                    <BasicInfoStep />
                  </TabsContent>
                  <TabsContent
                    value="products"
                    className="mt-0 rounded-lg border p-4"
                  >
                    <ProductsStep />
                  </TabsContent>
                  <TabsContent
                    value="cases"
                    className="mt-0 rounded-lg border p-4"
                  >
                    <CasesStep />
                  </TabsContent>
                  <TabsContent
                    value="needs"
                    className="mt-0 rounded-lg border p-4"
                  >
                    <NeedsStep />
                  </TabsContent>
                </div>
              </Tabs>
            </FormProvider>
          </div>
        </div>

        {/* 右侧：B/C 层 尽调工作台 (占7列) */}
        <div className="col-span-7 flex h-full min-h-0 flex-col overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b bg-slate-50 px-4 py-3">
            <div>
              <h3 className="flex items-center gap-2 font-semibold text-slate-800">
                <SearchCode className="h-4 w-4 text-amber-500" />
                尽调校验核阅台
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                此区域为秘书处专属绝密视图，企业侧无法查看。
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
              onClick={handleGenerateSurvey}
            >
              <Copy className="mr-1 h-4 w-4" /> 一键生成外出走访资料包
            </Button>
          </div>

          {/* 数据可信度自评价评估区 */}
          <div className="border-b bg-amber-50/30 px-5 py-4">
            {(() => {
              const evalResult = evaluateCompanyData(aTierData);
              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldAlert
                        className={`h-5 w-5 ${evalResult.healthScore < 60 ? "text-red-500" : "text-amber-500"}`}
                      />
                      <span className="text-sm font-semibold text-slate-700">
                        数据可信度综合评估 (Beta)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">
                        {evalResult.healthScore} / 100
                      </span>
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-full ${evalResult.healthScore < 60 ? "bg-red-500" : "bg-green-500"}`}
                          style={{ width: `${evalResult.healthScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {evalResult.discrepancies.map((d, i) => (
                      <div
                        key={i}
                        className={`flex items-start gap-1 rounded p-2 text-xs ${d.severity === "high" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}
                      >
                        <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
                        <span>{d.description}</span>
                      </div>
                    ))}
                    {evalResult.discrepancies.length === 0 && (
                      <div className="flex items-center gap-1 rounded bg-green-100 p-2 text-xs text-green-800">
                        <CheckCircle2 className="h-3 w-3 shrink-0" />
                        <span>数据一致度高，暂无明显偏差风险。</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] italic text-slate-500">
                    评估建议：{evalResult.recommendation}
                  </p>
                </div>
              );
            })()}
          </div>

          <Tabs defaultValue="tierC" className="flex min-h-0 flex-1 flex-col">
            <TabsList className="h-12 w-full justify-start rounded-none border-b bg-transparent px-4">
              <TabsTrigger
                value="tierB"
                className="h-full rounded-none bg-transparent shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
              >
                第三方征信底盘 (B层)
              </TabsTrigger>
              <TabsTrigger
                value="tierC"
                className="h-full rounded-none bg-transparent shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
              >
                内部评价与走访记录 (C层)
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="tierB"
              className="m-0 flex-1 overflow-y-auto p-5"
            >
              <div className="flex h-[300px] flex-col items-center justify-center rounded-lg border bg-slate-50/50 p-6 text-center">
                <SearchCode className="mb-4 h-10 w-10 text-slate-300" />
                <h4 className="mb-1 text-sm font-medium text-slate-700">
                  接口暂未连接企查查API
                </h4>
                <p className="max-w-[300px] text-xs text-slate-500">
                  此处未来可接入企查查商业接口，自动化回显此公司的“注册资本、实缴资本、涉诉情况”来校验B端企业虚报。
                </p>
                <Button variant="secondary" size="sm" className="mt-4">
                  手动更新天眼数据
                </Button>
              </div>
            </TabsContent>

            <TabsContent
              value="tierC"
              className="m-0 flex-1 space-y-6 overflow-y-auto p-5"
            >
              <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 flex items-center gap-2 border-b pb-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-slate-800">
                    秘书处核核专区 (数据保真工具)
                  </h4>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">信用代码核验</Label>
                    <Select
                      value={aTierData.credit_code_status || "pending"}
                      onValueChange={(val) =>
                        setATierData({ ...aTierData, credit_code_status: val })
                      }
                    >
                      <SelectTrigger className="h-8 bg-white text-xs">
                        <SelectValue placeholder="选择状态" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">待核验</SelectItem>
                        <SelectItem value="verified">
                          ✅ 已核验 (真实)
                        </SelectItem>
                        <SelectItem value="invalid">
                          ❌ 查无此号/错误
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">证明材料审查</Label>
                    <Select
                      value={aTierData.evidence_status || "pending"}
                      onValueChange={(val) =>
                        setATierData({ ...aTierData, evidence_status: val })
                      }
                    >
                      <SelectTrigger className="h-8 bg-white text-xs">
                        <SelectValue placeholder="选择状态" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">待审查</SelectItem>
                        <SelectItem value="verified">✅ 证明完整</SelectItem>
                        <SelectItem value="insufficient">
                          ⚠️ 材料不足
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">联络有效性</Label>
                    <Select
                      value={aTierData.contact_status || "pending"}
                      onValueChange={(val) =>
                        setATierData({ ...aTierData, contact_status: val })
                      }
                    >
                      <SelectTrigger className="h-8 bg-white text-xs">
                        <SelectValue placeholder="选择状态" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">待拨打</SelectItem>
                        <SelectItem value="verified">✅ 电话畅通</SelectItem>
                        <SelectItem value="unreachable">
                          ❌ 关机/空号/拒绝
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium">
                      档案完整度评分 ({aTierData.completion_rate || 0}%)
                    </Label>
                  </div>
                  <Slider
                    value={[aTierData.completion_rate || 0]}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={(val) =>
                      setATierData({ ...aTierData, completion_rate: val[0] })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">
                      秘书处推荐应用场景
                    </Label>
                    <Textarea
                      className="h-20 bg-white text-xs"
                      placeholder="根据尽调结果，推荐的下游匹配场景..."
                      value={aTierData.recommended_scenarios || ""}
                      onChange={(e) =>
                        setATierData({
                          ...aTierData,
                          recommended_scenarios: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">
                      内部核验备注 (不对外展示)
                    </Label>
                    <Textarea
                      className="h-20 bg-white text-xs"
                      placeholder="仅供秘书处内部决策参考的私密备注..."
                      value={aTierData.secretariat_comments || ""}
                      onChange={(e) =>
                        setATierData({
                          ...aTierData,
                          secretariat_comments: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50/50 p-4">
                <div>
                  <h4 className="font-medium text-blue-900">
                    核心工序图谱 (仅内部可见)
                  </h4>
                  <p className="mt-1 text-xs text-blue-600">
                    下方标签由尽调员实地探访后打出，具最高权重。
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge
                    variant="outline"
                    className="border-blue-200 bg-white text-blue-700"
                  >
                    意愿度: 高 (A类)
                  </Badge>
                </div>
              </div>

              <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent md:before:mx-auto md:before:translate-x-0">
                {sortedInvestigations.map((inv: any, idx: number) => (
                  <div
                    key={inv.id || idx}
                    className="is-active group relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse"
                  >
                    <div className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white bg-blue-500 text-white shadow md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      <History className="h-4 w-4" />
                    </div>

                    <div className="w-[calc(100%-4rem)] rounded border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md md:w-[calc(50%-2.5rem)]">
                      <div className="mb-1 flex items-center justify-between space-x-2">
                        <div className="text-sm font-bold text-slate-900">
                          {inv.investigator} 留存记录
                        </div>
                        <time className="text-right text-xs font-medium text-blue-500">
                          {format(new Date(inv.investigation_date), "PPpp", {
                            locale: zhCN,
                          })}
                        </time>
                      </div>
                      <div className="mt-3 space-y-2 text-xs text-slate-600">
                        {inv.actual_capacity && (
                          <p>
                            <strong className="text-slate-800">
                              实地产能与规模：
                            </strong>
                            <br />
                            {inv.actual_capacity}
                          </p>
                        )}
                        {inv.actual_team_size && (
                          <p>
                            <strong className="text-slate-800">
                              核实团队规模：
                            </strong>{" "}
                            {inv.actual_team_size} 人
                          </p>
                        )}
                        {inv.technical_team_eval && (
                          <p>
                            <strong className="text-slate-800">
                              技术团队真实评估：
                            </strong>
                            <br />
                            {inv.technical_team_eval}
                          </p>
                        )}
                        {inv.real_key_clients && (
                          <p>
                            <strong className="text-slate-800">
                              大客户底细与客情：
                            </strong>
                            <br />
                            {inv.real_key_clients}
                          </p>
                        )}
                        {inv.internal_notes && (
                          <p>
                            <strong className="text-slate-800">
                              避坑指南/内部备注：
                            </strong>
                            <br />
                            {inv.internal_notes}
                          </p>
                        )}
                        <div className="mt-3 flex gap-4 border-t pt-3 text-[10px] text-slate-500">
                          <span>
                            技术成熟度: {inv.tech_maturity_score || "-"}/5
                          </span>
                          <span>
                            市场影响力: {inv.market_influence_score || "-"}/5
                          </span>
                          <span>风险等级: {inv.risk_level || "未知"}</span>
                        </div>
                        <p className="mt-2 border-t pt-2">
                          <strong className="text-slate-800">
                            联盟合作意愿评级：
                          </strong>{" "}
                          <Badge variant="outline">
                            {inv.cooperation_willingness} 类
                          </Badge>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {sortedInvestigations.length === 0 && (
                  <div className="relative z-10 rounded-lg border border-dashed bg-slate-50 py-8 text-center text-sm text-slate-500">
                    暂无任何实地走访记录。
                  </div>
                )}

                <div className="group relative mt-8 flex items-center justify-between md:justify-normal md:odd:flex-row-reverse">
                  <div className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white bg-slate-200 text-slate-500 shadow md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <History className="h-4 w-4" />
                  </div>

                  <div className="w-[calc(100%-4rem)] p-4 opacity-70 transition-opacity hover:opacity-100 md:w-[calc(50%-2.5rem)]">
                    <Button
                      variant="outline"
                      className="w-full border-dashed bg-white"
                      size="sm"
                      onClick={() => setIsInvestigationDialogOpen(true)}
                    >
                      + 新增尽调核查记录
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* 走访资料包打印弹窗 */}
        <Dialog open={isSurveyDialogOpen} onOpenChange={setIsSurveyDialogOpen}>
          <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                企业专属尽调走访包 - {aTierData?.company_name || "未命名企业"}
              </DialogTitle>
              <DialogDescription>
                请带着这份资料前往企业现场。高亮红色的区域为本次尽调需要重点核实的项目。
              </DialogDescription>
            </DialogHeader>

            <div
              id="printable-survey-package"
              className="mt-4 space-y-6 rounded-md border bg-white p-4 font-sans text-sm"
            >
              <div className="border-b pb-4 text-center">
                <h1 className="text-xl font-bold">联盟日常尽调查勘单</h1>
                <p className="mt-2 text-slate-500">
                  企业：{aTierData?.company_name || "未命名企业"} | 编号：
                  {companyId.slice(0, 8)}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="border-b pb-1 font-bold">
                  1. 已知基本诉求 (A层)
                </h3>
                <p>
                  <strong>主营业务介绍：</strong> <br />
                  {aTierData?.core_business || "暂无介绍"}
                </p>
                <p>
                  <strong>宣称客户群体：</strong>{" "}
                  {aTierData?.key_clients_claimed
                    ? JSON.stringify(aTierData.key_clients_claimed)
                    : "未填写"}
                </p>
              </div>

              <div className="space-y-4 rounded-md border border-red-200 bg-red-50 p-4">
                <h3 className="flex items-center gap-2 font-bold text-red-800">
                  重点核实任务区 (系统自动计算)
                </h3>
                <ul className="list-disc space-y-1 pl-5 text-red-700">
                  {!aTierData?.key_clients_claimed && (
                    <li>
                      <strong>大单客情缺失：</strong>{" "}
                      企业填报时未明确核心客户清单，请在本次交流中追问真实的标杆大客户，并记录份额大小。
                    </li>
                  )}
                  {!aTierData?.expected_resources && (
                    <li>
                      <strong>对接诉求不明确：</strong>{" "}
                      企业未填写期望获得的联盟资源，请在现场帮其发掘其目前最大的痛点（资金、订单、政策）。
                    </li>
                  )}
                  <li>
                    <strong>真实性考核：</strong>{" "}
                    请肉眼评估其实际生产区域面积与设备闲置率。
                  </li>
                </ul>
              </div>

              <div className="mt-8 space-y-2 border-t pt-4">
                <h3 className="font-bold">
                  2. 核心核验数据反填区 (请尽调员手写或随后填入系统)
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-16 rounded border border-slate-300 p-2">
                    实际有效产能:{" "}
                  </div>
                  <div className="h-16 rounded border border-slate-300 p-2">
                    技术团队真实水分:{" "}
                  </div>
                  <div className="col-span-2 block h-16 rounded border border-slate-300 p-2">
                    内部合作意愿(A/B/C)与隐患：
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsSurveyDialogOpen(false)}
              >
                关闭
              </Button>
              <Button
                onClick={() => {
                  const printableElement = document.getElementById(
                    "printable-survey-package",
                  );
                  if (printableElement) {
                    const printContents = printableElement.innerHTML;
                    const originalContents = document.body.innerHTML;
                    document.body.innerHTML = printContents;
                    window.print();
                    document.body.innerHTML = originalContents;
                    window.location.reload();
                  }
                }}
              >
                <Printer className="mr-2 h-4 w-4" />
                打印 / 导出 PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* 添加尽调记录弹窗 */}
      <Dialog
        open={isInvestigationDialogOpen}
        onOpenChange={setIsInvestigationDialogOpen}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>新增尽调走访记录</DialogTitle>
            <DialogDescription>
              请如实填写对 【{aTierData?.company_name || "该企业"}】
              的实地探访或深度背调结果。此记录仅联盟秘书处内部可见。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs">实地产能与规模核实</Label>
              <Textarea
                placeholder="例如：位于XX科技园，实际占地约2000平，研发人员占比不高..."
                className="h-20 text-sm"
                value={newInvestigation.actual_capacity}
                onChange={(e) =>
                  setNewInvestigation({
                    ...newInvestigation,
                    actual_capacity: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">技术团队真实评估</Label>
              <Textarea
                placeholder="例如：核心算法多为开源微调，缺乏底层自研能力..."
                className="h-16 text-sm"
                value={newInvestigation.technical_team_eval}
                onChange={(e) =>
                  setNewInvestigation({
                    ...newInvestigation,
                    technical_team_eval: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">大客户底细与客情核查</Label>
              <Textarea
                placeholder="例如：宣称的吉利汽车，实则只做了一期几十万的外包..."
                className="h-16 text-sm"
                value={newInvestigation.real_key_clients}
                onChange={(e) =>
                  setNewInvestigation({
                    ...newInvestigation,
                    real_key_clients: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">核实真实人员规模 (人)</Label>
                <Input
                  type="number"
                  className="h-8 text-sm"
                  value={newInvestigation.actual_team_size}
                  onChange={(e) =>
                    setNewInvestigation({
                      ...newInvestigation,
                      actual_team_size: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">风险等级</Label>
                <Select
                  value={newInvestigation.risk_level}
                  onValueChange={(val) =>
                    setNewInvestigation({
                      ...newInvestigation,
                      risk_level: val,
                    })
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="风险评估" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">低风险 (健康)</SelectItem>
                    <SelectItem value="Medium">中风险 (需关注)</SelectItem>
                    <SelectItem value="High">高风险 (警惕)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">
                    技术成熟度 ({newInvestigation.tech_maturity_score})
                  </Label>
                </div>
                <Slider
                  value={[newInvestigation.tech_maturity_score]}
                  min={1}
                  max={5}
                  step={1}
                  onValueChange={(val) =>
                    setNewInvestigation({
                      ...newInvestigation,
                      tech_maturity_score: val[0],
                    })
                  }
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">
                    市场影响力 ({newInvestigation.market_influence_score})
                  </Label>
                </div>
                <Slider
                  value={[newInvestigation.market_influence_score]}
                  min={1}
                  max={5}
                  step={1}
                  onValueChange={(val) =>
                    setNewInvestigation({
                      ...newInvestigation,
                      market_influence_score: val[0],
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">避坑指南 / 内部安全备注</Label>
              <Textarea
                placeholder="例如：高管即将离职创业，建议暂缓深度对接..."
                className="h-16 bg-red-50 text-sm focus-visible:ring-red-500"
                value={newInvestigation.internal_notes}
                onChange={(e) =>
                  setNewInvestigation({
                    ...newInvestigation,
                    internal_notes: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">联盟合作意愿评级</Label>
              <Select
                value={newInvestigation.cooperation_willingness}
                onValueChange={(val) =>
                  setNewInvestigation({
                    ...newInvestigation,
                    cooperation_willingness: val,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择意愿度" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">
                    A类 (强烈参与, 资源置换意愿高)
                  </SelectItem>
                  <SelectItem value="B">
                    B类 (观望中, 期望先索取资源)
                  </SelectItem>
                  <SelectItem value="C">C类 (意愿低/失联/仅为入库)</SelectItem>
                  <SelectItem value="D">D类 (列入黑名单)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsInvestigationDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              onClick={handleAddInvestigation}
              disabled={isAddingInvestigation}
            >
              {isAddingInvestigation ? "提交中..." : "保存记录并上墙"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
