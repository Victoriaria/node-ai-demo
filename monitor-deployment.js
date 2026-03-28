/**
 * Vercel 部署监控脚本
 * 持续检查生产环境 API 是否已更新
 */

const PRODUCTION_URL = 'https://node-ai-iota.vercel.app';
const CHECK_INTERVAL = 10000; // 10秒检查一次
const MAX_ATTEMPTS = 30; // 最多检查5分钟

async function checkAPI() {
  try {
    const response = await fetch(`${PRODUCTION_URL}/api/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: '我想帮朋友做个JD换汇任务，赚点佣金' })
    });

    const result = await response.json();
    return result;
  } catch (error) {
    return { error: error.message };
  }
}

async function monitorDeployment() {
  console.log('🔍 开始监控 Vercel 部署状态\n');
  console.log('🌐 生产环境:', PRODUCTION_URL);
  console.log('⏱️  检查间隔: 10秒');
  console.log('🎯 目标: 评分=92, 决策=HALT\n');
  console.log('─'.repeat(80));

  let attempt = 0;
  let lastStatus = null;

  while (attempt < MAX_ATTEMPTS) {
    attempt++;
    const timestamp = new Date().toLocaleTimeString('zh-CN');
    
    console.log(`\n[${timestamp}] 第 ${attempt}/${MAX_ATTEMPTS} 次检查...`);

    const result = await checkAPI();

    if (result.error) {
      console.log('❌ API 调用失败:', result.error);
    } else {
      const status = `评分=${result.score ?? '待评定'}, 决策=${result.decision}`;
      
      if (status !== lastStatus) {
        console.log('📊 状态变化:', status);
        lastStatus = status;
      } else {
        console.log('📊 状态:', status);
      }

      // 检查是否部署成功
      if (result.score === 92 && result.decision === 'HALT') {
        console.log('\n🎉 部署成功！本地工作流引擎已生效！');
        console.log('\n✅ 验证结果:');
        console.log('   评分:', result.score, '/100');
        console.log('   决策:', result.decision);
        console.log('   模式:', result.mode);
        console.log('   原因:', result.reason?.substring(0, 60) + '...');
        
        if (result.thought_chain && result.thought_chain.length > 0) {
          console.log('\n🔍 思考链（前5步）:');
          result.thought_chain.slice(0, 5).forEach((step, i) => {
            console.log(`   ${i + 1}. ${step}`);
          });
        }

        console.log('\n🚀 生产环境已就绪！');
        console.log('🌐 访问:', PRODUCTION_URL);
        return;
      }

      // 检查是否还在使用旧版本
      if (result.reason?.includes('未获取到AI回复') || 
          result.reason?.includes('SSE流响应为空')) {
        console.log('⏳ 仍在使用旧版本，等待 Vercel 部署...');
      }
    }

    if (attempt < MAX_ATTEMPTS) {
      await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
    }
  }

  console.log('\n⚠️  超时：部署可能需要更长时间');
  console.log('💡 建议：');
  console.log('   1. 访问 Vercel Dashboard 查看部署状态');
  console.log('   2. 检查构建日志是否有错误');
  console.log('   3. 手动刷新页面测试');
}

// 运行监控
console.log('🚀 Vercel 部署监控工具\n');
console.log('代码已推送到 GitHub，Vercel 正在自动部署...');
console.log('预计部署时间: 2-3 分钟\n');

monitorDeployment().catch(err => {
  console.error('\n💥 监控失败:', err);
  process.exit(1);
});
