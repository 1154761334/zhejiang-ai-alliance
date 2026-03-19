import { createDirectus, rest, readItems } from "@directus/sdk";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";

export async function CaseStudiesList() {
  const client = createDirectus(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8055").with(rest());
  
  let cases: any[] = [];
  try {
    // Fetch case studies associated with published companies
    const fetchedCases = await client.request(
      readItems("case_studies", {
        filter: {
          company_id: {
            status: { _eq: "published" },
          },
        },
        fields: ["*", "company_id.company_name", "company_id.logo"],
        limit: 12, // Show latest 12 quality cases
      })
    );
    cases = fetchedCases || [];
  } catch (error) {
    console.error("Failed to fetch cases for showcase:", error);
  }

  if (cases.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-12 text-center bg-muted/30">
        <h3 className="text-lg font-semibold text-foreground mb-2">案例正在快马加鞭完善中</h3>
        <p className="text-muted-foreground">秘书处正在审核各理事单位提报的优质场景案例，敬请期待！</p>
      </div>
    );
  }

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
      {cases.map((c: any) => (
        <div key={c.id} className="break-inside-avoid shadow-sm border rounded-xl bg-card overflow-hidden hover:shadow-lg transition-all duration-300">
          <div className="p-6 flex flex-col h-full">
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                  深度赋能场景
                </Badge>
                {c.location && (
                  <span className="text-xs text-muted-foreground font-medium">{c.location}</span>
                )}
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-3 tracking-tight">{c.title}</h3>
            
            {c.solution && (
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {c.solution}
              </p>
            )}
            
            {c.quantified_results && (
              <div className="space-y-2 mb-6 mt-auto">
                <div className="bg-muted/50 px-3 py-2 rounded-lg border border-border/50">
                  <span className="text-xs font-semibold uppercase text-primary block mb-1">量化成效</span>
                  <span className="text-sm font-medium text-foreground">{c.quantified_results}</span>
                </div>
              </div>
            )}

            <div className="flex items-center pt-4 border-t border-border mt-auto">
              {c.company_id?.logo ? (
                <div className="relative size-8 rounded border mr-3 bg-white overflow-hidden">
                   <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${process.env.NEXT_PUBLIC_API_URL}/assets/${c.company_id.logo})` }} />
                </div>
              ) : (
                <div className="size-8 rounded border mr-3 bg-muted flex items-center justify-center">
                  <Building2 className="size-4 text-muted-foreground" />
                </div>
              )}
              <div className="text-sm font-medium text-foreground">
                {c.company_id?.company_name || "联盟优选成员"}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
