import Link from "next/link";

import { env } from "@/env.mjs";
import { siteConfig } from "@/config/site";
import { cn, nFormatter } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";

export default async function HeroLanding() {
  return (
    <section className="space-y-6 py-12 sm:py-20 lg:py-28">
      <div className="container flex max-w-5xl flex-col items-center gap-5 text-center">
        <Link
          href="/dashboard"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm", rounded: "full" }),
            "px-4",
          )}
        >
          <span className="mr-3">🚀</span>
          <span className="hidden md:flex">浙江省 AI 智能体产业发展联盟&nbsp;</span> 成员招募中
        </Link>

        <h1 className="text-balance font-urban text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-[66px]">
          共建全球
          <span className="text-gradient_indigo-purple font-extrabold">
            AI 智能体
          </span>
          产业创新高地
        </h1>

        <p
          className="max-w-2xl text-balance leading-normal text-muted-foreground sm:text-xl sm:leading-8"
          style={{ animationDelay: "0.35s", animationFillMode: "forwards" }}
        >
          由浙江省经信厅指导，联合阿里云、西湖大学等200余家单位发起。
          <br className="hidden md:block" />
          构建“政产学研金用”协同创新生态，赋能“415X”先进制造业集群。
        </p>

        <div
          className="flex justify-center space-x-2 md:space-x-4"
          style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
        >
          <Link
            href="/register"
            prefetch={true}
            className={cn(
              buttonVariants({ size: "lg", rounded: "full" }),
              "gap-2",
            )}
          >
            <span>成员入库</span>
            <Icons.arrowRight className="size-4" />
          </Link>
          <Link
            href="#features"
            className={cn(
              buttonVariants({
                variant: "outline",
                size: "lg",
                rounded: "full",
              }),
              "px-5",
            )}
          >
            <p>了解服务</p>
          </Link>
        </div>
      </div>
    </section>
  );
}
