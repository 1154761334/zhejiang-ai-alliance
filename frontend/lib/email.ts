import { MagicLinkEmail } from "@/emails/magic-link-email";
import { EmailConfig } from "next-auth/providers/email";
import { Resend } from "resend";

import { env } from "@/env.mjs";
import { siteConfig } from "@/config/site";

const getUserByEmail = async (email: string) => {
  // TODO: Fetch user from Directus
  return { name: email.split("@")[0], emailVerified: new Date() };
};

export const resend = new Resend(env.RESEND_API_KEY);

export const sendVerificationRequest: EmailConfig["sendVerificationRequest"] =
  async ({ identifier, url, provider }) => {
    const user = await getUserByEmail(identifier);
    if (!user || !user.name) return;

    const userVerified = user?.emailVerified ? true : false;
    const authSubject = userVerified
      ? `Sign-in link for ${siteConfig.name}`
      : "Activate your account";

    try {
      const { data, error } = await resend.emails.send({
        from: provider.from,
        to:
          process.env.NODE_ENV === "development"
            ? "delivered@resend.dev"
            : identifier,
        subject: authSubject,
        react: MagicLinkEmail({
          firstName: user?.name as string,
          actionUrl: url,
          mailType: userVerified ? "login" : "register",
          siteName: siteConfig.name,
        }),
        // Set this to prevent Gmail from threading emails.
        // More info: https://resend.com/changelog/custom-email-headers
        headers: {
          "X-Entity-Ref-ID": new Date().getTime() + "",
        },
      });

      if (error || !data) {
        throw new Error(error?.message);
      }

      // console.log(data)
    } catch (error) {
      throw new Error("Failed to send verification email.");
    }
  };

export const sendHandoverEmail = async (params: {
    to: string;
    companyName: string;
    claimLink: string;
}) => {
    try {
        const { data, error } = await resend.emails.send({
            from: "Alliance Secretariat <onboarding@resend.dev>", // Or verified domain
            to: params.to,
            subject: `【账号认领】欢迎加入浙江省 AI 智能体产业发展联盟`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                    <h2 style="color: #2563eb;">联盟档案认领邀请</h2>
                    <p>您好，</p>
                    <p>联盟秘书处已为您预录入企业档案：<strong>${params.companyName}</strong>。</p>
                    <p>请点击下方链接设置您的登录密码并接管账号。此链接 7 天内有效：</p>
                    <div style="margin: 30px 0;">
                        <a href="${params.claimLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">认领账号并设置密码</a>
                    </div>
                    <p style="color: #666; font-size: 14px;">如果按钮无法点击，请复制以下链接到浏览器打开：</p>
                    <p style="color: #666; font-size: 14px; word-break: break-all;">${params.claimLink}</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
                    <p style="color: #999; font-size: 12px;">注：如果您未曾向联盟提交入驻申请或对此邮件有疑问，请忽略此邮件。</p>
                </div>
            `,
            headers: {
                "X-Entity-Ref-ID": new Date().getTime() + "",
            },
        });

        if (error || !data) {
            console.error("Resend error:", error);
            return { success: false, error };
        }
        return { success: true, data };
    } catch (error) {
        console.error("Email send exception:", error);
        return { success: false, error };
    }
};
