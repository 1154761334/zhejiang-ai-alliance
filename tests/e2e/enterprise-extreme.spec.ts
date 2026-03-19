import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3001';

test.describe('企业信息深度录入测试 - 极限全覆盖版', () => {
  const timestamp = Date.now();
  const testEmail = `extreme-${timestamp}@example.com`;

  test('全字段深度填报极限测试', async ({ page, context }) => {
    test.setTimeout(420000); // 7 mins for extreme coverage

    // 1. 注册登录
    await test.step('1. 注册登录', async () => {
      console.log('>>> [1] 注册登录');
      await context.clearCookies();
      await page.goto(`${BASE_URL}/register`);
      await page.fill('#email', testEmail);
      await page.fill('#password', 'Password123!');
      await page.click('button:has-text("申请入驻")');
      await page.waitForURL('**/dashboard', { timeout: 30000 });
      await page.waitForLoadState('networkidle');
    });

    // 2. Step 1: 极限填报 (15+ 字段)
    await test.step('2. Step 1 基础信息极限填报', async () => {
      console.log('>>> [2] Step 1 极限填报');
      await page.waitForSelector('input[name="company_name"]', { timeout: 15000 });
      
      await page.locator('input[name="company_name"]').fill(`极限测试企业 ${timestamp}`);
      await page.locator('input[name="company_description"]').fill('极限全字段填报描述，包含核心业务、定位以及未来发展规划等多维度信息。');
      await page.locator('input[name="awards_honors"]').fill('国家高新技术企业、省专精特新“小巨人”、硬核科技百强');
      await page.locator('input[name="credit_code"]').fill(`91330101MA2${String(timestamp).slice(-7)}`);
      
      // 日期选择
      await page.locator('button:has(.lucide-calendar)').first().click();
      await page.waitForSelector('table[role="grid"]', { timeout: 5000 });
      await page.locator('table[role="grid"] button:not([disabled])').first().click();
      await page.keyboard.press('Escape');
      
      const comboboxes = page.locator('button[role="combobox"]');
      
      // 城市
      await comboboxes.nth(0).click();
      await page.click('[role="option"]:has-text("杭州市")');
      
      await page.locator('input[name="address"]').fill('杭州市滨江区网商路699号');
      await page.locator('input[name="website"]').fill('https://www.extreme-ai.example.com');
      
      // 企业性质
      await comboboxes.nth(1).click();
      await page.click('[role="option"]:has-text("民营企业")');
      
      await page.locator('input[name="employee_count"]').fill('500');
      await page.locator('input[name="rnd_count"]').fill('400');

      // 营收区间
      await comboboxes.nth(2).click();
      await page.click('[role="option"]:has-text("1亿以上")');
      
      // 细分赛道 (全选)
      for (const track of ["智能制造", "智慧政务", "智慧康养", "新能源", "金融科技"]) {
        await page.click(`label:has-text("${track}")`);
      }

      // 角色定位
      await page.click('label:has-text("应用解决方案层")');
      
      await page.locator('input[name="contact_name"]').fill('Extreme Tester');
      await page.locator('input[name="contact_position"]').fill('Chief Testing Officer');
      await page.locator('input[name="contact_phone"]').fill('13888888888');
      await page.locator('input[name="contact_email"]').fill(testEmail);
      
      // 对接偏好
      await comboboxes.nth(3).click();
      await page.click('[role="option"]:has-text("邮件")');
      
      await page.locator('input[name="info_provider_name_position"]').fill('张三 自动化测试部');
      
      await page.click('button:has-text("下一步：填写核心能力")');
      await expect(page.locator('text=第二板块')).toBeVisible({ timeout: 15000 });
      console.log('>>> [OK] Step 1 极限完成');
    });

    // 3. Step 2: 核心能力极限填报 (12+ 字段)
    await test.step('3. Step 2 产品能力极限填报', async () => {
      console.log('>>> [3] Step 2 极限填报');
      await page.locator('input[name="products.0.name"]').fill('Extreme Intelligent Platform');
      const comboboxes = page.locator('button[role="combobox"]');
      
      // 形态
      await comboboxes.nth(0).click();
      await page.click('[role="option"]:has-text("智能体")');
      
      // 成熟度
      await comboboxes.nth(1).click();
      await page.click('[role="option"]:has-text("规模化商用")');

      await page.locator('textarea[name="products.0.description"]').fill('具备多模态理解、长短期记忆、工具自主调用等极限能力的通用智能体平台。');
      await page.locator('input[name="products.0.tech_stack"]').fill('Transformer-based LLM, Vector DB, RAG, ReAct Framework');
      
      // 偏好与能力 (多选)
      for (const opt of ["混合模式", "编排", "工具调用", "采集", "标注"]) {
        await page.click(`label:has-text("${opt}")`);
      }

      await page.locator('input[name="products.0.delivery_cycle_months"]').fill('3');
      
      // 定价
      await comboboxes.nth(2).click();
      await page.click('[role="option"]:has-text("按量计费")');
      
      // 试点
      await comboboxes.nth(3).click();
      await page.click('[role="option"]:has-text("付费 PoC")');
      
      await page.locator('input[name="products.0.prerequisites"]').fill('需要提供清洗后的行业语料及私有云环境。');
      
      await page.click('button:has-text("下一步：补充案例")');
      await expect(page.locator('text=第三板块')).toBeVisible({ timeout: 15000 });
      console.log('>>> [OK] Step 2 极限完成');
    });

    // 4. Step 3: 场景案例极限填报 (10+ 字段)
    await test.step('4. Step 3 场景案例极限填报', async () => {
      console.log('>>> [4] Step 3 极限填报');
      await page.click('button:has-text("+ 增加一个场景案例")');
      
      await page.locator('input[name="case_studies.0.title"]').fill('某大型能源集团生产调度智能助手');
      await page.locator('input[name="case_studies.0.location"]').fill('上海/北京');
      
      await page.locator('button:has(.lucide-calendar)').first().click();
      await page.waitForSelector('table[role="grid"]', { timeout: 5000 });
      await page.locator('table[role="grid"] button:not([disabled])').first().click();
      await page.keyboard.press('Escape');
      
      await page.locator('textarea[name="case_studies.0.pain_points"]').fill('调度流程复杂，依赖专家经验，响应延迟高，数据碎片化严重。');
      await page.locator('textarea[name="case_studies.0.solution"]').fill('通过接入实时遥测数据，构建行业大语言模型，实现自动化调度建议生成。');
      
      // 类型
      for (const opt of ["结构化", "文本", "传感器"]) {
        await page.click(`label:has-text("${opt}")`);
      }
      
      await page.locator('label:has-text("目前是否正式上线运行？")').click();
      
      // 佐证
      await page.locator('button[role="combobox"]').first().click();
      await page.click('[role="option"]:has-text("验收报告")');
      
      await page.locator('textarea[name="case_studies.0.quantified_results"]').fill('人力削减45%，响应速度提升10倍，故障误报率降低30%。');
      await page.locator('input[name="case_studies.0.reusability"]').fill('适用于各类工业流程监控、电力调度及智慧油田等场景。');
      
      await page.click('button:has-text("下一步：合规与赋能需求")');
      await expect(page.locator('text=合规承诺与生态赋能')).toBeVisible({ timeout: 15000 });
      console.log('>>> [OK] Step 3 极限完成');
    });

    // 5. Step 4: 赋能与合规极限填报 (15+ 字段)
    await test.step('5. Step 4 极限填报并提交', async () => {
      console.log('>>> [5] Step 4 极限填报');
      
      // 需求 (全选)
      const needs = ["政府产业基金扶持", "大客户对接联络", "商业算力成本过高"];
      for (const need of needs) {
        await page.click(`label:has-text("${need}")`);
      }
      
      await page.locator('textarea[name="tech_complement_desc"]').fill('急需在3D点云视觉算法及机器人关节控制算法上有深度积累的合作伙伴。');
      
      // 活动意向
      await page.click('label:has-text("“智能体+”行业投融资对接会")');
      
      await page.locator('textarea[name="data_security_measures"]').fill('采用数据加密存储、三员权限管控、日志溯源及国产哈希算法进行数据完整性校验。');
      
      await page.click('label:has-text("等保或密评认证资质")');
      await page.click('label:has-text("个人信息处理 (PII) 涉密")');
      await page.click('label:has-text("涉密与保密承诺")');
      
      await page.locator('textarea[name="delivery_risks"]').fill('主要风险在于私有化环境下异构算力卡的驱动适配及算力调度效率。');
      await page.locator('textarea[name="risk_mitigation"]').fill('已建立国产算力实验室，预先完成各类国产卡的主流适配，并提供应急调度方案。');
      
      await page.click('button:has-text("确认无误，提交审核")');
      await expect(page.locator('text=基础档案提交成功')).toBeVisible({ timeout: 30000 });
      console.log('>>> [OK] 提交成功');
    });

    // 6. 最终验证
    await test.step('6. 最终状态验证', async () => {
      console.log('>>> [6] 确认状态');
      await expect(page.locator('text=基础档案提交成功')).toBeVisible();
      console.log('>>> [SUCCESS] 极限全字段填报测试圆满成功！');
    });
  });
});
