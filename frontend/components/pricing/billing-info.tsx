import Link from "next/link";
import * as React from "react";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BillingInfoProps extends React.HTMLAttributes<HTMLFormElement> {
  userSubscriptionPlan: any;
}

export function BillingInfo({ userSubscriptionPlan }: BillingInfoProps) {
  const {
    title,
    description,
    isPaid,
  } = userSubscriptionPlan;

  return (
    <Card>
      <CardHeader>
        <CardTitle>会员等级</CardTitle>
        <CardDescription>
          您当前是 <strong>{title}</strong>。
        </CardDescription>
      </CardHeader>
      <CardContent>{description}</CardContent>
      <CardFooter className="flex flex-col items-center space-y-2 border-t bg-accent py-2 md:flex-row md:justify-between md:space-y-0">
        <p className="text-sm font-medium text-muted-foreground">
          升级选项请查看联盟定价计划。
        </p>

        <Link href="/pricing" className={cn(buttonVariants())}>
          查看其他计划
        </Link>
      </CardFooter>
    </Card>
  );
}
