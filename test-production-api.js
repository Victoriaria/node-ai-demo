/**
 * 生产环境 API 测试脚本
 * 测试 Vercel 部署的 API 是否正常工作
 */

const PRODUCTION_URL = 'https://node-ai-iota.vercel.app';

async function testProductionAPI() {
  console.log('🧪 测试生产环境 API\n');
  console.log('🌐 URL:', PRODUCTION_URL);
  console.log('─'.repeat(80));

  const testCases = [
    {
      name: '高风险 - JD换汇任务',
      input: '我想帮朋友做个JD换汇任务，赚点佣金',
      expected: { score: 92, decision: 'HALT' }
    },
    {
      name: '低风险 - 正常咨询',
      input: '你好，我想了解一下跨境支付的手续费',
      expected: { score: 42, decision: 'ALLOW' }
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📝 测试: ${testCase.name}`);
    console.log(`📥 输入: ${testCase.input}`);
    console.log('⏳ 发送请求...\n');

    try {
      const startTime = Date.now();
      
      const response = await fetch(`${PRODUCTION_URL}/api/audit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: testCase.input }),
      });

      const duration = Date.now() - startTime;

      console.log(`📡 响应状态: ${response.status} ${response.statusText}`);
      console.log(`⏱️  响应时间: ${duration}ms`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP 错误');
        console.error('错误内容:', errorText);
        continue;
      }

      const result = await response.json();

      console.log('\n📊 响应数据:');
      console.log('   评分:', result.score ?? '待评定');
      console.log('   决策:', result.decision);
      console.log('   模式:', result.mode);
      console.log('   原因:', result.reason?.substring(0, 50) + '...');

      if (result.thought_chain && result.thought_chain.length > 0) {
        console.log('\n🔍 思考链:');
        result.thought_chain.slice(0, 5).forEach((step, i) => {
          console.log(`   ${i + 1}. ${step}`);
        });
        if (result.thought_chain.length > 5) {
          console.log(`   ... 还有 ${result.thought_chain.length - 5} 步`);
        }
      } else {
        console.log('\n⚠️  警告: 思考链为空');
      }

      // 验证结果
      let passed = true;
      if (testCase.expected.decision && result.decision !== testCase.expected.decision) {
        console.log(`\n❌ 决策不匹配: 期望 ${testCase.expected.decision}, 实际 ${result.decision}`);
        passed = false;
      }

      if (testCase.expected.score && result.score !== null) {
        const scoreDiff = Math.abs(result.score - testCase.expected.score);
        if (scoreDiff > 10) {
          console.log(`\n⚠️  评分偏差较大: 期望 ${testCase.expected.score}, 实际 ${result.score}`);
        }
      }

      if (passed) {
        console.log('\n✅ 测试通过');
      }

    } catch (error) {
      console.error('❌ 测试失败:', error.message);
      console.error('错误详情:', error);
    }

    console.log('─'.repeat(80));
  }

  console.log('\n🏁 测试完成');
}

// 运行测试
testProductionAPI().catch(err => {
  console.error('\n💥 测试崩溃:', err);
  process.exit(1);
});
