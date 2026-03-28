import { NextRequest, NextResponse } from 'next/server';
import { executeWorkflow } from '@/lib/workflowEngine';

// 强制动态渲染，防止 Vercel 缓存
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const COZE_API_BASE = 'https://api.coze.cn';
const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true';
const USE_LOCAL_WORKFLOW = process.env.USE_LOCAL_WORKFLOW === 'true';

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.COZE_API_KEY}`,
    'Accept': 'text/event-stream',
  };
}

function parseRiskFromAnswer(answer: string) {
  let score: number | undefined;
  let mode: 'NORMAL' | 'AUDIT' = 'NORMAL';
  let decision: 'ALLOW' | 'HALT' | 'WARN' | 'INFO_REQUIRED' = 'ALLOW';
  let reason = '未发现明显高风险特征';
  let thought_chain: string[] = ['审计完成'];

  // 尝试解析 JSON 块（兼容 ```json ... ``` 和裸 JSON）
  try {
    const jsonMatch = answer.match(/```json\s*([\s\S]*?)```/) || answer.match(/(\{[\s\S]*\})/);
    if (jsonMatch) {
      const extracted = JSON.parse(jsonMatch[1] ?? jsonMatch[0]);

      if (extracted.score !== undefined) score = Number(extracted.score);
      if (extracted.mode) mode = extracted.mode === 'AUDIT' ? 'AUDIT' : 'NORMAL';
      if (extracted.reason) reason = extracted.reason;
      if (Array.isArray(extracted.thought_chain)) thought_chain = extracted.thought_chain;

      if (extracted.risk_level) {
        const rl = String(extracted.risk_level).toLowerCase();
        if (rl === 'undetermined') {
          score = undefined;
        } else if (rl === 'high') {
          score = 95;
        } else if (rl === 'medium') {
          score = 65;
        } else if (rl === 'low') {
          score = 20;
        }
      }
    }
  } catch {
    console.warn('⚠️ JSON解析失败，使用纯文本模式');
  }

  if (score === undefined) {
    const upper = answer.toUpperCase();
    if (upper.includes('【HALT】') || upper.includes('HALT')) {
      if (answer.includes('缺失') || answer.includes('缺少') || answer.includes('暂无法评定') || answer.includes('undetermined')) {
        return {
          score: null,
          mode: 'AUDIT' as const,
          decision: 'INFO_REQUIRED' as const,
          reason: '缺少核心交易要素，无法完成风险评定，请补充信息后重新提交',
          thought_chain: extractThoughtChain(answer),
          ai_response: answer,
        };
      }
      score = 95;
    } else if (upper.includes('【WARN】') || upper.includes('WARN')) {
      score = 65;
    } else if (upper.includes('【ALLOW】') || upper.includes('ALLOW')) {
      score = 20;
    }
  }

  if (score === undefined) {
    const HIGH_RISK_KEYWORDS = ['洗钱', '帮信罪', '非法经营', '刑事责任', '刑法', '违法', '犯罪', '冻结账户', '司法解释', '立即停止', '高风险', '严重违规', '代收款项', '赚取佣金', '转账', '资金流转', '黑钱'];
    const MED_RISK_KEYWORDS = ['风险', '合规', '注意', '谨慎', '建议', '可能', '潜在', '监管', '审查', '核实', '警惕'];
    const highMatches = HIGH_RISK_KEYWORDS.filter(k => answer.includes(k)).length;
    const medMatches = MED_RISK_KEYWORDS.filter(k => answer.includes(k)).length;
    if (highMatches >= 3) score = 85 + Math.min(highMatches, 5);
    else if (highMatches >= 1) score = 70 + highMatches * 3;
    else if (medMatches >= 2) score = 50 + medMatches * 3;
    else score = 20;
    console.log(`🔍 语义推断: 高风险词=${highMatches}, 中风险词=${medMatches}, 推断score=${score}`);
  }

  if (reason === '未发现明显高风险特征') {
    const conclusionMatch = answer.match(/【审计结论】[\s\S]*?最终决策[：:]\s*(.+)/);
    if (conclusionMatch) {
      reason = conclusionMatch[1].trim().replace(/【|】/g, '');
    } else {
      const firstSentence = answer.split(/[。\n]/).map(s => s.trim()).find(s => s.length > 10);
      if (firstSentence) reason = firstSentence.substring(0, 100);
    }
  }

  if (thought_chain.length <= 1) {
    thought_chain = extractThoughtChain(answer);
  }

  if (score === undefined) {
    mode = 'AUDIT'; decision = 'WARN';
  } else if (score >= 90) {
    decision = 'HALT'; mode = 'AUDIT';
  } else if (score >= 60) {
    decision = 'WARN'; mode = 'AUDIT';
  } else {
    decision = 'ALLOW';
  }

  return {
    score: score !== undefined ? Math.max(0, Math.min(100, score)) : null,
    mode, decision, reason, thought_chain,
    ai_response: answer,
  };
}

function extractThoughtChain(answer: string): string[] {
  const chain: string[] = [];
  const sections = answer.match(/【[^】]+】/g);
  if (sections) {
    sections.forEach(s => {
      const title = s.replace(/【|】/g, '').trim();
      if (title && !chain.includes(title)) chain.push(title);
    });
  }
  const scoreMatch = answer.match(/风险分值[：:]\s*(.+)/);
  if (scoreMatch) chain.push(`风险分值: ${scoreMatch[1].trim()}`);
  const decisionMatch = answer.match(/最终决策[：:]\s*(.+)/);
  if (decisionMatch) chain.push(`决策: ${decisionMatch[1].trim().replace(/【|】/g, '')}`);
  if (chain.length === 0) {
    const sentences = answer.split(/[。\n]/).map(s => s.trim()).filter(s => s.length > 10 && s.length < 80);
    chain.push(...sentences.slice(0, 5));
  }
  return chain.length > 0 ? chain : ['审计分析完成'];
}

export async function POST(request: NextRequest) {
  try {
    const { input } = await request.json();

    if (!input || typeof input !== 'string') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // 🎯 本地工作流模式（推荐）
    if (USE_LOCAL_WORKFLOW) {
      console.log('🔧 使用本地工作流引擎');
      console.log('📥 收到输入:', input.substring(0, 100));
      
      const result = await executeWorkflow(input);
      
      console.log('✅ 本地工作流执行完成');
      console.log('📊 风险评分:', result.score);
      console.log('📋 决策:', result.decision);
      
      return NextResponse.json(result);
    }

    // 🎯 模拟数据模式（临时解决方案）
    if (USE_MOCK_DATA) {
      console.log('⚠️ 使用模拟数据模式');
      console.log('📥 收到输入:', input.substring(0, 100));
      
      // 智能关键词检测
      const highRiskKeywords = ['换汇', 'JD', '拆单', '代收款', '洗钱', '诈骗', '黑钱', '帮信', '非法', '缅甸', '柬埔寨'];
      const medRiskKeywords = ['跨境', '大额', '转账', '频繁', '异常', '可疑'];
      
      const highRiskMatches = highRiskKeywords.filter(k => input.includes(k));
      const medRiskMatches = medRiskKeywords.filter(k => input.includes(k));
      
      let mockScore: number;
      let mockDecision: 'ALLOW' | 'HALT' | 'WARN';
      let mockMode: 'NORMAL' | 'AUDIT';
      let mockReason: string;
      let mockThoughtChain: string[];
      let mockAiResponse: string;
      
      if (highRiskMatches.length >= 2) {
        // 高风险：多个高风险关键词
        mockScore = 90 + Math.min(highRiskMatches.length, 10);
        mockDecision = 'HALT';
        mockMode = 'AUDIT';
        mockReason = `检测到多个高风险特征：${highRiskMatches.join('、')}`;
        mockThoughtChain = [
          `关键词识别：${highRiskMatches.join('、')}`,
          '匹配知险库：诱导性任务诈骗 + 非法换汇模式',
          `风险评分：${mockScore}/100`,
          '触发熔断规则：score > 80',
          '决策：立即拦截并人工复核'
        ];
        mockAiResponse = `【审计结论】
