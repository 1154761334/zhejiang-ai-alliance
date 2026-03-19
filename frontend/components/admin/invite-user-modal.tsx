"use client";

import { useState, useEffect } from "react";
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
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserPlus, Search, Building2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getCompanyList, updateUserAccount } from "@/actions/user-actions";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const inviteSchema = z.object({
  email: z.string().email("无效的联系邮箱"),
  name: z.string().min(2, "姓名至少2个字符"),
  company_id: z.string().optional(),
});

export function InviteUserModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const router = useRouter();

  const form = useForm<z.infer<typeof inviteSchema>>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      name: "",
      company_id: "",
    },
  });

  useEffect(() => {
    if (open) {
      getCompanyList().then(res => {
        if (res.status === "success" && res.data) {
          setCompanies(res.data as any[]);
        }
      });
    }
  }, [open]);

  async function onSubmit(values: z.infer<typeof inviteSchema>) {
    setLoading(true);
    try {
      // In a real app, we'd have a specific /api/admin/invite or action
      // For this demo, we'll use a mocked POST to companies as placeholders
      const res = await fetch("/api/admin/companies/invite", {
        method: "POST",
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("邀请失败");

      toast.success("邀请已发送，账号已预建");
      setOpen(false);
      form.reset();
      router.refresh();
    } catch (error) {
      toast.error("操作失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 gap-1">
          <UserPlus className="h-4 w-4" />
          <span>邀请新成员</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>邀请联盟成员</DialogTitle>
          <DialogDescription>
            预建账号并关联企业档案。受邀人将通过邮件完成认领。
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>用户姓名 *</FormLabel>
                  <FormControl>
                    <Input placeholder="姓名" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>登录邮箱 *</FormLabel>
                  <FormControl>
                    <Input placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="company_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>关联已有企业</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择要绑定的企业..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {companies.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    若在此处关联，用户激活后将直接获得该企业档案的编辑权限。
                  </p>
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4 border-t mt-4">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "发送中..." : "发送邀请并建立映射"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
