import "dotenv/config";
import dotenv from "dotenv";
import {
  createCollection,
  createDirectus,
  createField,
  createPermission,
  createRelation,
  deletePermission,
  readCollections,
  readFields,
  readItems,
  readPermissions,
  readPolicies,
  readUsers,
  rest,
  staticToken,
  updateItem,
  updateUser,
} from "@directus/sdk";

dotenv.config({ path: new URL("../../frontend/.env", import.meta.url) });

const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8055";
const token = process.env.DIRECTUS_STATIC_TOKEN;

if (!token) {
  throw new Error("DIRECTUS_STATIC_TOKEN is required.");
}

const client = createDirectus(url).with(staticToken(token)).with(rest());

const CORE_COLLECTIONS = [
  "companies",
  "products",
  "case_studies",
  "survey_needs",
  "compliance_risks",
  "org_verified_data",
  "org_internal_investigations",
];

const PUBLIC_COMPANY_FIELDS = [
  "id",
  "company_name",
  "logo",
  "region",
  "company_type",
  "tracks",
  "role",
  "website",
  "company_description",
  "core_business",
  "status",
];

const MEMBER_COMPANY_FIELDS = [
  "id",
  "company_name",
  "credit_code",
  "established_date",
  "region",
  "address",
  "website",
  "company_type",
  "employee_count",
  "rnd_count",
  "revenue_range",
  "tracks",
  "role",
  "contact_name",
  "contact_position",
  "contact_phone",
  "contact_email",
  "contact_preference",
  "company_description",
  "awards_honors",
  "core_business",
  "expected_resources",
  "key_clients_claimed",
  "industry_tags",
  "capability_tags",
  "tech_stack_tags",
  "maturity_level",
  "confidentiality_commitment",
  "delivery_risks",
  "risk_mitigation",
  "status",
  "rejection_reason",
  "info_updated_at",
  "user_created",
];

function field(field, type, options = {}) {
  return {
    field,
    type,
    meta: {
      interface: options.interface || defaultInterface(type),
      note: options.note,
      hidden: options.hidden || false,
      readonly: options.readonly || false,
      options: options.options,
    },
    schema: {
      default_value: options.default,
      foreign_key_table: options.foreignKeyTable,
      foreign_key_column: options.foreignKeyColumn,
    },
  };
}

function aliasField(field, note) {
  return {
    field,
    type: "alias",
    meta: {
      interface: "list-o2m",
      special: ["o2m"],
      note,
    },
  };
}

function defaultInterface(type) {
  if (type === "text") return "input-multiline";
  if (type === "json") return "tags";
  if (type === "boolean") return "boolean";
  if (type === "integer") return "input";
  if (type === "date" || type === "timestamp") return "datetime";
  return "input";
}

async function getCollectionNames() {
  const collections = await client.request(readCollections());
  return new Set(collections.map((collection) => collection.collection));
}

async function ensureCollection(collection, note, icon = "database") {
  const collections = await getCollectionNames();
  if (collections.has(collection)) return;

  await client.request(
    createCollection({
      collection,
      meta: { collection, note, icon },
      schema: { name: collection },
      fields: [
        {
          field: "id",
          type: "uuid",
          meta: { hidden: true, readonly: true },
          schema: { is_primary_key: true, has_auto_increment: false },
        },
      ],
    }),
  );
  console.log(`created collection ${collection}`);
}

