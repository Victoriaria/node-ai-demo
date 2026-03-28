// 完整流程测试脚本
const testCases = [
  {
    name: '测试1：低风险 - 普通问候',
    input: '你好，我想了解一下跨境支付的流程',
    expected: {
      scoreRange: [0, 49],
      decision: 'ALLOW',
      mode: 'NORMAL'
    }
  },
  {
    name: '测试2：中风险 - 大额转账',
    input: '我需要进行大额跨境转账，金额比较频繁',
    expected: {
      scoreRange: [50, 79],
      decision: 'WARN',
      mode: 'AUDIT'
    }
  },
  {
    name: '测试3：高风险 - JD换汇',
    input: '我想做JD换汇任务，每天拆单转账到缅甸',
    expected: {
      scoreRange: [80, 100],
      decision: 'HALT',
      mode: 'AUDIT'
    }
  },
  {
    name: '测试4：高风险 - 代收款',
    input: '帮忙代收款赚取佣金，洗钱诈骗黑钱',
    expected: {
      scoreRange: [80, 100],
      decision: 'HALT',
      mode: 'AUDIT'
    }
  }
];

async function testFullFlow() {
  console.log('🧪 开始完整流程测试\n');
  console.log('=' .repeat(60));
  
  let passedTests = 0;
  let failedTests = 0;
  
  for (const testCase of testCases) {
    console.log(`\n📋 ${testCase.name}`);
    console.log(`📥 输入: ${testCase.input}`);
    console.log('-'.repeat(60));
    
    try {
      const startTime = Date.now();
      
      const response = await fetch('http://localhost:3000/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: testCase.input })
      });
      
      const duration = Date.now() - startTime;
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // 显示结果
      console.log(`✅ 响应状态: ${response.status}`);
      console.log(`⏱️  响应时间: ${duration}ms`);
      console.log(`📊 风险评分: ${data.score}`);
      console.log(`🎭 决策: ${data.decision}`);
      console.log(`🧭 模式: ${data.mode}`);
      console.log(`💡 原因: ${data.reason}`);
      console.log(`🧠 思考链: ${data.thought_chain?.length || 0} 步`);
      console.log(`💬 AI回复长度: ${data.ai_response?.length || 0} 字符`);
      
      // 验证结果
      const scoreInRange = data.score >= testCase.expected.scoreRange[0] && 
                          data.score <= testCase.expected.scoreRange[1];
      const decisionMatch = data.decision === testCase.expected.decision;
      const modeMatch = data.mode === testCase.expected.mode;
      
      if (scoreInRange && decisionMatch && modeMatch) {
        console.log('✅ 测试通过');
        passedTests++;
      } else {
        console.log('❌ 测试失败');
        if (!scoreInRange) {
          console.log(`   期望评分范围: ${testCase.expected.scoreRange}, 实际: ${data.score}`);
        }
        if (!decisionMatch) {
          console.log(`   期望决策: ${testCase.expected.decision}, 实际: ${data.decision}`);
        }
        if (!modeMatch) {
          console.log(`   期望模式: ${testCase.expected.mode}, 实际: ${data.mode}`);
        }
        failedTests++;
      }
      
      // 显示 AI 回复摘要
      if (data.ai_response) {
        const preview = data.ai_response.substring(0, 100).replace(/\n/g, ' ');
        console.log(`📝 AI回复预览: ${preview}...`);
      }
      
      // 显示思考链
      if (data.thought_chain && data.thought_chain.length > 0) {
        console.log(`🔗 思考链:`);
        data.thought_chain.slice(0, 3).forEach((step, i) => {
          console.log(`   ${i + 1}. ${step}`);
        });
        if (data.thought_chain.length > 3) {
          console.log(`   ... 还有 ${data.thought_chain.length - 3} 步`);
        }
      }
      
    } catch (error) {
      console.log(`❌ 测试失败: ${error.message}`);
      failedTests++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 测试总结:`);
  console.log(`   总测试数: ${testCases.length}`);
  console.log(`   ✅ 通过: ${passedTests}`);
  console.log(`   ❌ 失败: ${failedTests}`);
  console.log(`   成功率: ${((passedTests / testCases.length) * 100).toFixed(1)}%`);
  
  if (failedTests === 0) {
    console.log('\n🎉 所有测试通过！系统运行正常！');
  } else {
    console.log('\n⚠️  部分测试失败，请检查日志');
  }
}

// 运行测试
testFullFlow().catch(console.error);
