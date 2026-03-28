/**
 * 本地工作流引擎测试脚本
 * 测试不同场景下的风险评估结果
 */

const testCases = [
  {
    name: '高风险 - JD换汇任务',
    input: '我想帮朋友做个JD换汇任务，赚点佣金',
    expected: { decision: 'HALT', scoreRange: [85, 100] }
  },
  {
    name: '高风险 - 拆单洗钱',
    input: '我需要转账5万美元，能不能分成10笔每笔4900美元转账？',
    expected: { decision: 'HALT', scoreRange: [90, 100] }
  },
  {
    name: '中低风险 - 跨境汇款',
    input: '我想给在美国的朋友汇款1000美元',
    expected: { decision: 'ALLOW', scoreRange: [20, 50] }
  },
  {
    name: '低风险 - 正常咨询',
    input: '你好，我想了解一下跨境支付的手续费',
    expected: { decision: 'ALLOW', scoreRange: [20, 50] }
  },
  {
    name: '信息不足 - 缺少详情',
    input: '我想换汇',
    expected: { decision: 'INFO_REQUIRED', scoreRange: null }
  }
];

async function testWorkflow() {
  console.log('🧪 开始测试本地工作流引擎\n');
  console.log('=' .repeat(80));

  let passCount = 0;
  let failCount = 0;

  for (const testCase of testCases) {
    console.log(`\n📝 测试案例: ${testCase.name}`);
    console.log(`📥 输入: ${testCase.input}`);
    console.log('⏳ 发送请求...\n');

    try {
      const response = await fetch('http://localhost:3000/api/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: testCase.input }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();

      console.log('📊 测试结果:');
      console.log(`   风险评分: ${result.score ?? '待评定'}/100`);
      console.log(`   决策: ${result.decision}`);
      console.log(`   原因: ${result.reason}`);
      console.log(`\n🔍 思考链:`);
      result.thought_chain.forEach((step, i) => {
        console.log(`   ${i + 1}. ${step}`);
      });

      // 验证结果
      let passed = true;
      const errors = [];

      if (result.decision !== testCase.expected.decision) {
        passed = false;
        errors.push(`决策不匹配: 期望 ${testCase.expected.decision}, 实际 ${result.decision}`);
      }

      if (testCase.expected.scoreRange && result.score !== null) {
        const [min, max] = testCase.expected.scoreRange;
        if (result.score < min || result.score > max) {
          passed = false;
          errors.push(`评分超出预期范围: 期望 ${min}-${max}, 实际 ${result.score}`);
        }
      }

      if (passed) {
        console.log('\n✅ 测试通过');
        passCount++;
      } else {
        console.log('\n❌ 测试失败:');
        errors.forEach(err => console.log(`   - ${err}`));
        failCount++;
      }

    } catch (error) {
      console.error('❌ 测试异常:', error.message);
      failCount++;
    }

    console.log('─'.repeat(80));
  }

  console.log('\n📊 测试总结:');
  console.log(`   总计: ${testCases.length} 个测试`);
  console.log(`   通过: ${passCount} 个 ✅`);
  console.log(`   失败: ${failCount} 个 ❌`);
  console.log(`   成功率: ${((passCount / testCases.length) * 100).toFixed(1)}%`);

  if (failCount === 0) {
    console.log('\n🎉 所有测试通过！本地工作流引擎运行正常。');
  } else {
    console.log('\n⚠️ 部分测试失败，请检查工作流逻辑。');
  }
}

// 运行测试
console.log('⚠️ 请确保开发服务器已启动: npm run dev');
console.log('⚠️ 请确保 .env.local 中设置了 USE_LOCAL_WORKFLOW=true\n');

setTimeout(() => {
  testWorkflow().then(() => {
    console.log('\n🏁 测试完成');
  }).catch(err => {
    console.error('\n💥 测试崩溃:', err);
    process.exit(1);
  });
}, 1000);
