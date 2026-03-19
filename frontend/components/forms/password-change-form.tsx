"use client";

import { useTransition } from "react";
import { updatePassword } from "@/actions/account-actions";
import { PasswordChangeData, passwordChangeSchema } from "@/lib/validations/account";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionColumns } from "@/components/dashboard/section-columns";
import { Icons } from "@/components/shared/icons";

export function PasswordChangeForm() {
  const [isPending, startTransition] = useTransition();

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<PasswordChangeData>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = handleSubmit((data) => {
    startTransition(async () => {
      const result = await updatePassword(data);

      if (result.status !== "success") {
        toast.error("修改失败", {
          description: result.message || "由于权限、数据校验或网络问题，密码未能更新。请确保新旧密码不一致且符合复杂度要求。",
        });
      } else {
        toast.success("密码已成功更新！");
        reset();
      }
    });
  });

  return (
    <form onSubmit={onSubmit}>
      <SectionColumns
        title="修改密码"
        description="为了账号安全，建议定期更换高强度密码（至少 8 位，包含特殊字符）。"
      >
        <div className="grid w-full gap-4">
          <div className="grid gap-2">
            <Label htmlFor="newPassword">新密码</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="请输入新密码"
              {...register("newPassword")}
            />
            {errors?.newPassword && (
              <p className="text-xs text-red-600">{errors.newPassword.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">确认新密码</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              {...register("confirmPassword")}
            />
            {errors?.confirmPassword && (
              <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-[150px]"
            >
              {isPending ? (
                <Icons.spinner className="size-4 animate-spin mr-2" />
              ) : null}
              完成修改
            </Button>
          </div>
        </div>
      </SectionColumns>
    </form>
  );
}
