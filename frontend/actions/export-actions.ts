"use server";

import { auth } from "@/auth";
import {
  createDirectus,
  createItem,
  readItems,
  readUsers,
  rest,
  staticToken,
} from "@directus/sdk";
import ExcelJS from "exceljs";

import {
  COLUMN_MAPPINGS,
  DICTIONARIES,
  SHEET_NAMES,
  transformInternalToRow,
} from "@/lib/excel-utils";

const adminClient = createDirectus(
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8055",
)
  .with(staticToken(process.env.DIRECTUS_STATIC_TOKEN || ""))
  .with(rest());

function maskSensitiveData(data: any): any {
  if (!data) return data;

  if (Array.isArray(data)) {
    return data.map((item) => maskSensitiveData(item));
  }

  if (typeof data === "object") {
    const masked: any = {};

    const sensitiveFields = [
      "contact_phone",
      "contact_email",
      "contact_name",
      "internal_notes",
      "real_key_clients",
      "tech_maturity_score",
      "market_influence_score",
      "risk_level",
      "investigator",
    ];

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const value = data[key];

        if (sensitiveFields.includes(key) && value) {
          if (key === "contact_phone" && typeof value === "string") {
            masked[key] = value.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
          } else if (key === "contact_email" && typeof value === "string") {
            const atIndex = value.indexOf("@");
            if (atIndex > 0) {
              masked[key] = value.slice(0, 2) + "***" + value.slice(atIndex);
            } else {
              masked[key] = value;
            }
          } else {
            masked[key] = "[已脱敏]";
          }
        } else if (typeof value === "object" && value !== null) {
          masked[key] = maskSensitiveData(value);
        } else {
          masked[key] = value;
        }
      }
    }

    return masked;
  }

  return data;
}

async function logAuditEvent(
  action: string,
  targetType: string,
  targetId: string,
  userId: string,
  details: any,
) {
  try {
    await adminClient.request(
      createItem("audit_logs", {
        id: crypto.randomUUID(),
        action,
        target_type: targetType,
        target_id: targetId,
        user_id: userId,
        details: JSON.stringify(details),
        ip_address: "server",
        created_at: new Date().toISOString(),
      }),
    );
  } catch (e) {
    console.error("Failed to log audit event:", e);
  }
}

export async function getAllCompaniesForExport() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    // Admins get masked data by default unless they are super-admin (simulated check)
    const isSuperAdmin = session.user.email?.includes("admin@") || false;

    // Fetch all companies with relational data
    const companies = (await adminClient.request(
      readItems("companies", {
        fields: ["*", "products.*", "case_studies.*"],
        limit: -1,
      }),
    )) as any[];

    const workbook = new ExcelJS.Workbook();

    // 1. Corporate Main
    const sheet1 = workbook.addWorksheet(SHEET_NAMES.MAIN);
    sheet1.columns = COLUMN_MAPPINGS.MAIN.map((col) => ({
      header: col.header,
      key: col.key,
      width: 25,
    }));

    // 2. Products
    const sheet2 = workbook.addWorksheet(SHEET_NAMES.PRODUCTS);
    sheet2.columns = COLUMN_MAPPINGS.PRODUCTS.map((col) => ({
      header: col.header,
      key: col.key,
      width: 25,
    }));

    // 3. Cases
    const sheet3 = workbook.addWorksheet(SHEET_NAMES.CASES);
    sheet3.columns = COLUMN_MAPPINGS.CASES.map((col) => ({
      header: col.header,
      key: col.key,
      width: 25,
    }));

    for (const company of companies) {
      // Apply Masking if not super-admin
      const maskedCompany = isSuperAdmin
        ? company
        : {
            ...company,
            contact_phone: company.contact_phone
              ? company.contact_phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2")
              : null,
            contact_email: company.contact_email
              ? company.contact_email.replace(/(.{2}).*(@.*)/, "$1***$2")
              : null,
            // Revenue is already a range in the DB, so we keep it as is or could obfuscate more if needed
          };

      sheet1.addRow(
        transformInternalToRow(maskedCompany, COLUMN_MAPPINGS.MAIN),
      );

      // Add related products
      if (company.products && Array.isArray(company.products)) {
        company.products.forEach((prod: any) => {
          sheet2.addRow(
            transformInternalToRow(
              { ...prod, credit_code: company.credit_code },
              COLUMN_MAPPINGS.PRODUCTS,
            ),
          );
        });
      }

      // Add related cases
      if (company.case_studies && Array.isArray(company.case_studies)) {
        company.case_studies.forEach((cs: any) => {
          sheet3.addRow(
            transformInternalToRow(
              { ...cs, credit_code: company.credit_code },
              COLUMN_MAPPINGS.CASES,
            ),
          );
        });
      }
    }

    await logAuditEvent(
      "EXPORT_COMPANIES",
      "companies",
      "all",
      session.user.id || "unknown",
      {
        total_count: Array.isArray(companies) ? companies.length : 0,
        masked: !isSuperAdmin,
        includes_internal_data: true,
      },
    );

    const buffer = await workbook.xlsx.writeBuffer();
    return {
      status: "success",
      data: Buffer.from(buffer).toString("base64"),
      filename: `联盟企业全量数据导出_${new Date().toISOString().split("T")[0]}.xlsx`,
      masked: !isSuperAdmin,
    };
  } catch (error: any) {
    console.error("Action error (getAllCompaniesForExport):", error);
    return { status: "error", message: error.message };
  }
}