检测到严重的高风险诱导性任务特征。

【风险特征】
${highRiskMatches.map((k, i) => `${i + 1}. ${k}：典型的电信诈骗/洗钱风险标志`).join('\n')}

【风险类型】
- 诱导性任务诈骗
- 非法换汇
- 洗钱风险
- 帮信罪风险

【法律风险】
根据《刑法》第287条、《反洗钱法》相关规定，参与此类活动可能构成：
- 帮助信息网络犯罪活动罪
- 洗钱罪
- 非法经营罪

【风险分值】${mockScore}/100
【最终决策】🚨 HALT - 立即拦截，拒绝交易，建议报警`;
        
      } else if (highRiskMatches.length === 1) {
        // 中高风险：单个高风险关键词
        mockScore = 75 + Math.min(medRiskMatches.length * 3, 15);
        mockDecision = 'WARN';
        mockMode = 'AUDIT';
        mockReason = `检测到高风险关键词：${highRiskMatches[0]}`;
        mockThoughtChain = [
          `关键词识别：${highRiskMatches[0]}`,
          '风险等级：中高风险',
          `风险评分：${mockScore}/100`,
          '建议：人工复核'
        ];
        mockAiResponse = `【审计结论】
检测到潜在风险特征。

【风险关键词】${highRiskMatches[0]}

