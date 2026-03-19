import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { HeaderSection } from "../shared/header-section";

const pricingFaqData = [
  {
    id: "item-1",
    question: "普通成员和观察员有什么区别？",
    answer:
      "观察员主要享有信息获取权，适合个人或初创团队；普通成员享有选举权、被选举权以及算力补贴、供需对接等实质性权益，更适合成长型企业。",
  },
  {
    id: "item-2",
    question: "如何申请算力补贴？",
    answer:
      "成为正式成员（普通成员及以上）后，可登录控制台的“算力服务”模块提交申请。联盟会根据企业的研发需求和项目评估结果发放相应的算力券。",
  },
  {
    id: "item-3",
    question: "理事单位有哪些特殊权益？",
    answer:
      "理事单位拥有联盟重大事项的一票否决权，可牵头制定行业标准，优先获得政府产业基金的支持，并可联合联盟举办年度产业峰会。",
  },
  {
    id: "item-4",
    question: "入会申请流程是怎样的？",
    answer:
      "注册账号 -> 提交企业认证资料 -> 秘书处初审 -> 理事会表决（仅限理事单位申请） -> 缴纳会费 -> 正式授牌。",
  },
  {
    id: "item-5",
    question: "会费标准是如何制定的？",
    answer:
      "会费标准经会员代表大会表决通过。普通成员年费 5000 元，理事单位年费 50000 元，主要用于联盟日常运营、活动举办及公共服务平台建设。",
  },
];

export function PricingFaq() {
  return (
    <section className="container max-w-4xl py-2">
      <HeaderSection
        label="常见问题"
        title="疑问解答"
        subtitle="这里汇集了关于入会流程、权益细则的常见问题。如果您需要进一步的帮助，请随时联系我们。"
      />

      <Accordion type="single" collapsible className="my-12 w-full">
        {pricingFaqData.map((faqItem) => (
          <AccordionItem key={faqItem.id} value={faqItem.id}>
            <AccordionTrigger>{faqItem.question}</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground sm:text-[15px]">
              {faqItem.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