export async function getExcelTemplate() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    const workbook = new ExcelJS.Workbook();

    // 1. Corporate Main Sheet
    const sheet1 = workbook.addWorksheet(SHEET_NAMES.MAIN);
    sheet1.columns = COLUMN_MAPPINGS.MAIN.map((col) => ({
      header: col.header,
      key: col.key,
      width: 25,
    }));

    // Add Data Validation for Sheet 1
    COLUMN_MAPPINGS.MAIN.forEach((col, idx) => {
      if (col.dict && (DICTIONARIES as any)[col.dict]) {
        const options = Object.keys((DICTIONARIES as any)[col.dict]);
        const colLetter = sheet1.getColumn(idx + 1).letter;
        // Apply validation to first 1000 rows
        for (let i = 2; i <= 1000; i++) {
          sheet1.getCell(`${colLetter}${i}`).dataValidation = {
            type: "list",
            allowBlank: true,
            formulae: [`"${options.join(",")}"`],
          };
        }
      }
    });

    // 2. Products Sheet
    const sheet2 = workbook.addWorksheet(SHEET_NAMES.PRODUCTS);
    sheet2.columns = COLUMN_MAPPINGS.PRODUCTS.map((col) => ({
      header: col.header,
      key: col.key,
      width: 25,
    }));

    COLUMN_MAPPINGS.PRODUCTS.forEach((col, idx) => {
      if (col.dict && (DICTIONARIES as any)[col.dict]) {
        const options = Object.keys((DICTIONARIES as any)[col.dict]);
        const colLetter = sheet2.getColumn(idx + 1).letter;
        for (let i = 2; i <= 1000; i++) {
          sheet2.getCell(`${colLetter}${i}`).dataValidation = {
            type: "list",
            allowBlank: true,
            formulae: [`"${options.join(",")}"`],
          };
        }
      }
    });

    // 3. Cases Sheet
    const sheet3 = workbook.addWorksheet(SHEET_NAMES.CASES);
    sheet3.columns = COLUMN_MAPPINGS.CASES.map((col) => ({
      header: col.header,
      key: col.key,
      width: 25,
    }));

    COLUMN_MAPPINGS.CASES.forEach((col, idx) => {
      if (col.dict && (DICTIONARIES as any)[col.dict]) {
        const options = Object.keys((DICTIONARIES as any)[col.dict]);
        const colLetter = sheet3.getColumn(idx + 1).letter;
        for (let i = 2; i <= 1000; i++) {
          sheet3.getCell(`${colLetter}${i}`).dataValidation = {
            type: "list",
            allowBlank: true,
            formulae: [`"${options.join(",")}"`],
          };
        }
      }
    });

    // Write to buffer
    const buffer = await workbook.xlsx.writeBuffer();
    // Convert to base64 to send across server action
    return {
      status: "success",
      data: Buffer.from(buffer).toString("base64"),
      filename: `浙江AI联盟企业录入模板_${new Date().toISOString().split("T")[0]}.xlsx`,
    };
  } catch (error: any) {
    console.error("Action error (getExcelTemplate):", error);
    return { status: "error", message: error.message };
  }
}

/**
 * 导出用户列表为Excel
 */
export async function exportUsersToExcel(userIds?: string[]) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    // 获取用户数据
    const filter = userIds?.length ? { id: { _in: userIds } } : undefined;
    const users = (await adminClient.request(
      readUsers({
        fields: ["email", "first_name", "last_name", "status", "role.name", "affiliated_company_id.company_name", "last_access"],
        filter,
        limit: -1
      })
    )) as any[];

    // 创建工作簿
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("用户列表");

    // 定义列
    sheet.columns = [
      { header: "邮箱", key: "email", width: 30 },
      { header: "姓名", key: "name", width: 15 },
      { header: "所属企业", key: "company", width: 30 },
      { header: "角色", key: "role", width: 15 },
      { header: "账号状态", key: "status", width: 15 },
      { header: "最后登录时间", key: "last_access", width: 25 },
    ];

    // 添加数据行
    for (const user of users) {
      const name = `${user.first_name || ""} ${user.last_name || ""}`.trim();
      const company = user.affiliated_company_id?.company_name || "-";
      const role = user.role?.name || "普通用户";
      const statusMap: Record<string, string> = {
        active: "正常",
        invited: "待认领",
        suspended: "已封禁",
        inactive: "未激活"
      };
      const status = statusMap[user.status] || user.status;
      const lastAccess = user.last_access ? new Date(user.last_access).toLocaleString("zh-CN") : "-";

      sheet.addRow({
        email: user.email,
        name,
        company,
        role,
        status,
        last_access: lastAccess
      });
    }

    // 记录审计日志
    await logAuditEvent(
      "EXPORT_USERS",
      "users",
      userIds?.length ? "selected" : "all",
      session.user.id || "unknown",
      {
        total_count: users.length,
        selected_count: userIds?.length
      }
    );

    // 导出为buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return {
      status: "success",
      data: Buffer.from(buffer).toString("base64"),
      filename: `联盟用户列表导出_${new Date().toISOString().split("T")[0]}.xlsx`
    };
  } catch (error: any) {
    console.error("Action error (exportUsersToExcel):", error);
    return { status: "error", message: error.message };
  }
}
