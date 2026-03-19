import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createDirectus, rest, staticToken, readItems, createItem, updateItem, deleteItems } from "@directus/sdk";
import { transformRowToInternal, COLUMN_MAPPINGS } from "@/lib/excel-utils";

const adminClient = createDirectus(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8055")
  .with(staticToken(process.env.DIRECTUS_STATIC_TOKEN || ""))
  .with(rest());

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { companies, products, cases, index, total } = await req.json();

    // Process each company in the chunk
    for (const rawCompany of companies) {
      const companyData = transformRowToInternal(rawCompany, COLUMN_MAPPINGS.MAIN);
      const creditCode = companyData.credit_code;

      if (!creditCode) continue;

      // 1. Find or Create Company
      const existing = await adminClient.request(readItems('companies', {
        filter: { credit_code: { _eq: creditCode } },
        limit: 1,
        fields: ['id']
      })) as any[];

      let companyId: string;
      if (existing.length > 0) {
        companyId = existing[0].id;
        // Update basic info (Tier A)
        await adminClient.request(updateItem('companies', companyId, {
          ...companyData,
          status: 'published' // Auto-publish on admin import
        }));
      } else {
        companyId = crypto.randomUUID();
        await adminClient.request(createItem('companies', {
          ...companyData,
          id: companyId,
          status: 'published',
          source: 'admin_import'
        }));
      }

      // 2. Clear old relational data SAFELY (Filtered by company_id)
      await adminClient.request(deleteItems('products', {
        filter: { company_id: { _eq: companyId } }
      }));
      await adminClient.request(deleteItems('case_studies', {
        filter: { company_id: { _eq: companyId } }
      }));

      // 3. Insert new Products
      const companyProducts = products.filter((p: any) => p["所属企业信用代码"] === creditCode);
      for (const rawProd of companyProducts) {
        const prodData = transformRowToInternal(rawProd, COLUMN_MAPPINGS.PRODUCTS);
        await adminClient.request(createItem('products', {
          ...prodData,
          id: crypto.randomUUID(),
          company_id: companyId
        }));
      }

      // 4. Insert new Case Studies
      const companyCases = cases.filter((c: any) => c["所属企业信用代码"] === creditCode);
      for (const rawCase of companyCases) {
        const caseData = transformRowToInternal(rawCase, COLUMN_MAPPINGS.CASES);
        await adminClient.request(createItem('case_studies', {
          ...caseData,
          id: crypto.randomUUID(),
          company_id: companyId
        }));
      }
    }

    return NextResponse.json({ 
      message: `Chunk ${index + 1}/${total} processed`,
      success: true 
    });

  } catch (error: any) {
    console.error("Chunk import error:", error);
    return NextResponse.json({ 
      message: error.message || "Internal Server Error",
      success: false 
    }, { status: 500 });
  }
}
