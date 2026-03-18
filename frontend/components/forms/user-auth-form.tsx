"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { cn } from "@/lib/utils";
import { loginSchema, registerSchema } from "@/lib/validations/auth";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Icons } from "@/components/shared/icons";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: string;
}

export function UserAuthForm({ className, type, ...props }: UserAuthFormProps) {
  const schema = type === "register" ? registerSchema : loginSchema;
  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const searchParams = useSearchParams();

  async function onSubmit(data: FormData) {
    setIsLoading(true);

    if (type === "register") {
      try {
        const response = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: data.email.toLowerCase(),
            password: data.password,
          }),
        });

        if (!response.ok) {
          const result = await response.json();
          setIsLoading(false);
          return toast.error("注册失败", {
            description: result.error || "请稍后再试。",
          });
        }
        // If registration success, proceed to sign in automatically
      } catch (error) {
        setIsLoading(false);
        return toast.error("请求失败", {
          description: "无法连接到服务器，请检查网络。",
        });
      }
    }

    const signInResult = await signIn("credentials", {
      email: data.email.toLowerCase(),
      password: data.password,
      redirect: true,
      callbackUrl: searchParams?.get("from") || (data.email.includes("admin") ? "/admin" : "/dashboard"),
    });

    setIsLoading(false);

    if (!signInResult?.ok || signInResult?.error) {
      return toast.error(type === "register" ? "注册成功但登录失败" : "登录失败", {
        description: signInResult?.error === "CredentialsSignin" 
          ? "邮箱或密码错误，请重试。" 
          : "服务器响应异常，请稍后刷新重试。",
      });
    }

    toast.success(type === "register" ? "注册并登录成功" : "登录成功", {
      description: "正在为您跳转至管理后台...",
    });

    // small delay to ensure cookie is set
    setTimeout(() => {
      const callbackUrl = searchParams?.get("from") || (data.email.includes("admin") ? "/admin" : "/dashboard");
      window.location.href = callbackUrl;
    }, 500);
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="email">
              企业邮箱
            </Label>
            <Input
              id="email"
              placeholder="contact@企业邮箱.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              {...register("email")}
            />
            {errors?.email && (
              <p className="px-1 text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="password">
              密码
            </Label>
            <Input
              id="password"
              placeholder="密码"
              type="password"
              autoCapitalize="none"
              autoCorrect="off"
              disabled={isLoading}
              {...register("password")}
            />
            {errors?.password && (
              <p className="px-1 text-xs text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>
          <button className={cn(buttonVariants())} disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 size-4 animate-spin" />
            )}
            {type === "register" ? "申请入驻" : "登录"}
          </button>
        </div>
      </form>
    </div>
  );
}
