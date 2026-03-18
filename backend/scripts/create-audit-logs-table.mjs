import 'dotenv/config';

async function createAuditLogsTable() {
  const loginRes = await fetch('http://localhost:8055/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@example.com', password: 'password' }),
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.access_token;
  if (!token) {
    console.error("Login failed");
    return;
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  try {
    const collectionRes = await fetch('http://localhost:8055/collections', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        collection: 'audit_logs',
        schema: { schema: 'public' },
        meta: {
          icon: 'history',
          note: '审计日志表 - 记录系统关键操作',
          display_template: '{{action}} - {{target_type}}',
          hidden: true,
        },
      }),
    });

    if (!collectionRes.ok) {
      const err = await collectionRes.json();
      if (err.errors?.[0]?.code === 'COLLECTION_EXISTS') {
        console.log("ℹ️ audit_logs collection already exists");
      } else {
        console.error("Failed to create collection:", JSON.stringify(err, null, 2));
        return;
      }
    } else {
      console.log("✅ Created audit_logs collection");
    }

    const fields = [
      { field: 'id', type: 'uuid', primary: true },
      { field: 'action', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [
        { text: '用户登录', value: 'LOGIN' },
        { text: '用户注册', value: 'REGISTER' },
        { text: '创建企业', value: 'CREATE_COMPANY' },
        { text: '更新企业', value: 'UPDATE_COMPANY' },
        { text: '提交预审', value: 'SUBMIT_REVIEW' },
        { text: '添加尽调', value: 'ADD_INVESTIGATION' },
        { text: '导出数据', value: 'EXPORT_COMPANIES' },
        { text: '修改密码', value: 'PASSWORD_CHANGE' },
        { text: '修改资料', value: 'PROFILE_UPDATE' },
      ]}}},
      { field: 'target_type', type: 'string', meta: { interface: 'input' } },
      { field: 'target_id', type: 'string', meta: { interface: 'input' } },
      { field: 'user_id', type: 'uuid', meta: { interface: 'user' } },
      { field: 'details', type: 'text', meta: { interface: 'input', options: { multiline: true } } },
      { field: 'ip_address', type: 'string', meta: { interface: 'input' } },
      { field: 'user_agent', type: 'string', meta: { interface: 'input' } },
      { field: 'created_at', type: 'timestamp', meta: { interface: 'datetime', special: ['cast-csv'] } },
    ];

    for (const f of fields) {
      const fieldRes = await fetch(`http://localhost:8055/fields/audit_logs/${f.field}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          collection: 'audit_logs',
          field: f.field,
          type: f.type,
          schema: { schema: 'public' },
          meta: f.meta || {},
        }),
      });

      if (!fieldRes.ok) {
        const err = await fieldRes.json();
        if (err.errors?.[0]?.code === 'RECORD_EXISTS') {
          console.log(`ℹ️ Field ${f.field} already exists`);
        } else {
          console.log(`⚠️ Field ${f.field}:`, err.errors?.[0]?.message || 'created');
        }
      } else {
        console.log(`✅ Created field: ${f.field}`);
      }
    }

    console.log("✅ Audit logs table setup complete!");
  } catch (error) {
    console.error("Error:", error);
  }
}

createAuditLogsTable();