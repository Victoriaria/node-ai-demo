/**
 * Coze API 测试脚本
 * 用于验证 Coze Bot 是否能正常返回 SSE 流式响应
 */

const COZE_API_KEY = 'pat_IS7gZeBKFHEETYYT5bqPkxSHHUti7PnZPcUu47wjlPxuF69YxNZkrV4HrUTN6gBR';
const COZE_BOT_ID = '7621043639807967270';
const COZE_API_BASE = 'https://api.coze.cn';

async function testCozeAPI() {
  console.log('🧪 开始测试 Coze API...\n');
  console.log('🤖 Bot ID:', COZE_BOT_ID);
  console.log('🔑 API Key:', COZE_API_KEY.substring(0, 15) + '...\n');

  const testMessage = '我想帮朋友做个JD换汇任务，赚点佣金';
  console.log('📝 测试消息:', testMessage);
  console.log('⏳ 发送请求...\n');

  try {
    const response = await fetch(`${COZE_API_BASE}/v3/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${COZE_API_KEY}`,
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({
        bot_id: COZE_BOT_ID,
        user_id: 'test-user-' + Date.now(),
        additional_messages: [{
          role: 'user',
          content: testMessage,
          content_type: 'text'
        }],
        stream: true,
      }),
    });

    console.log('📡 响应状态:', response.status, response.statusText);
    console.log('📡 响应头:');
    for (const [key, value] of response.headers.entries()) {
      console.log(`   ${key}: ${value}`);
    }
    console.log('');

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API 请求失败');
      console.error('❌ 错误信息:', errorText);
      return;
    }

    console.log('📖 开始读取 SSE 流...\n');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let messageCount = 0;
    let fullAnswer = '';
    let currentEvent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        console.log('\n✅ SSE 流读取完成');
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
          currentEvent = '';
          continue;
        }

        if (trimmed.startsWith('event:')) {
          currentEvent = trimmed.slice(6).trim();
          console.log('📌 事件类型:', currentEvent);
          continue;
        }

        if (trimmed.startsWith('data:')) {
          const jsonStr = trimmed.slice(5).trim();
          if (!jsonStr || jsonStr === '[DONE]') {
            console.log('🏁 收到 [DONE] 标记');
            continue;
          }

          try {
            const evt = JSON.parse(jsonStr);
            messageCount++;

            if (messageCount <= 5) {
              console.log(`📡 SSE 消息 #${messageCount}:`, JSON.stringify(evt).substring(0, 150) + '...');
            }

            const msgData = evt.message || evt.data || evt;
            const role = msgData.role || '';
            const type = msgData.type || '';
            const content = msgData.content || '';

            if (role === 'assistant' && type === 'answer' && content) {
              if (currentEvent === 'conversation.message.delta') {
                fullAnswer += content;
              } else if (currentEvent === 'conversation.message.completed') {
                fullAnswer = content;
              } else if (!currentEvent) {
                fullAnswer += content;
              }
            }
          } catch (parseError) {
            console.warn('⚠️ JSON 解析失败:', jsonStr.substring(0, 100));
          }
        }
      }
    }

    console.log('\n📊 测试结果统计:');
    console.log('   总消息数:', messageCount);
    console.log('   Answer 长度:', fullAnswer.length, '字符');
    console.log('');

    if (fullAnswer.length === 0) {
      console.error('❌ 测试失败：SSE 流响应为空');
      console.error('');
      console.error('可能的原因：');
      console.error('1. COZE_BOT_ID 配置错误');
      console.error('2. Bot 没有配置知识库或回复逻辑');
      console.error('3. Bot 权限问题');
      console.error('');
      console.error('建议操作：');
      console.error('1. 登录 Coze 平台验证 Bot ID');
      console.error('2. 在 Coze 平台测试 Bot 是否能正常回复');
      console.error('3. 检查 API Key 权限');
    } else {
      console.log('✅ 测试成功：收到有效的 AI 回复');
      console.log('');
      console.log('💬 AI 回复内容（前 500 字符）:');
      console.log('─'.repeat(60));
      console.log(fullAnswer.substring(0, 500));
      if (fullAnswer.length > 500) {
        console.log('...(还有', fullAnswer.length - 500, '字符)');
      }
      console.log('─'.repeat(60));
    }

  } catch (error) {
    console.error('❌ 测试异常:', error.message);
    console.error('');
    console.error('错误详情:', error);
  }
}

// 运行测试
testCozeAPI().then(() => {
  console.log('\n🏁 测试完成');
}).catch(err => {
  console.error('\n💥 测试崩溃:', err);
  process.exit(1);
});