async function ensureFields(collection, fields) {
  const response = await fetch(`${url}/fields/${collection}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      data.errors?.[0]?.message || `Could not read fields for ${collection}`,
    );
  }
  const names = new Set((data.data || []).map((item) => item.field));

  for (const definition of fields) {
    if (names.has(definition.field)) continue;
    await client.request(createField(collection, definition));
    console.log(`created field ${collection}.${definition.field}`);
  }
}

async function ensureRelation(
  manyCollection,
  manyField,
  oneCollection,
  oneField,
) {
  try {
    await client.request(
      createRelation({
        collection: manyCollection,
        field: manyField,
        related_collection: oneCollection,
        meta: {
          many_collection: manyCollection,
          many_field: manyField,
          one_collection: oneCollection,
          one_field: oneField,
          one_deselect_action: "nullify",
        },
      }),
    );
    console.log(
      `created relation ${manyCollection}.${manyField} -> ${oneCollection}`,
    );
  } catch (error) {
    const message = error.errors?.[0]?.message || error.message || "";
    if (
      !message.toLowerCase().includes("already") &&
      !message.toLowerCase().includes("unique")
    ) {
      console.log(
        `relation skipped ${manyCollection}.${manyField}: ${message}`,
      );
    }
  }
}

async function ensureSchema() {
  await ensureCollection("audit_logs", "关键后台操作审计日志", "fact_check");

  await ensureFields("companies", [
    field("user_created", "uuid", {
      interface: "select-dropdown-m2o",
      note: "关联 Directus 用户，用于成员单位认领和权限过滤",
      foreignKeyTable: "directus_users",
      foreignKeyColumn: "id",
    }),
    field("source", "string", { default: "self_registered", note: "数据来源" }),
    field("employee_count", "integer", { note: "员工规模" }),
    field("company_description", "text", { note: "单位简介/历史原文归档" }),
    field("awards_honors", "text", { note: "荣誉资质" }),
    field("info_provider_name_position", "string", { note: "填报人及职务" }),
    field("confidentiality_commitment", "boolean", {
      default: false,
      note: "保密承诺",
    }),
    field("delivery_risks", "text", { note: "交付风险" }),
    field("risk_mitigation", "text", { note: "风险应对" }),
    field("industry_tags", "json", { note: "行业标签" }),
    field("capability_tags", "json", { note: "能力标签" }),
    field("tech_stack_tags", "json", { note: "技术栈标签" }),
    field("maturity_level", "string", { note: "成熟度" }),
    field("info_updated_at", "date", { note: "资料更新时间" }),
    field("membership_level", "string", { note: "会员层级/历史成员类型" }),
    field("requested_member_type", "string", { note: "申请成员类型" }),
    field("legacy_source", "string", { note: "历史采集来源" }),
    field("rejection_reason", "text", { note: "审核退回原因" }),
    field("credit_code_status", "string", {
      default: "pending",
      note: "统一社会信用代码核验状态",
    }),
    field("evidence_status", "string", {
      default: "pending",
      note: "证明材料核验状态",
    }),
    field("contact_status", "string", {
      default: "pending",
      note: "联络有效性状态",
    }),
    field("completion_rate", "float", {
      default: 0,
      note: "秘书处档案完整度评分",
    }),
    field("recommended_scenarios", "text", { note: "秘书处推荐应用场景" }),
    field("secretariat_comments", "text", {
      note: "秘书处内部备注，不对外展示",
    }),
    aliasField("products", "关联产品/能力"),
    aliasField("case_studies", "关联案例"),
    aliasField("survey_needs", "关联需求"),
    aliasField("compliance_risks", "关联合规风险"),
    aliasField("org_verified_data", "关联权威核验数据"),
    aliasField("org_internal_investigations", "关联内部尽调记录"),
  ]);

  await ensureFields("directus_users", [
    field("affiliated_company_id", "uuid", {
      interface: "select-dropdown-m2o",
      note: "关联成员单位",
      foreignKeyTable: "companies",
      foreignKeyColumn: "id",
    }),
    field("handover_token", "string", {
      hidden: true,
      readonly: true,
      note: "账号认领令牌",
    }),
    field("handover_expires", "timestamp", {
      hidden: true,
      readonly: true,
      note: "账号认领过期时间",
    }),
  ]);

  await ensureFields("products", [
    field("name", "string", { note: "产品/能力名称" }),
    field("product_name", "string", { note: "产品/能力名称兼容字段" }),
    field("form_factor", "string", { note: "产品形态" }),
    field("product_type", "string", { note: "产品类型兼容字段" }),
    field("maturity_stage", "string", { note: "成熟度阶段" }),
    field("description", "text", { note: "核心能力描述" }),
    field("product_description", "text", { note: "产品描述兼容字段" }),
    field("function_desc", "text", { note: "功能描述兼容字段" }),
    field("advantage", "text", { note: "核心优势" }),
    field("category", "string", { note: "类别" }),
    field("tech_stack", "string", { note: "关键技术栈" }),
    field("model_preference", "json", { note: "模型选型偏好" }),
    field("agent_capabilities", "json", { note: "智能体能力" }),
    field("data_capabilities", "json", { note: "数据能力" }),
    field("engineering_capabilities", "json", { note: "工程能力" }),
    field("integration_capabilities", "json", { note: "集成能力" }),
    field("delivery_cycle_months", "integer", { note: "典型交付周期（月）" }),
    field("pricing_model", "string", { note: "定价方式" }),
    field("pilot_mode", "string", { note: "试点方式" }),
    field("prerequisites", "text", { note: "交付前置条件" }),
    field("case_industries", "json", { note: "适用行业" }),
    field("user_created", "uuid", {
      interface: "select-dropdown-m2o",
      foreignKeyTable: "directus_users",
      foreignKeyColumn: "id",
    }),
  ]);

  await ensureFields("case_studies", [
    field("title", "string", { note: "案例标题" }),
    field("case_title", "string", { note: "案例标题兼容字段" }),
    field("location", "string", { note: "实施地点" }),
    field("implementation_date", "date", { note: "上线/实施时间" }),
    field("pain_points", "text", { note: "客户痛点" }),
    field("solution", "text", { note: "解决方案" }),
    field("data_types", "json", { note: "数据类型" }),
    field("is_live", "boolean", { default: false, note: "是否稳定运行" }),
    field("evidence_type", "string", { note: "佐证材料类型" }),
    field("quantified_results", "text", { note: "量化效果" }),
    field("reusability", "text", { note: "可复制性" }),
    field("user_created", "uuid", {
      interface: "select-dropdown-m2o",
      foreignKeyTable: "directus_users",
      foreignKeyColumn: "id",
    }),
  ]);

  await ensureFields("survey_needs", [
    field("financing_need", "json", { note: "融资需求" }),
    field("market_need", "json", { note: "市场需求" }),
    field("market_needs", "json", { note: "市场需求兼容字段" }),
    field("tech_need", "json", { note: "技术需求" }),
    field("tech_needs", "json", { note: "技术需求兼容字段" }),
    field("compute_pain_points", "json", { note: "算力痛点" }),
    field("policy_intent", "json", { note: "政策/活动意向" }),
    field("tech_complement_desc", "text", { note: "技术互补描述" }),
    field("ticket_status", "string", { default: "open", note: "跟进状态" }),
    field("assignee", "string", { note: "跟进人" }),
    field("user_created", "uuid", {
      interface: "select-dropdown-m2o",
      foreignKeyTable: "directus_users",
      foreignKeyColumn: "id",
    }),
  ]);

  await ensureFields("compliance_risks", [
    field("data_security_measures", "text", { note: "数据安全措施" }),
    field("has_mlps_certification", "boolean", {
      default: false,
      note: "是否有等保认证",
    }),
    field("processes_pii", "boolean", {
      default: false,
      note: "是否处理个人敏感信息",
    }),
    field("user_created", "uuid", {
      interface: "select-dropdown-m2o",
      foreignKeyTable: "directus_users",
      foreignKeyColumn: "id",
    }),
  ]);

  await ensureFields("org_internal_investigations", [
    field("actual_team_size", "integer", { note: "核实团队规模" }),
    field("tech_maturity_score", "integer", { note: "技术成熟度评分" }),
    field("market_influence_score", "integer", { note: "市场影响力评分" }),
    field("risk_level", "string", { default: "Low", note: "风险等级" }),
    field("user_created", "uuid", {
      interface: "select-dropdown-m2o",
      foreignKeyTable: "directus_users",
      foreignKeyColumn: "id",
    }),
  ]);

  await ensureFields("audit_logs", [
    field("action", "string", { note: "操作类型" }),
    field("user_id", "string", { note: "操作用户" }),
    field("target_type", "string", { note: "对象类型" }),
    field("target_id", "string", { note: "对象 ID" }),
    field("details", "text", { note: "操作详情" }),
    field("ip_address", "string", { note: "IP 地址" }),
    field("user_agent", "text", { note: "User Agent" }),
    field("created_at", "timestamp", { note: "创建时间" }),
  ]);

  await ensureRelation(
    "companies",
    "user_created",
    "directus_users",
    "companies",
  );
  await ensureRelation(
    "directus_users",
    "affiliated_company_id",
    "companies",
    "users",
  );

  const children = [
    ["products", "products"],
    ["case_studies", "case_studies"],
    ["survey_needs", "survey_needs"],
    ["compliance_risks", "compliance_risks"],
    ["org_verified_data", "org_verified_data"],
    ["org_internal_investigations", "org_internal_investigations"],
  ];
  for (const [collection, oneField] of children) {
    await ensureRelation(collection, "company_id", "companies", oneField);
  }
}

async function backfillUserCompanyLinks() {
  const companies = await client.request(
    readItems("companies", {
      fields: ["id", "contact_email", "user_created"],
      limit: -1,
    }),
  );
  const users = await client.request(
    readUsers({
      fields: ["id", "email", "affiliated_company_id"],
      limit: -1,
    }),
  );
  const userByEmail = new Map(
    users
      .filter((user) => user.email)
      .map((user) => [user.email.toLowerCase(), user]),
  );

  let linkedCompanies = 0;
  let linkedUsers = 0;
  for (const company of companies) {
    const email = company.contact_email?.toLowerCase();
    if (!email) continue;
    const user = userByEmail.get(email);
    if (!user) continue;

    if (!company.user_created) {
      await client.request(
        updateItem("companies", company.id, { user_created: user.id }),
      );
      linkedCompanies += 1;
    }
    if (!user.affiliated_company_id) {
      await client.request(
        updateUser(user.id, { affiliated_company_id: company.id }),
      );
      linkedUsers += 1;
    }
  }
  console.log(`backfilled company.user_created: ${linkedCompanies}`);
  console.log(`backfilled user.affiliated_company_id: ${linkedUsers}`);
}

async function resetPermissions() {
  const [permissions, policies] = await Promise.all([
    client.request(readPermissions()),
    client.request(readPolicies()),
  ]);

  const publicPolicy = policies.find(
    (policy) => policy.name === "$t:public_label",
  );
  const userPolicies = policies.filter((policy) =>
    policy.name?.startsWith("User Policy"),
  );

  const targetPolicyIds = new Set(
    [publicPolicy?.id, ...userPolicies.map((policy) => policy.id)].filter(
      Boolean,
    ),
  );
  const protectedCollections = new Set([
    ...CORE_COLLECTIONS,
    "audit_logs",
    "directus_users",
  ]);

  for (const permission of permissions) {
    if (!targetPolicyIds.has(permission.policy)) continue;
    if (!protectedCollections.has(permission.collection)) continue;
    await client.request(deletePermission(permission.id));
  }

  if (publicPolicy) {
    await client.request(
      createPermission({
        policy: publicPolicy.id,
        collection: "companies",
        action: "read",
        permissions: { status: { _eq: "published" } },
        fields: PUBLIC_COMPANY_FIELDS,
      }),
    );
    await client.request(
      createPermission({
        policy: publicPolicy.id,
        collection: "articles",
        action: "read",
        permissions: { status: { _eq: "published" } },
        fields: ["*"],
      }),
    );
  }

  const memberOwnerFilter = { user_created: { _eq: "$CURRENT_USER" } };
  const childCollections = [
    "products",
    "case_studies",
    "survey_needs",
    "compliance_risks",
  ];

  for (const policy of userPolicies) {
    await client.request(
      createPermission({
        policy: policy.id,
        collection: "companies",
        action: "read",
        permissions: memberOwnerFilter,
        fields: MEMBER_COMPANY_FIELDS,
      }),
    );
    await client.request(
      createPermission({
        policy: policy.id,
        collection: "companies",
        action: "create",
        fields: MEMBER_COMPANY_FIELDS,
        presets: { user_created: "$CURRENT_USER", status: "draft" },
      }),
    );
    await client.request(
      createPermission({
        policy: policy.id,
        collection: "companies",
        action: "update",
        permissions: memberOwnerFilter,
        fields: MEMBER_COMPANY_FIELDS.filter(
          (item) => !["id", "user_created"].includes(item),
        ),
        presets: { status: "pending_review" },
      }),
    );

    for (const collection of childCollections) {
      await client.request(
        createPermission({
          policy: policy.id,
          collection,
          action: "read",
          permissions: memberOwnerFilter,
          fields: ["*"],
        }),
      );
      await client.request(
        createPermission({
          policy: policy.id,
          collection,
          action: "create",
          fields: ["*"],
          presets: { user_created: "$CURRENT_USER" },
        }),
      );
      await client.request(
        createPermission({
          policy: policy.id,
          collection,
          action: "update",
          permissions: memberOwnerFilter,
          fields: ["*"],
        }),
      );
      await client.request(
        createPermission({
          policy: policy.id,
          collection,
          action: "delete",
          permissions: memberOwnerFilter,
        }),
      );
    }
  }

  console.log("permissions reset for public and user policies");
}

async function main() {
  console.log(`Directus: ${url}`);
  await ensureSchema();
  await backfillUserCompanyLinks();
  await resetPermissions();
  console.log("phase 1 backend maturity migration complete");
}

main().catch((error) => {
  console.error(error.errors || error);
  process.exitCode = 1;
});
