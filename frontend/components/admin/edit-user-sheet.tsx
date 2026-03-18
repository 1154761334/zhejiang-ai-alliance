"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Check, ChevronsUpDown, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { getRoles, getCompanyList, updateUserAdmin } from "@/actions/user-actions";
import { UserRecord } from "@/types/user";

const userEditSchema = z.object({
  first_name: z.string().min(1, "姓名不能为空"),
  role: z.string().min(1, "必须选择一个角色"),
  status: z.string(),
  affiliated_company_id: z.string().nullable(),
});

type UserEditValues = z.infer<typeof userEditSchema>;

interface EditUserSheetProps {
  user: UserRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditUserSheet({ user, open, onOpenChange }: EditUserSheetProps) {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [companySearchOpen, setCompanySearchOpen] = useState(false);

  const form = useForm<UserEditValues>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      first_name: "",
      role: "",
      status: "active",
      affiliated_company_id: null,
    },
  });

  useEffect(() => {
    if (open && user) {
      form.reset({
        first_name: user.first_name || "",
        role: typeof user.role === "string" ? user.role : user.role?.id || "",
        status: user.status,
        affiliated_company_id: user.affiliated_company_id?.id || null,
      });

      // Fetch metadata
      Promise.all([getRoles(), getCompanyList()]).then(([rolesRes, companiesRes]) => {
        if (rolesRes.status === "success" && rolesRes.data) setRoles(rolesRes.data as any[]);
        if (companiesRes.status === "success" && companiesRes.data) setCompanies(companiesRes.data as any[]);
      });
    }
  }, [open, user, form]);

  async function onSubmit(values: UserEditValues) {
    if (!user) return;
    setLoading(true);
    try {
      const res = await updateUserAdmin(user.id, values);
      if (res.status === "success") {
        toast.success("用户信息更新成功");
        onOpenChange(false);
      } else {
        throw new Error(res.message);
      }
    } catch (error: any) {
      toast.error("更新失败: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[450px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>编辑用户信息</SheetTitle>
          <SheetDescription>
            修改用户的基础资料、系统角色及企业关联关系。
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
            <div className="space-y-2">
              <FormLabel>登录邮箱</FormLabel>
              <Input value={user?.email || ""} disabled className="bg-muted" />
              <p className="text-[12px] text-muted-foreground">邮箱作为唯一标识，不可修改。</p>
            </div>

            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>用户姓名</FormLabel>
                  <FormControl>
                    <Input placeholder="输入姓名" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>系统角色</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择权限组" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="affiliated_company_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>所属企业/机构</FormLabel>
                  <Popover open={companySearchOpen} onOpenChange={setCompanySearchOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={companySearchOpen}
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? companies.find((c) => c.id === field.value)?.company_name
                            : "搜索并选择企业..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[350px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="输入企业名称搜索..." />
                        <CommandList>
                          <CommandEmpty>未找到相关企业。</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value="none"
                              onSelect={() => {
                                console.log("[EditUserSheet] Unbinding company");
                                field.onChange(null);
                                setCompanySearchOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === null ? "opacity-100" : "opacity-0"
                                )}
                              />
                              无关联
                            </CommandItem>
                            {companies.map((company) => (
                              <CommandItem
                                key={company.id}
                                value={company.company_name} // Searchable value
                                onSelect={() => {
                                  console.log("[EditUserSheet] Selected Company:", company.company_name, company.id);
                                  field.onChange(company.id);
                                  setCompanySearchOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === company.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {company.company_name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    角色为 MEMBER 时务必绑定企业，否则用户无法查看档案。
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>账号状态</FormLabel>
                    <FormDescription>
                      关闭后用户将无法登录系统。
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value === "active"}
                      onCheckedChange={(checked) => field.onChange(checked ? "active" : "suspended")}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              保存修改
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
