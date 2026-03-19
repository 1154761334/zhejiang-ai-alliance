import Link from "next/link"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/shared/icons"
import { UserAuthForm } from "@/components/forms/user-auth-form"
import { Suspense } from "react"

export const metadata = {
  title: "申请入会",
  description: "创建账号加入联盟。",
}

export default function RegisterPage() {
  return (
    <div className="container grid h-screen w-screen flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
      <Link
        href="/login"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute right-4 top-4 md:right-8 md:top-8"
        )}
      >
        会员登录
      </Link>
      <div className="hidden h-full bg-muted lg:block" />
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <Icons.logo className="mx-auto size-6" />
            <h1 className="text-2xl font-semibold tracking-tight">
              申请入会
            </h1>
            <p className="text-sm text-muted-foreground">
              请输入您的邮箱创建账号
            </p>
          </div>
          <Suspense>
            <UserAuthForm type="register" />
          </Suspense>
          <p className="px-8 text-center text-sm text-muted-foreground">
            点击继续，即代表您同意我们的{" "}
            <Link
              href="/terms"
              className="hover:text-brand underline underline-offset-4"
            >
              服务条款
            </Link>{" "}
            和{" "}
            <Link
              href="/privacy"
              className="hover:text-brand underline underline-offset-4"
            >
              隐私政策
            </Link>
            。
          </p>
        </div>
      </div>
    </div>
  )
}
