"use client";

import * as React from "react";
import { createItem, updateItem } from "@directus/sdk";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider, type FieldErrors } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

import { directus } from "@/lib/directus";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";

import { surveyFormSchema, type SurveyFormValues } from "./survey-steps/schema";
import { BasicInfoStep } from "./survey-steps/basic-info-step";
import { ProductsStep } from "./survey-steps/products-step";
import { CasesStep } from "./survey-steps/cases-step";
import { NeedsStep } from "./survey-steps/needs-step";
import { submitSurvey } from "@/actions/submit-survey";

interface CapabilityFormProps {
  initialData?: any;
  isLocked?: boolean;
}

export function CapabilityForm({ initialData, isLocked = false }: CapabilityFormProps) {
  const [activeTab, setActiveTab] = React.useState("basic");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDrafting, setIsDrafting] = React.useState(false);

  // Initialize form with default values (or initialData if provided)
  const defaultValues: SurveyFormValues = {
    company_name: initialData?.company_name || "",
    credit_code: initialData?.credit_code || "",
    established_date: initialData?.established_date || "",
    region: initialData?.region || "",
    address: initialData?.address || "",
    website: initialData?.website || "",
    company_type: initialData?.company_type || "",
    employee_count: initialData?.employee_count || 0,
    rnd_count: initialData?.rnd_count || 0,
    revenue_range: initialData?.revenue_range || "",
    tracks: initialData?.tracks || [],
    role: initialData?.role || "",
    contact_name: initialData?.contact_name || "",
    contact_position: initialData?.contact_position || "",
    contact_phone: initialData?.contact_phone || "",
    contact_email: initialData?.contact_email || "",
    contact_preference: initialData?.contact_preference || "",
    products: initialData?.products?.length ? initialData.products : [{ name: "", form_factor: "", maturity_stage: "", description: "" }],
    case_studies: initialData?.case_studies?.length ? initialData.case_studies : [],
    financing_need: initialData?.survey_needs?.[0]?.financing_need || [],
    market_need: initialData?.survey_needs?.[0]?.market_need || [],
    tech_need: initialData?.survey_needs?.[0]?.tech_need || [],
    compute_pain_points: initialData?.survey_needs?.[0]?.compute_pain_points || [],
    policy_intent: initialData?.survey_needs?.[0]?.policy_intent || [],
    tech_complement_desc: initialData?.survey_needs?.[0]?.tech_complement_desc || "",
    data_security_measures: initialData?.compliance_risks?.[0]?.data_security_measures || "",
    has_mlps_certification: initialData?.compliance_risks?.[0]?.has_mlps_certification || false,
    processes_pii: initialData?.compliance_risks?.[0]?.processes_pii || false,
    company_description: initialData?.company_description || "",
    awards_honors: initialData?.awards_honors || "",
    info_provider_name_position: initialData?.info_provider_name_position || "",
    confidentiality_commitment: initialData?.confidentiality_commitment || false,
    delivery_risks: initialData?.delivery_risks || "",
    risk_mitigation: initialData?.risk_mitigation || "",
    industry_tags: initialData?.industry_tags || [],
    capability_tags: initialData?.capability_tags || [],
    tech_stack_tags: initialData?.tech_stack_tags || [],
    maturity_level: initialData?.maturity_level || ""
  };

  const form = useForm<SurveyFormValues>({
    resolver: zodResolver(surveyFormSchema),
    defaultValues,
    mode: "onTouched",
  });

  const { errors, touchedFields } = form.formState;

  // Common submit handler (handles both Draft and Publish based on status parameter)
  const onSubmit = async (data: SurveyFormValues, status: "draft" | "pending_review") => {
    if (status === "draft") {
      setIsDrafting(true);
    } else {
      setIsSubmitting(true);
    }

    try {
      const payload = {
        status: status,
        company_name: data.company_name,
        credit_code: data.credit_code,
        established_date: data.established_date || null,
        region: data.region,
        address: data.address,
        website: data.website,
        company_type: data.company_type,
        employee_count: data.employee_count,
        rnd_count: data.rnd_count,
        revenue_range: data.revenue_range,
        tracks: data.tracks,
        role: data.role,
        contact_name: data.contact_name,
        contact_position: data.contact_position,
        contact_phone: data.contact_phone,
        contact_email: data.contact_email,
        contact_preference: data.contact_preference,
      };

      // Use Server Action for submission to handle permissions and auth securely
      const result = await submitSurvey(data, status, initialData?.id);
      
      if (!result.success) {
        throw new Error(result.error || "提交失败，服务器未返回具体原因");
      }

      if (status === "draft") {
        toast.success("草稿保存成功！您之后可以继续完善档案。");
      } else {
        toast.success("基础档案提交成功！正等待秘书处审核入库。");
        form.reset();
      }

    } catch (error: any) {
      console.error(error);
      let errorMessage = "提交失败，请检查网络或重新刷新页面哦";
      const directusError = error?.errors?.[0];

      if (directusError) {
        const code = directusError.extensions?.code;
        const msg = directusError.message?.toLowerCase();

        if (code === 'RECORD_NOT_UNIQUE' || (msg && msg.includes('unique'))) {
          errorMessage = "该企业信息已存在，请勿重复提交";
        } else if (code === 'FORBIDDEN') {
          errorMessage = "抱歉，您没有权限执行此操作";
        } else if (code === 'INVALID_PAYLOAD') {
          errorMessage = "填写的信息格式有误，请检查后重新提交";
        } else if (directusError.message) {
          errorMessage = directusError.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsDrafting(false);
      setIsSubmitting(false);
    }
  }

  // Field to tab mapping
  const fieldTabMap: Record<string, string> = {
    company_name: "basic",
    credit_code: "basic",
    established_date: "basic",
    region: "basic",
    address: "basic",
    company_type: "basic",
    employee_count: "basic",
    rnd_count: "basic",
    tracks: "basic",
    role: "basic",
    contact_name: "basic",
    contact_position: "basic",
    contact_phone: "basic",
    contact_email: "basic",
    contact_preference: "basic",
    products: "products",
    case_studies: "cases",
    data_security_measures: "needs"
  };

  const getTabStatus = (tab: string) => {
    const errorFields = Object.keys(errors);
    const hasError = errorFields.some(field => {
      if (fieldTabMap[field] === tab) return true;
      if (field.startsWith('products') && tab === 'products') return true;
      if (field.startsWith('case_studies') && tab === 'cases') return true;
      return false;
    });

    if (hasError) return "error";
    
    // Check if fields in this tab have been touched and are valid
    // This is optional but makes the UX smoother
    return "idle";
  };

  const handleNextStep = async (currentTab: string, nextTab: string) => {
    // Basic mapping of tabs to fields for partial validation
    const tabFields: Record<string, (keyof SurveyFormValues)[]> = {
      basic: ["company_name", "credit_code", "region", "address", "company_type", "contact_name", "contact_phone"],
      products: ["products"],
      cases: ["case_studies"],
    };

    const fieldsToValidate = tabFields[currentTab];
    if (fieldsToValidate) {
      const isValid = await form.trigger(fieldsToValidate);
      if (!isValid) {
        toast.error(`请先修正“${getTabLabel(currentTab)}”中的错误。`);
        return;
      }
    }
    setActiveTab(nextTab);
  };

  // Handle validation errors (e.g., when clicking submit and required fields are empty/invalid)
  const onInvalid = (errors: FieldErrors<SurveyFormValues>) => {
    console.error("Validation Errors:", errors);
    
    const firstErrorField = Object.keys(errors)[0];
    const targetTab = fieldTabMap[firstErrorField] || (firstErrorField.startsWith('products') ? 'products' : (firstErrorField.startsWith('case_studies') ? 'cases' : 'needs'));
    
    if (targetTab && targetTab !== activeTab) {
      setActiveTab(targetTab);
      toast.error(`提交失败：请在“${getTabLabel(targetTab)}”步骤中检查必填项。`);
    } else {
      toast.error("提交失败，请检查各步骤中的必填项是否填写完整。");
    }
  };

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case "basic": return "基础信息";
      case "products": return "核心能力与产品";
      case "cases": return "场景案例";
      case "needs": return "合规与需求";
      default: return "当前页面";
    }
  };

  // To save draft without strict validation hook
  const handleSaveDraft = async () => {
    const data = form.getValues();
    // For Drafts, we can bypass strict zod validation if we want, or do partial validation.
    // For now we pass whatever is in values, which is fine since Directus accepts nulls if DB is relaxed.
    await onSubmit(data as SurveyFormValues, "draft");
  };

  return (
    <div className="w-full">
      <FormProvider {...form}>
        <form 
          onSubmit={form.handleSubmit(
            (data) => onSubmit(data, "pending_review"),
            onInvalid
          )} 
          className="space-y-4"
        >

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8 h-12">
              <TabsTrigger value="basic" className="text-sm flex items-center gap-2">
                {getTabStatus("basic") === "error" && <AlertCircle className="h-4 w-4 text-red-500" />}
                1. 基础信息
              </TabsTrigger>
              <TabsTrigger value="products" className="text-sm flex items-center gap-2">
                {getTabStatus("products") === "error" && <AlertCircle className="h-4 w-4 text-red-500" />}
                2. 核心能力与产品
              </TabsTrigger>
              <TabsTrigger value="cases" className="text-sm flex items-center gap-2">
                {getTabStatus("cases") === "error" && <AlertCircle className="h-4 w-4 text-red-500" />}
                3. 场景案例
              </TabsTrigger>
              <TabsTrigger value="needs" className="text-sm flex items-center gap-2">
                {getTabStatus("needs") === "error" && <AlertCircle className="h-4 w-4 text-red-500" />}
                4. 合规与需求
              </TabsTrigger>
            </TabsList>

            <div className="mt-4">
              <TabsContent value="basic" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>第一板块：企业基础画像</CardTitle>
                    <CardDescription>摸底全省智能体企业家底，建立基础联络薄。</CardDescription>
                  </CardHeader>
                  <CardContent><BasicInfoStep /></CardContent>
                  <CardFooter className="flex justify-end"><Button type="button" onClick={() => handleNextStep("basic", "products")}>下一步：填写核心能力</Button></CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="products" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>第二板块：核心产品库构建</CardTitle>
                    <CardDescription>列出贵司最具代表性的 1-3 款智能体相关产品和平台架构。</CardDescription>
                  </CardHeader>
                  <CardContent><ProductsStep /></CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" type="button" onClick={() => setActiveTab("basic")}>上一步</Button>
                    <Button type="button" onClick={() => handleNextStep("products", "cases")}>下一步：补充案例</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="cases" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>第三板块：行业场景与标杆案例 (选填)</CardTitle>
                    <CardDescription>为白皮书和全省示范推广储备案例素材。</CardDescription>
                  </CardHeader>
                  <CardContent><CasesStep /></CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" type="button" onClick={() => setActiveTab("products")}>上一步</Button>
                    <Button type="button" onClick={() => handleNextStep("cases", "needs")}>下一步：合规与赋能需求</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="needs" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>第四/五板块：合规承诺与生态赋能</CardTitle>
                    <CardDescription>守牢安全底线的同时，提出亟待联盟解决的痛点需求。</CardDescription>
                  </CardHeader>
                  <CardContent><NeedsStep /></CardContent>
                  <CardFooter className="flex justify-between border-t pt-6 mt-6">
                    <Button variant="outline" type="button" onClick={() => setActiveTab("cases")}>上一步</Button>
                    <div className="flex gap-4">
                      {isLocked ? (
                        <Button disabled>资料审核中，禁止修改</Button>
                      ) : (
                        <>
                          <Button variant="outline" type="button" onClick={handleSaveDraft} disabled={isDrafting || isSubmitting}>
                            {isDrafting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {initialData ? "保存修改 (Draft)" : "保存草稿 (Draft)"}
                          </Button>
                          <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isDrafting || isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            确认无误，提交审核
                          </Button>
                        </>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>
            </div>
          </Tabs>

        </form>
      </FormProvider>
    </div>
  );
}
