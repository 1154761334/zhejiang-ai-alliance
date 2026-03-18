const XLSX = require('xlsx');
const path = require('path');

const filePath = 'c:\\Dev\\zhejiang-ai-alliance\\docs\\企业能力档案调研清单.xlsx';
const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets['企业能力档案填报表'];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log('--- ROWS 31-60 ---');
let currentCategory = '';
data.slice(31, 60).forEach((row, index) => {
    if (row && row.length > 0) {
        if (row[0]) {
            currentCategory = row[0];
            console.log(`\n\n[${currentCategory}]`);
        }
        const fieldName = row[1];
        if (fieldName && fieldName !== '字段名称') {
            const desc = row[2] ? ` (${row[2]})` : '';
            console.log(`  - ${fieldName}${desc}`);
        }
    }
});