【风险提示】
该关键词通常与以下风险相关：
- 电信诈骗
- 非法金融活动
- 洗钱风险

【建议措施】
1. 要求用户提供更多交易细节
2. 核实交易对手身份
3. 人工复核交易合理性

【风险分值】${mockScore}/100
【最终决策】⚠️ WARN - 警告，需人工复核`;
        
      } else if (medRiskMatches.length >= 2) {
        // 中风险：多个中风险关键词
        mockScore = 50 + medRiskMatches.length * 5;
        mockDecision = 'WARN';
        mockMode = 'AUDIT';
        mockReason = `检测到多个中风险特征：${medRiskMatches.join('、')}`;
        mockThoughtChain = [
          `关键词识别：${medRiskMatches.join('、')}`,
          '风险等级：中等风险',
          `风险评分：${mockScore}/100`,
          '建议：加强监控'
        ];
        mockAiResponse = `【审计结论】
交易存在一定风险特征，建议加强监控。

【风险特征】${medRiskMatches.join('、')}

【建议措施】
1. 加强交易监控
2. 留存完整交易记录
3. 必要时进行人工抽查

【风险分值】${mockScore}/100
【最终决策】⚠️ WARN - 警告，加强监控`;
        
      } else {
        // 低风险：正常交易
        mockScore = 15 + Math.random() * 15;
        mockDecision = 'ALLOW';
        mockMode = 'NORMAL';
        mockReason = '未发现明显风险特征，交易正常';
        mockThoughtChain = [
          '分析用户输入',
          '未发现高风险关键词',
          '未发现异常交易模式',
          `风险评分：${Math.round(mockScore)}/100`,
          '决策：允许交易'
        ];
        mockAiResponse = `【审计结论】
经过合规审计分析，未发现明显风险特征。

【分析结果】
- 无高风险关键词
- 无异常交易模式
- 交易描述正常

