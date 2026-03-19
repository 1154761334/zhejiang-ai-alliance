"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { surveyFormSchema, type SurveyFormValues } from "../dashboard/survey-steps/schema";
import { BasicInfoStep } from "../dashboard/survey-steps/basic-info-step";
import { ProductsStep } from "../dashboard/survey-steps/products-step";
import { CasesStep } from "../dashboard/survey-steps/cases-step";
import { NeedsStep } from "../dashboard/survey-steps/needs-step";

// Schema is now imported from ../dashboard/survey-steps/schema

export function ManualEntryModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<SurveyFormValues>({
    resolver: zodResolver(surveyFormSchema),
    defaultValues: {
      company_name: "",
      company_description: "",
      awards_honors: "",
      credit_code: "",
      established_date: "",
      region: "",
      address: "",
      website: "",
      company_type: "private",
      employee_count: 0,
      rnd_count: 0,
      revenue_range: "",
      tracks: [],
      role: "应用解决方案层",
      contact_name: "",
      contact_position: "",
      contact_phone: "",
      contact_email: "",
      contact_preference: "phone",
      info_provider_name_position: "",
      products: [],
      case_studies: [],
      financing_need: [],
      market_need: [],
      tech_need: [],
      compute_pain_points: [],
      tech_complement_desc: "",
      policy_intent: [],
      data_security_measures: "",
      has_mlps_certification: false,
      processes_pii: false,
      confidentiality_commitment: false,
    },
  });

  async function onSubmit(values: SurveyFormValues) {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/companies", {
        method: "POST",
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("提交失败");

      toast.success("企业数据录入成功");
      setOpen(false);
      form.reset();
      router.refresh();
    } catch (error) {
      toast.error("录入失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <Plus className="h-4 w-4" />
          <span>单条录入</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>企业数据全维度录入</DialogTitle>
          <DialogDescription>
            支持录入工商、联系人及业务画像。录入后将自动生成待认领账号。
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="basic" className="text-xs">基础信息</TabsTrigger>
                <TabsTrigger value="products" className="text-xs">产品能力</TabsTrigger>
                <TabsTrigger value="cases" className="text-xs">场景案例</TabsTrigger>
                <TabsTrigger value="needs" className="text-xs">合规需求</TabsTrigger>
              </TabsList>
              
              <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
                <TabsContent value="basic" className="mt-0">
                  <BasicInfoStep />
                </TabsContent>
                <TabsContent value="products" className="mt-0">
                  <ProductsStep />
                </TabsContent>
                <TabsContent value="cases" className="mt-0">
                  <CasesStep />
                </TabsContent>
                <TabsContent value="needs" className="mt-0">
                  <NeedsStep />
                </TabsContent>
              </div>
            </Tabs>

            <DialogFooter className="pt-4 border-t mt-4">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "提交中..." : "保存全维度数据并生成待认领账号"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
