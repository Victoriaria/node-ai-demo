# NODE AI 故障排查指南

## 当前问题：服务异常 + AI回复不显示

### 问题现象
1. 风险评分显示"服务异常"
2. AI对话区没有显示回复
3. 后端日志显示API正常返回数据

### 根本原因

#### 问题1：Coze Bot 配置不正确
**现象**：Bot 返回普通问候语而不是审计结果
```
"你好，我是Node AI首席合规审计官..."
```

**原因**：Coze Bot 的 Workflow 或 Prompt 配置有问题，导致它只是在做普通对话

**解决方案**：
1. 登录 Coze 平台：https://www.coze.cn
2. 找到 Bot ID: `7621043639807967270`
3. 检查 Bot 的 Prompt 设置，确保包含：
   - 明确的审计任务说明
   - 要求返回结构化 JSON 格式
   - 包含 score、decision、reason、thought_chain 字段
4. 示例 Prompt：
```
你是NODE AI合规审计专家。对用户输入的交易描述进行风险评估。

必须返回以下JSON格式：
{
  "score": 0-100的风险评分,
  "decision": "ALLOW/WARN/HALT",
  "reason": "风险原因说明",
  "thought_chain": ["分析步骤1", "分析步骤2", ...]
}

高风险关键词：洗钱、诈骗、换汇、拆单、代收款、黑钱等
中风险关键词：跨境、大额、频繁、异常等
```

#### 问题2：前端状态更新问题
**现象**：后端返回数据但前端不显示

**临时解决方案**：添加调试日志

### 快速修复步骤

#### 步骤1：检查环境变量
```bash
# 确认 .env.local 中的配置
COZE_API_KEY=pat_IS7gZeBKFHEETYYT5bqPkxSHHUti7PnZPcUu47wjlPxuF69YxNZkrV4HrUTN6gBR
COZE_BOT_ID=7621043639807967270
```

#### 步骤2：测试 Coze Bot
1. 在 Coze 平台直接测试 Bot
2. 输入测试消息："我想做JD换汇任务，每天转账1万美元"
3. 检查 Bot 是否返回正确的 JSON 格式

#### 步骤3：前端调试
打开浏览器控制台，查看：
- 是否有 "🎯 API调用成功，结果:" 日志
- 是否有 "✅ AI回复已添加到消息列表" 日志
- messages 数组是否包含新消息

#### 步骤4：后端调试
查看终端日志：
- 是否有 "✅ 最终结果:" 日志
- score 是否为 null
- ai_response 是否有内容

### 常见问题

#### Q1: 为什么后端返回 score: 73 但前端显示"服务异常"？
A: 这是因为后端通过关键词推断出的分数，但前端可能没有正确接收或更新状态。

#### Q2: 为什么 Coze Bot 只返回问候语？
A: Bot 的 Prompt 配置不正确，需要在 Coze 平台重新配置 Bot 的系统提示词。

#### Q3: 如何确认前端收到了后端数据？
A: 打开浏览器控制台，查找 "🎯 API调用成功" 日志，检查返回的数据结构。

### 紧急降级方案

如果 Coze Bot 无法快速修复，可以使用模拟数据：

1. 修改 `src/app/api/audit/route.ts`
2. 在文件开头添加：
```typescript
const USE_MOCK_DATA = true; // 临时开关

if (USE_MOCK_DATA) {
  return NextResponse.json({
    score: 85,
    mode: 'AUDIT',
    decision: 'HALT',
    reason: '检测到高风险关键词：换汇、拆单',
    thought_chain: [
      '提取关键词：JD、换汇、拆单',
      '匹配知识库：诱导性任务诈骗',
      '计算风险评分：85/100',
      '触发熔断规则'
    ],
    ai_response: '【审计结论】检测到高风险诱导性任务，建议立即拦截。'
  });
}
```

### 下一步行动

1. ✅ 检查 Coze Bot 配置（最重要）
2. ✅ 添加前端调试日志
3. ✅ 测试消息状态更新
4. ✅ 如果问题持续，使用模拟数据降级

### 联系支持

如果问题无法解决：
1. 检查 Coze API 文档：https://www.coze.cn/docs
2. 查看项目 bug 记录：`.kiro/skills/node-ai-bugfix.md`
3. 检查网络连接和 VPN 状态
