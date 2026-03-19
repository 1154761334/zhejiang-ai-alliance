import Link from "next/link";

import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

const logos = [
  {
    title: "阿里云",
    href: "https://www.aliyun.com/",
    icon: (
      <span className="text-xl font-bold tracking-tight md:text-2xl">
        阿里云
      </span>
    ),
  },
  {
    title: "科大讯飞",
    href: "https://www.iflytek.com/",
    icon: (
      <span className="text-xl font-bold tracking-tight md:text-2xl">
        科大讯飞
      </span>
    ),
  },
  {
    title: "西湖大学",
    href: "https://www.westlake.edu.cn/",
    icon: (
      <span className="text-xl font-bold tracking-tight md:text-2xl">
        西湖大学
      </span>
    ),
  },
  {
    title: "钉钉",
    href: "https://www.dingtalk.com/",
    icon: (
      <span className="text-xl font-bold tracking-tight md:text-2xl">
        钉钉
      </span>
    ),
  },
  {
    title: "中控技术",
    href: "https://www.supcon.com/",
    icon: (
      <span className="text-xl font-bold tracking-tight md:text-2xl">
        中控技术
      </span>
    ),
  },
  {
    title: "传化集团",
    href: "https://www.transmit.com.cn/",
    icon: (
      <span className="text-xl font-bold tracking-tight md:text-2xl">
        传化集团
      </span>
    ),
  },
  {
    title: "安恒信息",
    href: "https://www.dbappsecurity.com.cn/",
    icon: (
      <span className="text-xl font-bold tracking-tight md:text-2xl">
        安恒信息
      </span>
    ),
  },
  {
    title: "浙江大学",
    href: "https://www.zju.edu.cn/",
    icon: (
      <span className="text-xl font-bold tracking-tight md:text-2xl">
        浙江大学
      </span>
    ),
  },
  {
    title: "海康威视",
    href: "https://www.hikvision.com/",
    icon: (
      <span className="text-xl font-bold tracking-tight md:text-2xl">
        海康威视
      </span>
    ),
  },
  {
    title: "天正电气",
    href: "https://www.tengen.com.cn/",
    icon: (
      <span className="text-xl font-bold tracking-tight md:text-2xl">
        天正电气
      </span>
    ),
  },
  {
    title: "华正新材料",
    href: "#",
    icon: (
      <span className="text-xl font-bold tracking-tight md:text-2xl">
        华正新材料
      </span>
    ),
  },
  {
    title: "杭州银行",
    href: "https://www.hzbank.com.cn/",
    icon: (
      <span className="text-xl font-bold tracking-tight md:text-2xl">
        杭州银行
      </span>
    ),
  },
];

export default function Powered() {
  return (
    <section className="py-14 text-muted-foreground">
      <MaxWidthWrapper>
        <h2 className="text-center text-sm font-semibold uppercase">
          成员单位
        </h2>

        <div className="mt-10 grid grid-cols-2 place-items-center gap-8 md:grid-cols-4">
          {logos.slice(0, 4).map((logo) => (
            <Link
              target="_blank"
              key={logo.title}
              href={logo.href}
              aria-label={logo.title}
              className="duration-250 grayscale transition hover:text-foreground hover:grayscale-0"
            >
              {logo.icon}
            </Link>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-2 place-items-center gap-8 md:mt-10 md:grid-cols-4">
          {logos.slice(4, 8).map((logo) => (
            <Link
              target="_blank"
              key={logo.title}
              href={logo.href}
              aria-label={logo.title}
              className="duration-250 grayscale transition hover:text-foreground hover:grayscale-0"
            >
              {logo.icon}
            </Link>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-2 place-items-center gap-8 md:mt-10 md:grid-cols-4">
          {logos.slice(8, 12).map((logo) => (
            <Link
              target="_blank"
              key={logo.title}
              href={logo.href}
              aria-label={logo.title}
              className="duration-250 grayscale transition hover:text-foreground hover:grayscale-0"
            >
              {logo.icon}
            </Link>
          ))}
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
