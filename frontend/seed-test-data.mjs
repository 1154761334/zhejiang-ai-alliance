import { createDirectus, rest, authentication, createItem, readItems, updateField } from '@directus/sdk';

const directus = createDirectus('http://localhost:8055')
    .with(rest())
    .with(authentication('json'));

async function fixAndSeed() {
    await directus.login({ email: 'admin@example.com', password: 'password' });
    console.log('✅ Logged in to Directus');

    // Fix: Make the id field have a default value (auto-generate UUID via Directus special)
    for (const collection of ['articles', 'members', 'applications']) {
        try {
            await directus.request(updateField(collection, 'id', {
                meta: {
                    special: ['uuid'],
                    interface: 'input',
                    readonly: true,
                    hidden: true,
                }
            }));
            console.log(`✅ Fixed id field for ${collection}`);
        } catch (e) {
            console.log(`⚠️ Could not fix id for ${collection}: ${e.errors?.[0]?.message || e.message}`);
        }
    }

    // --- Seed Articles ---
    console.log('\n📰 Seeding articles...');
    const articles = [
        {
            title: '浙江省 AI 智能体产业发展联盟正式成立',
            slug: 'alliance-established',
            summary: '在浙江省经信厅的指导下，由阿里云、西湖大学等200余家单位联合发起的浙江省AI智能体产业发展联盟正式宣告成立。',
            content: '<h2>联盟成立背景</h2><p>随着人工智能技术的飞速发展，AI智能体已成为产业数字化转型的重要推动力。为深入推进浙江省AI产业高质量发展，打造"政产学研金用"协同创新生态，浙江省AI智能体产业发展联盟于2025年正式成立。</p><h2>联盟宗旨</h2><p>联盟致力于整合产业链上下游资源，推动AI智能体技术标准化，促进产业协同创新，搭建政企学研对接平台，加速AI智能体在各行业的落地应用。</p>',
            publish_date: '2025-12-01T10:00:00',
            category: 'news',
        },
        {
            title: '首届联盟成员大会暨 AI 智能体技术峰会成功举办',
            slug: 'first-summit',
            summary: '联盟首届成员大会在杭州未来科技城隆重召开，来自全省200余家成员单位的代表出席了本次大会。',
            content: '<h2>大会亮点</h2><p>本次大会围绕"智能体赋能产业新质生产力"主题展开深入交流。大会发布了联盟首份AI智能体产业白皮书，并启动了多个跨企业联合实验项目。</p><h2>签约仪式</h2><p>大会期间，共有15个AI智能体应用项目进行了现场签约，涵盖智能制造、智慧城市、智慧医疗等多个领域。</p>',
            publish_date: '2026-01-15T14:00:00',
            category: 'news',
        },
        {
            title: '联盟发布 2026 年度 AI 智能体产业发展路线图',
            slug: 'roadmap-2026',
            summary: '联盟正式发布2026年度产业发展路线图，明确了未来一年在算力共享、模型定制、应用开发等方向的重点工作。',
            content: '<h2>路线图概要</h2><p>路线图围绕三大核心方向展开：一是建设浙江省AI智能体算力共享平台；二是制定AI智能体行业应用标准；三是孵化一批具有全国影响力的AI智能体创新企业。</p><p>预计到2026年底，联盟将推动50个以上AI智能体标杆应用案例落地。</p>',
            publish_date: '2026-03-01T09:00:00',
            category: 'news',
        },
    ];

    for (const article of articles) {
        try {
            const result = await directus.request(createItem('articles', article));
            console.log(`  ✅ Created: ${article.title} (id: ${result.id})`);
        } catch (e) {
            console.log(`  ⚠️ Skipped: ${article.title} - ${e.errors?.[0]?.message || e.message}`);
        }
    }

    // --- Seed Members ---
    console.log('\n🏢 Seeding members...');
    const members = [
        { name: '阿里云计算有限公司', level: '理事单位', website: 'https://www.alibabacloud.com', description: '全球领先的云计算及人工智能科技公司' },
        { name: '西湖大学', level: '理事单位', website: 'https://www.westlake.edu.cn', description: '新型研究型大学，AI基础研究前沿' },
        { name: '之江实验室', level: '理事单位', website: 'https://www.zhejianglab.com', description: '浙江省重大科技基础设施，智能计算研究' },
        { name: '海康威视', level: '普通成员', website: 'https://www.hikvision.com', description: '全球安防龙头企业，AI视觉技术领先者' },
        { name: '网易（杭州）', level: '普通成员', website: 'https://www.netease.com', description: '互联网科技企业，AI内容创作先行者' },
    ];

    for (const member of members) {
        try {
            const result = await directus.request(createItem('members', member));
            console.log(`  ✅ Created: ${member.name} (id: ${result.id})`);
        } catch (e) {
            console.log(`  ⚠️ Skipped: ${member.name} - ${e.errors?.[0]?.message || e.message}`);
        }
    }

    // --- Test: Submit an application ---
    console.log('\n📝 Testing application submission...');
    try {
        const app = await directus.request(createItem('applications', {
            company_name: '测试科技有限公司',
            contact_person: '张测试',
            phone: '13800138000',
            status: 'pending',
        }));
        console.log(`  ✅ Application submitted (id: ${app.id})`);
    } catch (e) {
        console.log(`  ⚠️ Application failed: ${e.errors?.[0]?.message || e.message}`);
    }

    // --- Verify ---
    console.log('\n🔍 Verifying data...');
    const savedArticles = await directus.request(readItems('articles', { fields: ['id', 'title', 'slug'] }));
    console.log(`  📰 Articles in DB: ${savedArticles.length}`);
    savedArticles.forEach(a => console.log(`     - [${a.slug}] ${a.title}`));

    const savedMembers = await directus.request(readItems('members', { fields: ['id', 'name', 'level'] }));
    console.log(`  🏢 Members in DB: ${savedMembers.length}`);
    savedMembers.forEach(m => console.log(`     - [${m.level}] ${m.name}`));

    const savedApps = await directus.request(readItems('applications', { fields: ['id', 'company_name', 'status'] }));
    console.log(`  📝 Applications in DB: ${savedApps.length}`);
    savedApps.forEach(a => console.log(`     - [${a.status}] ${a.company_name}`));

    console.log('\n🎉 All done! Check your pages:');
    console.log('   👉 http://localhost:3000/blog');
    console.log('   👉 http://localhost:3000/blog/alliance-established');
    console.log('   👉 http://localhost:3000/join');
}

fixAndSeed().catch(console.error);
