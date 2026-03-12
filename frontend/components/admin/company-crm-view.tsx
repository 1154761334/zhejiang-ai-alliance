"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Copy, Save, Briefcase, SearchCode, History, Printer } from "lucide-react";
import { toast } from "sonner";
import { updateCompanyTierA, addInternalInvestigation } from "@/actions/update-company-crm";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { evaluateCompanyData } from "@/lib/evaluation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export function CompanyCrmView({ companyId, initialCompanyData }: { companyId: string; initialCompanyData: any }) {
  const [aTierData, setATierData] = useState(initialCompanyData);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingInvestigation, setIsAddingInvestigation] = useState(false);
  const [isInvestigationDialogOpen, setIsInvestigationDialogOpen] = useState(false);
  const [isSurveyDialogOpen, setIsSurveyDialogOpen] = useState(false);
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
      const result = await updateCompanyTierA(companyId, aTierData);
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
      const result = await addInternalInvestigation(companyId, newInvestigation);
      if (result.status === "success") {
        toast.success("尽调记录已添加！");
        setIsInvestigationDialogOpen(false);
        // Optimistically update the UI
        const newRecord = {
          ...newInvestigation,
          id: Math.random().toString(), // fake ID for optimistic UI
          investigator: "Admin", // default since we don't have session data in the client easily here, it updates on refresh
          investigation_date: new Date().toISOString()
        };
        setATierData({
            ...aTierData,
            org_internal_investigations: [newRecord, ...(aTierData.org_internal_investigations || [])]
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
          description: result.message || "输入数据可能超出范围（例如：评分需为1-5分，人数不能为负数）。"
        });
      }
    } catch (err) {
      toast.error("网络异常，请重试");
    } finally {
      setIsAddingInvestigation(false);
    }
  };

  const sortedInvestigations = [...(aTierData.org_internal_investigations || [])].sort(
      (a, b) => new Date(b.investigation_date).getTime() - new Date(a.investigation_date).getTime()
  );

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-[calc(100vh-140px)]">
      {/* 左侧：A层全景信息 (占5列) */}
      <div className="col-span-5 h-full flex flex-col min-h-0 bg-white border rounded-xl overflow-hidden shadow-sm">
        <div className="bg-slate-50 border-b px-4 py-3 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-500" />
                企业管理全景 (A 层)
              </h3>
              <p className="text-xs text-slate-500 mt-1">展示企业填报的全量维度，支持秘书处审核修润与状态变更。</p>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 border-dashed pt-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">业务状态:</span>
              <Select value={aTierData.status || "pending_review"} onValueChange={(val) => setATierData({...aTierData, status: val})}>
                  <SelectTrigger className="w-[140px] h-8 text-xs bg-white">
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
              <Save className="w-4 h-4 mr-1" /> 保存全案
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-1">
          <Accordion type="multiple" defaultValue={["base", "contact", "business", "relations"]} className="w-full">
            
            <AccordionItem value="base" className="px-4 border-b pb-2">
              <AccordionTrigger className="text-sm text-indigo-700 hover:no-underline">工商基座信息</AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs text-slate-500">企业对外全称</Label>
                    <Input className="h-8 text-sm" value={aTierData.company_name || ""} onChange={(e) => setATierData({...aTierData, company_name: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-500">信用代码</Label>
                    <Input className="h-8 text-sm" value={aTierData.credit_code || ""} onChange={(e) => setATierData({...aTierData, credit_code: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-500">成立时间</Label>
                    <Input type="date" className="h-8 text-sm" value={aTierData.established_date || ""} onChange={(e) => setATierData({...aTierData, established_date: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-500">所在区域</Label>
                    <Input className="h-8 text-sm" value={aTierData.region || ""} onChange={(e) => setATierData({...aTierData, region: e.target.value})} />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs text-slate-500">详细地址</Label>
                    <Input className="h-8 text-sm" value={aTierData.address || ""} onChange={(e) => setATierData({...aTierData, address: e.target.value})} />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs text-slate-500">官网地址</Label>
                    <Input className="h-8 text-sm" value={aTierData.website || ""} onChange={(e) => setATierData({...aTierData, website: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-500">企业类型</Label>
                    <Input className="h-8 text-sm" value={aTierData.company_type || ""} onChange={(e) => setATierData({...aTierData, company_type: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-500">营收范围 (万元)</Label>
                    <Input className="h-8 text-sm" value={aTierData.revenue_range || ""} onChange={(e) => setATierData({...aTierData, revenue_range: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-500">人员规模</Label>
                    <Input type="number" className="h-8 text-sm" value={aTierData.employee_count || ""} onChange={(e) => setATierData({...aTierData, employee_count: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-500">研发人数</Label>
                    <Input type="number" className="h-8 text-sm" value={aTierData.rnd_count || ""} onChange={(e) => setATierData({...aTierData, rnd_count: Number(e.target.value)})} />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="contact" className="px-4 border-b pb-2 bg-slate-50/50">
              <AccordionTrigger className="text-sm text-indigo-700 hover:no-underline">高管联络方式 (高密)</AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-500">联系人姓名</Label>
                    <Input className="h-8 text-sm" value={aTierData.contact_name || ""} onChange={(e) => setATierData({...aTierData, contact_name: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-500">职务</Label>
                    <Input className="h-8 text-sm" value={aTierData.contact_position || ""} onChange={(e) => setATierData({...aTierData, contact_position: e.target.value})} />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs text-slate-500">手机号码</Label>
                    <Input className="h-8 text-sm" value={aTierData.contact_phone || ""} onChange={(e) => setATierData({...aTierData, contact_phone: e.target.value})} />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="business" className="px-4 border-b pb-2">
              <AccordionTrigger className="text-sm text-indigo-700 hover:no-underline">核心业务与协同诉求</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <Label className="text-xs text-slate-500">生态角色定位</Label>
                        <Select value={aTierData.role || ""} onValueChange={(val) => setATierData({...aTierData, role: val})}>
                            <SelectTrigger className="h-8 text-sm">
                                <SelectValue placeholder="选择角色" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="provider">智算算力供给方</SelectItem>
                                <SelectItem value="developer">模型应用开发侧</SelectItem>
                                <SelectItem value="user">场景需求采买方</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs text-slate-500">赛道标签 (逗号分隔)</Label>
                        <Input className="h-8 text-sm" value={aTierData.tracks?.join(', ') || ""} 
                            onChange={(e) => setATierData({...aTierData, tracks: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} 
                        />
                    </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500">自称核心客户圈 (逗号分隔)</Label>
                  <Input className="h-8 text-sm" placeholder="例如: 阿里, 腾讯" value={
                      Array.isArray(aTierData.key_clients_claimed) 
                        ? aTierData.key_clients_claimed.map((c: any) => c.client_name || c).join(', ') 
                        : (aTierData.key_clients_claimed || "")
                  } onChange={(e) => {
                      setATierData({...aTierData, key_clients_claimed: e.target.value.split(',').map(s=>({client_name: s.trim()}))})
                  }} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500">主营业务简介</Label>
                  <Textarea className="resize-none h-24 text-sm" value={aTierData.core_business || ""} onChange={(e) => setATierData({...aTierData, core_business: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500">期望从联盟获取的赋能</Label>
                  <Textarea className="resize-none h-16 text-sm" value={aTierData.expected_resources || ""} onChange={(e) => setATierData({...aTierData, expected_resources: e.target.value})} />
                </div>

                <div className="space-y-2 pt-4 border-t mt-4 border-dashed">
                  <h4 className="text-xs font-semibold text-slate-700">需求与赋能意向 (由系统打散在附加表中)</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-500">融资需求 (逗号分隔)</Label>
                      <Input className="h-8 text-sm" value={(aTierData.survey_needs?.[0]?.financing_need || []).join(', ')} onChange={(e) => {
                        const needs = [...(aTierData.survey_needs || [{}])];
                        needs[0] = { ...needs[0], financing_need: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) };
                        setATierData({ ...aTierData, survey_needs: needs });
                      }} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-500">市场拓展需求 (逗号分隔)</Label>
                      <Input className="h-8 text-sm" value={(aTierData.survey_needs?.[0]?.market_need || []).join(', ')} onChange={(e) => {
                        const needs = [...(aTierData.survey_needs || [{}])];
                        needs[0] = { ...needs[0], market_need: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) };
                        setATierData({ ...aTierData, survey_needs: needs });
                      }} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-500">算力痛点 (逗号分隔)</Label>
                      <Input className="h-8 text-sm" value={(aTierData.survey_needs?.[0]?.compute_pain_points || []).join(', ')} onChange={(e) => {
                        const needs = [...(aTierData.survey_needs || [{}])];
                        needs[0] = { ...needs[0], compute_pain_points: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) };
                        setATierData({ ...aTierData, survey_needs: needs });
                      }} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-500">近期活动意向 (逗号分隔)</Label>
                      <Input className="h-8 text-sm" value={(aTierData.survey_needs?.[0]?.policy_intent || []).join(', ')} onChange={(e) => {
                        const needs = [...(aTierData.survey_needs || [{}])];
                        needs[0] = { ...needs[0], policy_intent: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) };
                        setATierData({ ...aTierData, survey_needs: needs });
                      }} />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs text-slate-500">技术互补诉求描述</Label>
                      <Textarea className="resize-none h-16 text-sm" value={aTierData.survey_needs?.[0]?.tech_complement_desc || ""} onChange={(e) => {
                        const needs = [...(aTierData.survey_needs || [{}])];
                        needs[0] = { ...needs[0], tech_complement_desc: e.target.value };
                        setATierData({ ...aTierData, survey_needs: needs });
                      }} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t mt-4 border-dashed">
                  <h4 className="text-xs font-semibold text-slate-700">合规与安全承诺 (合规表)</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs text-slate-500">数据安全措施简述</Label>
                      <Textarea className="resize-none h-16 text-sm" value={aTierData.compliance_risks?.[0]?.data_security_measures || ""} onChange={(e) => {
                        const risks = [...(aTierData.compliance_risks || [{}])];
                        risks[0] = { ...risks[0], data_security_measures: e.target.value };
                        setATierData({ ...aTierData, compliance_risks: risks });
                      }} />
                    </div>
                    <div className="space-y-1 flex items-center gap-2">
                      <input type="checkbox" className="h-4 w-4" checked={aTierData.compliance_risks?.[0]?.has_mlps_certification || false} onChange={(e) => {
                        const risks = [...(aTierData.compliance_risks || [{}])];
                        risks[0] = { ...risks[0], has_mlps_certification: e.target.checked };
                        setATierData({ ...aTierData, compliance_risks: risks });
                      }} />
                      <Label className="text-xs text-slate-500">已通过等保安全认证</Label>
                    </div>
                    <div className="space-y-1 flex items-center gap-2">
                      <input type="checkbox" className="h-4 w-4" checked={aTierData.compliance_risks?.[0]?.processes_pii || false} onChange={(e) => {
                        const risks = [...(aTierData.compliance_risks || [{}])];
                        risks[0] = { ...risks[0], processes_pii: e.target.checked };
                        setATierData({ ...aTierData, compliance_risks: risks });
                      }} />
                      <Label className="text-xs text-slate-500">涉处理用户敏感隐私数据 (PII)</Label>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="relations" className="px-4 border-b-0 pb-2 bg-slate-50/50">
              <AccordionTrigger className="text-sm text-indigo-700 hover:no-underline">提报附表清单 (只读索引)</AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                <div className="text-xs text-slate-600 space-y-2">
                    <div className="border border-slate-200 rounded p-2 bg-white flex justify-between items-center pr-3 shadow-sm hover:border-slate-300 transition-colors">
                        <span className="flex items-center gap-1.5"><span className="text-blue-500">🚀</span> 自研AI产品与解决方案</span>
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700">{aTierData.products?.length || 0} 项</Badge>
                    </div>
                    <div className="border border-slate-200 rounded p-2 bg-white flex justify-between items-center pr-3 shadow-sm hover:border-slate-300 transition-colors">
                        <span className="flex items-center gap-1.5"><span className="text-amber-500">🏆</span> 沉淀的行业标杆案例</span>
                        <Badge variant="secondary" className="bg-amber-50 text-amber-700">{aTierData.case_studies?.length || 0} 项</Badge>
                    </div>
                    <div className="border border-slate-200 rounded p-2 bg-white flex justify-between items-center pr-3 shadow-sm hover:border-slate-300 transition-colors">
                        <span className="flex items-center gap-1.5"><span className="text-red-500">⚠️</span> 痛点/转型突破口提报</span>
                        <Badge variant="secondary" className="bg-red-50 text-red-700">{aTierData.survey_needs?.length || 0} 项</Badge>
                    </div>
                </div>
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </div>
      </div>

      {/* 右侧：B/C 层 尽调工作台 (占7列) */}
      <div className="col-span-7 h-full flex flex-col min-h-0 bg-white border rounded-xl overflow-hidden shadow-sm">
        <div className="bg-slate-50 border-b px-4 py-3 flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <SearchCode className="w-4 h-4 text-amber-500" />
              尽调校验核阅台
            </h3>
            <p className="text-xs text-slate-500 mt-1">此区域为秘书处专属绝密视图，企业侧无法查看。</p>
          </div>
          <Button size="sm" variant="outline" className="border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100" onClick={handleGenerateSurvey}>
            <Copy className="w-4 h-4 mr-1" /> 一键生成外出走访资料包
          </Button>
        </div>

        {/* 数据可信度自评价评估区 */}
        <div className="px-5 py-4 border-b bg-amber-50/30">
            {(() => {
                const evalResult = evaluateCompanyData(aTierData);
                return (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ShieldAlert className={`w-5 h-5 ${evalResult.healthScore < 60 ? 'text-red-500' : 'text-amber-500'}`} />
                                <span className="text-sm font-semibold text-slate-700">数据可信度综合评估 (Beta)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold">{evalResult.healthScore} / 100</span>
                                <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full ${evalResult.healthScore < 60 ? 'bg-red-500' : 'bg-green-500'}`} 
                                        style={{ width: `${evalResult.healthScore}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-2">
                            {evalResult.discrepancies.map((d, i) => (
                                <div key={i} className={`text-xs flex items-start gap-1 p-2 rounded ${d.severity === 'high' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                                    <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                                    <span>{d.description}</span>
                                </div>
                            ))}
                            {evalResult.discrepancies.length === 0 && (
                                <div className="text-xs flex items-center gap-1 p-2 rounded bg-green-100 text-green-800">
                                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                                    <span>数据一致度高，暂无明显偏差风险。</span>
                                </div>
                            )}
                        </div>
                        <p className="text-[11px] text-slate-500 italic">评估建议：{evalResult.recommendation}</p>
                    </div>
                );
            })()}
        </div>

        <Tabs defaultValue="tierC" className="flex-1 flex flex-col min-h-0">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-4 h-12">
            <TabsTrigger value="tierB" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full shadow-none bg-transparent">
              第三方征信底盘 (B层)
            </TabsTrigger>
            <TabsTrigger value="tierC" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full shadow-none bg-transparent">
              内部评价与走访记录 (C层)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tierB" className="flex-1 overflow-y-auto p-5 m-0">
            <div className="rounded-lg border bg-slate-50/50 p-6 flex flex-col items-center justify-center text-center h-[300px]">
              <SearchCode className="w-10 h-10 text-slate-300 mb-4" />
              <h4 className="text-sm font-medium text-slate-700 mb-1">接口暂未连接企查查API</h4>
              <p className="text-xs text-slate-500 max-w-[300px]">
                此处未来可接入企查查商业接口，自动化回显此公司的“注册资本、实缴资本、涉诉情况”来校验B端企业虚报。
              </p>
              <Button variant="secondary" size="sm" className="mt-4">手动更新天眼数据</Button>
            </div>
          </TabsContent>

          <TabsContent value="tierC" className="flex-1 overflow-y-auto p-5 m-0 space-y-6">
            <div className="flex justify-between items-center bg-blue-50/50 p-4 rounded-lg border border-blue-100">
               <div>
                  <h4 className="font-medium text-blue-900">核心工序图谱 (仅内部可见)</h4>
                  <p className="text-xs text-blue-600 mt-1">下方标签由尽调员实地探访后打出，具最高权重。</p>
               </div>
               <div className="flex gap-2">
                  <Badge variant="outline" className="bg-white border-blue-200 text-blue-700">意愿度: 高 (A类)</Badge>
                  <Button size="sm" variant="outline">编辑</Button>
               </div>
            </div>

            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                {sortedInvestigations.map((inv: any, idx: number) => (
                  <div key={inv.id || idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                          <History className="w-4 h-4" />
                      </div>
                      
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between space-x-2 mb-1">
                              <div className="font-bold text-slate-900 text-sm">{inv.investigator} 留存记录</div>
                              <time className="font-medium text-blue-500 text-xs text-right">
                                  {format(new Date(inv.investigation_date), "PPpp", { locale: zhCN })}
                              </time>
                          </div>
                          <div className="text-slate-600 text-xs space-y-2 mt-3">
                             {inv.actual_capacity && <p><strong className="text-slate-800">实地产能与规模：</strong><br/>{inv.actual_capacity}</p>}
                             {inv.actual_team_size && <p><strong className="text-slate-800">核实团队规模：</strong> {inv.actual_team_size} 人</p>}
                             {inv.technical_team_eval && <p><strong className="text-slate-800">技术团队真实评估：</strong><br/>{inv.technical_team_eval}</p>}
                             {inv.real_key_clients && <p><strong className="text-slate-800">大客户底细与客情：</strong><br/>{inv.real_key_clients}</p>}
                             {inv.internal_notes && <p><strong className="text-slate-800">避坑指南/内部备注：</strong><br/>{inv.internal_notes}</p>}
                             <div className="flex gap-4 pt-3 border-t mt-3 text-[10px] text-slate-500">
                                <span>技术成熟度: {inv.tech_maturity_score || '-'}/5</span>
                                <span>市场影响力: {inv.market_influence_score || '-'}/5</span>
                                <span>风险等级: {inv.risk_level || '未知'}</span>
                             </div>
                             <p className="pt-2 border-t mt-2"><strong className="text-slate-800">联盟合作意愿评级：</strong> <Badge variant="outline">{inv.cooperation_willingness} 类</Badge></p>
                          </div>
                      </div>
                  </div>
                ))}

                 {sortedInvestigations.length === 0 && (
                     <div className="text-center text-sm text-slate-500 py-8 relative z-10 bg-slate-50 border border-dashed rounded-lg">
                         暂无任何实地走访记录。
                     </div>
                 )}

                 <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group mt-8">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-200 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <History className="w-4 h-4" />
                    </div>
                    
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 opacity-70 hover:opacity-100 transition-opacity">
                        <Button variant="outline" className="w-full border-dashed bg-white" size="sm" onClick={() => setIsInvestigationDialogOpen(true)}>
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>企业专属尽调走访包 - {aTierData?.company_name || '未命名企业'}</DialogTitle>
            <DialogDescription>
              请带着这份资料前往企业现场。高亮红色的区域为本次尽调需要重点核实的项目。
            </DialogDescription>
          </DialogHeader>
          
          <div id="printable-survey-package" className="space-y-6 p-4 border rounded-md bg-white mt-4 text-sm font-sans">
            <div className="border-b pb-4 text-center">
               <h1 className="text-xl font-bold">联盟日常尽调查勘单</h1>
               <p className="text-slate-500 mt-2">企业：{aTierData?.company_name || '未命名企业'} | 编号：{companyId.slice(0, 8)}</p>
            </div>

            <div className="space-y-2">
               <h3 className="font-bold border-b pb-1">1. 已知基本诉求 (A层)</h3>
               <p><strong>主营业务介绍：</strong> <br/>{aTierData?.core_business || '暂无介绍'}</p>
               <p><strong>宣称客户群体：</strong> {aTierData?.key_clients_claimed ? JSON.stringify(aTierData.key_clients_claimed) : '未填写'}</p>
            </div>

            <div className="space-y-4 bg-red-50 p-4 border border-red-200 rounded-md">
                <h3 className="font-bold text-red-800 flex items-center gap-2">
                   重点核实任务区 (系统自动计算)
                </h3>
                <ul className="list-disc pl-5 text-red-700 space-y-1">
                   {!(aTierData?.key_clients_claimed) && (
                       <li><strong>大单客情缺失：</strong> 企业填报时未明确核心客户清单，请在本次交流中追问真实的标杆大客户，并记录份额大小。</li>
                   )}
                   {!(aTierData?.expected_resources) && (
                       <li><strong>对接诉求不明确：</strong> 企业未填写期望获得的联盟资源，请在现场帮其发掘其目前最大的痛点（资金、订单、政策）。</li>
                   )}
                   <li><strong>真实性考核：</strong> 请肉眼评估其实际生产区域面积与设备闲置率。</li>
                </ul>
            </div>

            <div className="space-y-2 mt-8 border-t pt-4">
               <h3 className="font-bold">2. 核心核验数据反填区 (请尽调员手写或随后填入系统)</h3>
               <div className="grid grid-cols-2 gap-4">
                  <div className="border border-slate-300 p-2 h-16 rounded">实际有效产能: </div>
                  <div className="border border-slate-300 p-2 h-16 rounded">技术团队真实水分: </div>
                  <div className="border border-slate-300 p-2 h-16 rounded block col-span-2">内部合作意愿(A/B/C)与隐患：</div>
               </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSurveyDialogOpen(false)}>关闭</Button>
            <Button onClick={() => {
                const printableElement = document.getElementById('printable-survey-package');
                if (printableElement) {
                    const printContents = printableElement.innerHTML;
                    const originalContents = document.body.innerHTML;
                    document.body.innerHTML = printContents;
                    window.print();
                    document.body.innerHTML = originalContents;
                    window.location.reload();
                }
            }}>
                <Printer className="w-4 h-4 mr-2" />
                打印 / 导出 PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>

    {/* 添加尽调记录弹窗 */}
    <Dialog open={isInvestigationDialogOpen} onOpenChange={setIsInvestigationDialogOpen}>
        <DialogContent className="max-w-xl">
            <DialogHeader>
                <DialogTitle>新增尽调走访记录</DialogTitle>
                <DialogDescription>
                    请如实填写对 【{aTierData?.company_name || '该企业'}】 的实地探访或深度背调结果。此记录仅联盟秘书处内部可见。
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label className="text-xs">实地产能与规模核实</Label>
                    <Textarea 
                        placeholder="例如：位于XX科技园，实际占地约2000平，研发人员占比不高..."
                        className="text-sm h-20"
                        value={newInvestigation.actual_capacity}
                        onChange={e => setNewInvestigation({...newInvestigation, actual_capacity: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">技术团队真实评估</Label>
                    <Textarea 
                        placeholder="例如：核心算法多为开源微调，缺乏底层自研能力..."
                        className="text-sm h-16"
                        value={newInvestigation.technical_team_eval}
                        onChange={e => setNewInvestigation({...newInvestigation, technical_team_eval: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">大客户底细与客情核查</Label>
                    <Textarea 
                        placeholder="例如：宣称的吉利汽车，实则只做了一期几十万的外包..."
                        className="text-sm h-16"
                        value={newInvestigation.real_key_clients}
                        onChange={e => setNewInvestigation({...newInvestigation, real_key_clients: e.target.value})}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-xs">核实真实人员规模 (人)</Label>
                        <Input 
                            type="number"
                            className="h-8 text-sm"
                            value={newInvestigation.actual_team_size}
                            onChange={e => setNewInvestigation({...newInvestigation, actual_team_size: parseInt(e.target.value)})}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs">风险等级</Label>
                        <Select value={newInvestigation.risk_level} onValueChange={val => setNewInvestigation({...newInvestigation, risk_level: val})}>
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
                        <div className="flex justify-between items-center">
                            <Label className="text-xs">技术成熟度 ({newInvestigation.tech_maturity_score})</Label>
                        </div>
                        <Slider 
                            value={[newInvestigation.tech_maturity_score]} 
                            min={1} max={5} step={1} 
                            onValueChange={val => setNewInvestigation({...newInvestigation, tech_maturity_score: val[0]})}
                        />
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <Label className="text-xs">市场影响力 ({newInvestigation.market_influence_score})</Label>
                        </div>
                        <Slider 
                            value={[newInvestigation.market_influence_score]} 
                            min={1} max={5} step={1} 
                            onValueChange={val => setNewInvestigation({...newInvestigation, market_influence_score: val[0]})}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs">避坑指南 / 内部安全备注</Label>
                    <Textarea 
                        placeholder="例如：高管即将离职创业，建议暂缓深度对接..."
                        className="text-sm h-16 bg-red-50 focus-visible:ring-red-500"
                        value={newInvestigation.internal_notes}
                        onChange={e => setNewInvestigation({...newInvestigation, internal_notes: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">联盟合作意愿评级</Label>
                    <Select value={newInvestigation.cooperation_willingness} onValueChange={val => setNewInvestigation({...newInvestigation, cooperation_willingness: val})}>
                        <SelectTrigger>
                            <SelectValue placeholder="选择意愿度" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="A">A类 (强烈参与, 资源置换意愿高)</SelectItem>
                            <SelectItem value="B">B类 (观望中, 期望先索取资源)</SelectItem>
                            <SelectItem value="C">C类 (意愿低/失联/仅为入库)</SelectItem>
                            <SelectItem value="D">D类 (列入黑名单)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsInvestigationDialogOpen(false)}>取消</Button>
                <Button onClick={handleAddInvestigation} disabled={isAddingInvestigation}>
                    {isAddingInvestigation ? "提交中..." : "保存记录并上墙"}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}
