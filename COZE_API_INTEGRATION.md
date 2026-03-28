# Coze API 集成指南

## ✅ 当前状态

**模拟数据模式**: 已完全调通 ✅
- 所有测试通过（4/4）
- 响应时间：<200ms
- 功能完整：风险评分、决策、思考链、AI回复

---

## 🔄 两种运行模式

### 模式1：模拟数据模式（当前）

**环境变量**：
```bash
USE_MOCK_DATA=true
```

**特点**：
- ✅ 响应速度快（<200ms）
- ✅ 100% 可靠
- ✅ 智能关键词检测
- ✅ 完整的审计报告
- ✅ 适合演示和开发

**工作原理**：
1. 检测输入中的高风险关键词（换汇、JD、拆单、洗钱等）
2. 检测中风险关键词（跨境、大额、转账等）
3. 根据关键词数量计算风险评分
4. 生成完整的审计报告

### 模式2：真实 Coze API 模式

**环境变量**：
```bash
USE_MOCK_DATA=false
COZE_API_KEY=your_api_key
COZE_BOT_ID=your_bot_id
```

**特点**：
- ✅ 真实的 AI 分析
- ✅ 可以持续学习
- ⚠️ 响应较慢（15-30秒）
- ⚠️ 需要正确配置 Bot

---

## 🔧 如何切换到真实 Coze API

### 步骤1：配置 Coze Bot

1. **登录 Coze 平台**：
   https://www.coze.cn

2. **找到你的 Bot**：
   Bot ID: `7621043639807967270`

3. **配置 System Prompt**（重要！）：

```
你是 NODE AI 跨境支付合规审计专家，专门负责分析交易风险。

【核心任务】
对用户输入的交易描述进行风险评估，识别洗钱、诈骗、非法换汇等风险。

【分析步骤】
1. 提取关键信息：金额、地区、支付方式、关键词
2. 匹配风险特征：
   - 高风险：洗钱、帮信罪、非法经营、换汇、拆单、代收款、黑钱、诈骗
   - 中风险：跨境、大额、频繁、异常、可疑
   - 低风险：正常商业交易
3. 计算风险评分（0-100）
4. 给出决策建议

【输出格式】
必须严格按照以下格式输出：

【审计结论】
[简要说明风险情况]

【风险特征】
[列出检测到的风险特征]

【风险类型】
[风险类型分类]

【法律风险】（如果是高风险）
[相关法律条款]

【风险分值】[分数]/100
【最终决策】[ALLOW/WARN/HALT] - [决策说明]

【评分标准】
- 0-49分：低风险，decision: ALLOW
- 50-79分：中风险，decision: WARN
- 80-100分：高风险，decision: HALT

【示例】
输入："我想做JD换汇任务，每天转账1万美元到缅甸"
输出：
【审计结论】
检测到严重的高风险诱导性任务特征。

【风险特征】
1. JD换汇：典型的诱导性任务诈骗
2. 缅甸：高风险国家
3. 每天1万美元：频繁大额转账

【风险类型】
- 诱导性任务诈骗
- 非法换汇
- 洗钱风险

【法律风险】
根据《刑法》第287条、《反洗钱法》相关规定，参与此类活动可能构成帮助信息网络犯罪活动罪、洗钱罪。

【风险分值】95/100
【最终决策】HALT - 立即拦截，拒绝交易

现在开始分析用户输入。
```

4. **保存配置**

### 步骤2：修改环境变量

**本地开发**（`.env.local`）：
```bash
USE_MOCK_DATA=false
COZE_API_KEY=pat_IS7gZeBKFHEETYYT5bqPkxSHHUti7PnZPcUu47wjlPxuF69YxNZkrV4HrUTN6gBR
COZE_BOT_ID=7621043639807967270
```

**Vercel 生产环境**：
1. 访问：https://vercel.com/gaomin13617777132-5709s-projects/node-ai/settings/environment-variables
2. 修改 `USE_MOCK_DATA` 为 `false`
3. 点击 "Redeploy"

### 步骤3：重启服务

**本地**：
```bash
# 停止当前服务（Ctrl+C）
npm run dev
```

**Vercel**：
- 自动重新部署

### 步骤4：测试

```bash
node test-full-flow.js
```