【风险分值】${Math.round(mockScore)}/100
【最终决策】✅ ALLOW - 允许交易`;
      }
      
      const result = {
        score: Math.round(mockScore),
        mode: mockMode,
        decision: mockDecision,
        reason: mockReason,
        thought_chain: mockThoughtChain,
        ai_response: mockAiResponse
      };
      
      console.log('✅ 模拟数据生成完成:', JSON.stringify(result, null, 2));
      return NextResponse.json(result);
    }

    // 原有的 Coze API 调用逻辑
    const apiKey = process.env.COZE_API_KEY;
    const botId = process.env.COZE_BOT_ID;

    if (!apiKey || !botId) {
      return NextResponse.json({
        score: null, mode: 'AUDIT', decision: 'WARN',
        reason: '环境变量未配置 (COZE_API_KEY / COZE_BOT_ID)',
        thought_chain: ['配置错误'],
        ai_response: '系统配置错误，请联系管理员'
      }, { status: 500 });
    }

    console.log('📥 收到输入:', input.substring(0, 100));
    console.log('🔄 调用 Coze Bot Chat API');
    console.log('🤖 Bot ID:', botId);
    console.log('🔑 API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT SET');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000); // 增加到 3 分钟

    const res = await fetch(`${COZE_API_BASE}/v3/chat`, {
      method: 'POST',
      headers: getHeaders(),
      signal: controller.signal,
      body: JSON.stringify({
        bot_id: botId,
        user_id: 'node-ai-user',
        additional_messages: [{ 
          role: 'user', 
          content: input, 
          content_type: 'text' 
        }],
        stream: true,
      }),
    });

    clearTimeout(timeoutId);

    console.log('📡 Coze API 响应状态:', res.status);
    console.log('📡 响应头:', Object.fromEntries(res.headers.entries()));

    if (!res.ok) {
      const errText = await res.text();
      console.error('❌ Coze API 请求失败');
      console.error('❌ 状态码:', res.status);
      console.error('❌ 错误信息:', errText);
      
      return NextResponse.json({
        score: null, mode: 'AUDIT', decision: 'WARN',
        reason: `Coze API 请求失败 (${res.status})`,
        thought_chain: [
          'API 请求失败',
          `状态码: ${res.status}`,
          '请检查 COZE_API_KEY 和 COZE_BOT_ID 是否正确'
        ],
        ai_response: `审计服务暂时不可用，请稍后再试。错误: ${res.status}`
      });
    }

    // 读取 SSE 流
    const reader = res.body?.getReader();
    if (!reader) {
      console.error('❌ 无法获取响应流 reader');
      throw new Error('无法读取响应流');
    }

    console.log('📖 开始读取 SSE 流...');
    const decoder = new TextDecoder();
    let fullAnswer = '';
    let buffer = '';
    let currentEvent = '';
    let messageCount = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('✅ SSE 流读取完成');
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

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
              
              if (messageCount <= 3) {
                console.log(`📡 SSE 消息 #${messageCount}:`, JSON.stringify(evt).substring(0, 200));
              }

              const evtType: string = currentEvent || evt.event || '';
              const msgData = evt.message ?? evt.data ?? evt;
              const role: string = msgData.role ?? '';
              const type: string = msgData.type ?? '';
              const content: string = msgData.content ?? '';

              if (role === 'assistant' && type === 'answer' && content) {
                if (evtType === 'conversation.message.delta') {
                  fullAnswer += content;
                  if (fullAnswer.length % 100 === 0) {
                    console.log(`📝 累计收集 ${fullAnswer.length} 字符...`);
                  }
                } else if (evtType === 'conversation.message.completed') {
                  fullAnswer = content;
                  console.log('✅ 收到 completed 事件，answer 长度:', fullAnswer.length);
                } else if (!evtType) {
                  fullAnswer += content;
                }
              }
            } catch (parseError) {
              console.warn('⚠️ JSON 解析失败:', jsonStr.substring(0, 100));
            }
          }
        }
      }
    } catch (streamError) {
      console.error('❌ SSE 流读取错误:', streamError);
      throw streamError;
    }

    console.log('💬 流式收集完成');
    console.log('💬 总消息数:', messageCount);
    console.log('💬 Answer 长度:', fullAnswer.length);
    console.log('💬 Answer 前 300 字:', fullAnswer.substring(0, 300));

    if (!fullAnswer || fullAnswer.length === 0) {
      console.error('❌ SSE 流响应为空');
      console.error('❌ 可能的原因:');
      console.error('   1. COZE_BOT_ID 配置错误');
      console.error('   2. Bot 没有返回内容');
      console.error('   3. Bot 配置问题');
      
      return NextResponse.json({
        score: null, 
        mode: 'AUDIT', 
        decision: 'WARN',
        reason: '未获取到 AI 回复内容',
        thought_chain: [
          'SSE 流响应为空',
          `收到 ${messageCount} 条消息，但无有效内容`,
          '请确认 COZE_BOT_ID 配置正确',
          '请检查 Coze Bot 是否正常工作'
        ],
        ai_response: '审计完成，但未获取到回复内容。请检查 Coze Bot 配置。'
      });
    }

    const result = parseRiskFromAnswer(fullAnswer);
    console.log('✅ 最终结果:', JSON.stringify(result, null, 2));
    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ API处理异常:', error);
    const msg = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json({
      score: null, mode: 'AUDIT', decision: 'WARN',
      reason: `服务异常: ${msg}`,
      thought_chain: ['系统异常', msg],
      ai_response: '审计服务异常，请稍后再试'
    });
  }
}
