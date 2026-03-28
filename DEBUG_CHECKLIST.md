# NODE AI 调试检查清单

## 当前状态分析

### ✅ 正常工作的部分
1. Next.js 开发服务器运行正常（端口 3000）
2. 后端 API `/api/audit` 正常响应（200 状态码）
3. Coze API 连接成功（16秒响应时间）
4. 日志系统正常工作
5. 前端界面正常渲染

### ❌ 存在问题的部分
1. 风险评分显示"服务异常"（riskScore 为 null）
2. AI 回复不显示在聊天区
3. Coze Bot 返回普通问候而非审计结果

## 问题诊断步骤

### 第1步：检查浏览器控制台
打开浏览器开发者工具（F12），在 Console 标签查找：

```
期望看到的日志：
✅ 🎯 API调用成功，结果: {...}
✅ 📊 风险评分: 73
✅ 🎭 决策: WARN
✅ 💬 AI回复长度: 162
✅ ✅ 状态已更新
✅ 📝 准备添加AI回复: ...
✅ ✅ AI回复已添加到消息列表, ID: ...
✅ 📋 当前消息总数: 2
```

如果看不到这些日志，说明前端没有收到后端数据。

### 第2步：检查网络请求
在浏览器开发者工具的 Network 标签：

1. 找到 `/api/audit` 请求
2. 查看 Response 标签，应该看到：
```json
{
  "score": 73,
  "mode": "AUDIT",
  "decision": "WARN",
  "reason": "...",
  "thought_chain": [...],
  "ai_response": "你好，我是Node AI..."
}
```

3. 如果 Response 是空的或有错误，说明后端有问题
4. 如果 Response 正常但前端不显示，说明前端状态管理有问题

### 第3步：检查 React 状态
在浏览器控制台输入：

```javascript
// 检查消息状态（需要安装 React DevTools）
// 或者在代码中添加 console.log

// 临时调试：在 ChatPanel 组件中添加
console.log('ChatPanel messages:', messages)
console.log('ChatPanel messages length:', messages.length)
```

### 第4步：检查 Coze Bot 配置

**问题根源**：Coze Bot 返回的是问候语，不是审计结果

**验证方法**：
1. 访问 https://www.coze.cn
2. 登录并找到 Bot ID: `7621043639807967270`
3. 查看 Bot 的系统提示词（System Prompt）
4. 测试 Bot 是否能返回正确的 JSON 格式

**正确的 Bot 配置应该包含**：
- 明确的审计任务说明
- 要求返回 JSON 格式
- 包含 score、decision、reason、thought_chain 字段

### 第5步：临时解决方案

如果 Coze Bot 配置需要时间修复，可以使用以下临时方案：

#### 方案A：使用模拟数据
在 `src/app/api/audit/route.ts` 开头添加：

```typescript
// 临时开关：使用模拟数据
const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true';

export async function POST(request: NextRequest) {
  try {
    const { input } = await request.json();

    // 临时模拟数据
    if (USE_MOCK_DATA) {
      console.log('⚠️ 使用模拟数据模式');
      return NextResponse.json({
        score: 85,
        mode: 'AUDIT',
        decision: 'HALT',
        reason: '检测到高风险关键词：换汇、拆单、代收款',
        thought_chain: [
          '提取关键词：JD、换汇、拆单',
          '匹配知识库：诱导性任务诈骗模式',
          '计算风险评分：85/100',
          '触发熔断规则：score > 80'
        ],
        ai_response: `【审计结论】
检测到高风险诱导性任务特征：
1. 关键词匹配：JD换汇、拆单操作
2. 风险类型：电信诈骗、洗钱风险
3. 建议：立即拦截并人工复核

【风险分值】85/100
【最终决策】HALT - 拒绝交易`
      });
    }

    // 原有代码...
```

然后在 `.env.local` 添加：
```
USE_MOCK_DATA=true
```

#### 方案B：修复前端状态更新
如果后端数据正常但前端不显示，检查：

1. `useAuditState` 的 `updateAssessment` 是否正确更新状态
2. `useMessages` 的 `addMessage` 是否正确添加消息
3. 组件是否正确接收和渲染新状态

## 快速测试命令

### 测试后端 API
```bash
curl -X POST http://localhost:3000/api/audit \
  -H "Content-Type: application/json" \
  -d '{"input":"我想做JD换汇任务"}'
```

期望输出：
```json
{
  "score": 85,
  "mode": "AUDIT",
  "decision": "HALT",
  "reason": "...",
  "thought_chain": [...],
  "ai_response": "..."
}
```

### 检查环境变量
```bash
# Windows PowerShell
Get-Content .env.local

# 应该看到：
# COZE_API_KEY=pat_...
# COZE_BOT_ID=7621043639807967270
```

## 预期结果

修复后应该看到：
1. ✅ 风险评分显示具体数字（如 85）
2. ✅ 决策显示对应颜色（红色=高风险，黄色=中风险，绿色=低风险）
3. ✅ 思考链显示分析步骤
4. ✅ AI 回复显示在聊天区
5. ✅ 实时日志显示审计过程

## 下一步

1. 按照上述步骤逐一检查
2. 记录每一步的结果
3. 如果问题持续，提供：
   - 浏览器控制台截图
   - Network 请求截图
   - 终端日志截图
