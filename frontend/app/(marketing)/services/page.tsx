import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Cpu, Layers, Sparkles } from "lucide-react";

import { cn, constructMetadata } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { CaseStudiesList } from "@/components/services/case-studies-list";

export const metadata: Metadata = constructMetadata({
  title: "产品与服务 | 浙江省AI智能体产业联盟",
  description: "探索联盟为您提供的算力服务、模型定制及各行业赋能标杆案例。",
});

export default function ServicesPage() {
  return (
    <div className="flex w-full flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background pt-24 md:pt-32">
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="font-urban text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="block text-foreground">汇聚全省 AI 势能</span>
              <span className="block bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text pb-2 text-transparent">
                赋能千行百业
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              提供从顶尖算力到专属模型的一站式产业智改方案。加入浙江省 AI
              智能体产业发展联盟，获取最前沿的技术赋能与生态资源。
            </p>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-12 px-8 text-base",
                )}
              >
                申请加入联盟
              </Link>
              <Link
                href="#cases"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-12 px-8 text-base",
                )}
              >
                查看标杆案例
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Compute Section */}
      <section id="compute" className="relative py-24 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
            <div>
              <div className="mb-6 inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-500">
                <Cpu className="mr-2 size-4" /> 智算网络
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                高性能算力，为您全速启航
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                依托联盟单位强大的基础设施，为您提供高性价比、多云异构的算力资源。无论是模型预训练还是大规模推理，这里都有专属您的补贴方案。
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "异构算力池：涵盖 A100 / H800 / 昇腾等主流算力集群",
                  "联盟专属权益：初创企业可享限时算力包与最高 30% 返还补贴",
                  "低延时网络：立足浙江，辐射长三角的高效能算力切片调度",
                ].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <div className="shrink-0">
                      <div className="flex size-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-500">
                        <ArrowRight className="size-4" />
                      </div>
                    </div>
                    <p className="ml-3 text-base text-muted-foreground">
                      {item}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-border shadow-2xl lg:aspect-square">
              <Image
                src="/_static/services/compute.png"
                alt="Compute Services"
                fill
                className="object-cover object-center"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Token Flow / Model Tuning Section */}
      <section
        id="fine-tuning"
        className="relative border-y border-border bg-muted/30 py-24 sm:py-32"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
            <div className="relative order-2 flex h-[500px] flex-col overflow-hidden rounded-2xl border border-border shadow-2xl lg:order-1 lg:h-[600px]">
              {/* Use both generated tech abstract images here */}
              <div className="relative h-1/2 w-full border-b border-border/50">
                <Image
                  src="/_static/services/tuning.png"
                  alt="Model Tuning"
                  fill
                  className="object-cover object-center"
                />
              </div>
              <div className="relative h-1/2 w-full">
                <Image
                  src="/_static/services/token-flow.png"
                  alt="Token Flow"
                  fill
                  className="object-cover object-center"
                />
              </div>
            </div>
            <div className="order-1 lg:order-2 lg:pl-8">
              <div className="mb-6 inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-sm font-medium text-purple-500">
                <Layers className="mr-2 size-4" /> 专属大脑
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                行业大模型定制与精调
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                不用担心“不懂AI怎么用AI”，我们为您提供深入行业的场景化大模型定制服务，确保您的业务数据安全、自主可控。
              </p>

              <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
                {[
                  {
                    title: "百亿 Token 清洗",
                    desc: "私有行业语料深度清洗与脱敏，构筑高质量数据集。",
                  },
                  {
                    title: "多模态大模型精调",
                    desc: "支持基于通义、百川及开源模型的深度微调。",
                  },
                  {
                    title: "本地化私有部署",
                    desc: "支持模型断网私有化部署，最大程度保护商业机密。",
                  },
                  {
                    title: "智能体 (Agent) 生成",
                    desc: "一键串联业务 API，打造能执行复杂任务的 AI 员工。",
                  },
                ].map((feature, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border bg-background/50 p-4 shadow-sm"
                  >
                    <h3 className="flex items-center text-lg font-semibold text-foreground">
                      <Sparkles className="mr-2 size-4 text-purple-500" />
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {feature.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Success Cases Section */}
      <section id="cases" className="relative py-24 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              标杆示范：全省优选实践案例
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              以下案例均由浙江省 AI
              智能体产业发展联盟成员单位提供，并经过秘书处审核与背书。了解千行百业的真实
              AI 跃迁之路。
            </p>
          </div>

          <CaseStudiesList />
        </div>
      </section>
    </div>
  );
}