---

## 📊 性能对比

| 指标 | 模拟数据模式 | Coze API 模式 |
|------|-------------|--------------|
| 响应时间 | <200ms | 15-30秒 |
| 准确性 | 基于关键词 | AI 智能分析 |
| 可靠性 | 100% | 依赖网络 |
| 成本 | 免费 | API 调用费用 |
| 学习能力 | 无 | 可持续优化 |

---

## 🧪 测试 Coze API

### 测试脚本

创建 `test-coze-api.js`：

```javascript
async function testCozeAPI() {
  const testInput = "我想做JD换汇任务";
  
  console.log('🧪 测试 Coze API');
  console.log('📥 输入:', testInput);
  
  const response = await fetch('http://localhost:3000/api/audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: testInput })
  });
  
  const data = await response.json();
  
  console.log('✅ 响应:', JSON.stringify(data, null, 2));
}

testCozeAPI();
```

运行：
```bash
node test-coze-api.js
```

---

## 🔍 调试 Coze API

### 查看后端日志

开发服务器会输出详细日志：

```
📥 收到输入: 我想做JD换汇任务
🔄 调用 Bot Chat API, Bot ID: 7621043639807967270
📡 SSE RAW: {"message":{"role":"assistant","type":"answer","content":"..."}}
💬 流式收集完成，answer长度: 500
💬 AI回复前300字: 【审计结论】...
✅ 最终结果: {"score":95,"decision":"HALT",...}
```

### 常见问题

#### 问题1：返回空内容
**原因**：Bot 没有返回 answer 类型的消息  
**解决**：检查 Bot 配置，确保有正确的回复

#### 问题2：解析失败
**原因**：Bot 返回的格式不符合预期  
**解决**：调整 Bot 的 System Prompt，要求严格按照格式输出

#### 问题3：超时
**原因**：Coze API 响应时间过长（>120秒）  
**解决**：优化 Bot 配置，或增加超时时间

---

## 📝 代码说明

### API 路由结构

```typescript
// src/app/api/audit/route.ts

export async function POST(request: NextRequest) {
  // 1. 获取输入
  const { input } = await request.json();
  
  // 2. 判断模式
  if (USE_MOCK_DATA) {
    // 模拟数据模式
    return mockDataResponse(input);
  }
  
  // 3. 调用 Coze API
  const response = await fetch(`${COZE_API_BASE}/v3/chat`, {
    method: 'POST',
    headers: getHeaders(),
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
  
  // 4. 解析 SSE 流
  const fullAnswer = await parseSSEStream(response);
  
  // 5. 提取风险评分
  const result = parseRiskFromAnswer(fullAnswer);
  
  return NextResponse.json(result);
}
```

### 数据流

```
用户输入
  ↓
前端 (page.tsx)
  ↓
useAuditAPI.call()
  ↓
/api/audit (route.ts)
  ↓
[模拟数据] 或 [Coze API]
  ↓
parseRiskFromAnswer()
  ↓
返回结果
  ↓
useAuditState.updateAssessment()
  ↓
RiskDashboard 显示
```

---

## ✅ 验证清单

切换到 Coze API 后，验证以下功能：

- [ ] 低风险输入返回 ALLOW
- [ ] 中风险输入返回 WARN
- [ ] 高风险输入返回 HALT
- [ ] 风险评分在 0-100 范围内
- [ ] 思考链正确显示
- [ ] AI 回复完整显示
- [ ] 响应时间可接受（<60秒）

---

## 🎯 推荐配置

### 开发环境
```bash
USE_MOCK_DATA=true  # 快速开发和测试
```

### 演示环境
```bash
USE_MOCK_DATA=true  # 稳定可靠的演示
```

### 生产环境
```bash
USE_MOCK_DATA=false  # 真实 AI 分析
COZE_API_KEY=your_real_key
COZE_BOT_ID=your_bot_id
```

---

## 📞 需要帮助？

- **Coze 文档**: https://www.coze.cn/docs
- **项目文档**: 查看 `README.md`
- **测试脚本**: `test-full-flow.js`

---

**总结**：当前模拟数据模式已完全调通，所有功能正常。如需切换到真实 Coze API，按照上述步骤配置即可。
