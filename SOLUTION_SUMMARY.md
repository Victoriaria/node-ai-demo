# NODE AI 服务异常问题 - 解决方案总结

## 问题现象
1. 风险评分显示"服务异常"
2. AI 回复不显示在聊天区
3. 后端日志显示 API 正常返回数据

## 根本原因

### 核心问题：Coze Bot 配置错误

**发现**：从后端日志可以看到，Coze Bot 返回的是：
```
"你好，我是Node AI首席合规审计官/首席数字风控专家，拥有30年全球FinTech领域风控经验..."
```

这是一个**普通问候语**，而不是风险审计结果。

**原因分析**：
1. Coze Bot 的 System Prompt（系统提示词）配置不正确
2. Bot 没有被正确指示要进行风险审计分析
3. Bot 没有被要求返回结构化的 JSON 格式

**影响**：
- 后端虽然收到了回复，但内容不是审计结果
- 后端通过关键词推断出 score: 73（因为回复中包含"风险"、"合规"等词）
- 但这个推断出的分数不准确，且没有真正的审计逻辑

### 次要问题：前端状态可能未正确更新

虽然后端返回了数据，但前端可能存在状态更新问题。

## 解决方案

### 方案1：修复 Coze Bot 配置（推荐）

#### 步骤1：登录 Coze 平台
1. 访问：https://www.coze.cn
2. 使用你的账号登录

#### 步骤2：找到并编辑 Bot
1. 找到 Bot ID: `7621043639807967270`
2. 进入 Bot 编辑页面

#### 步骤3：配置 System Prompt
将 Bot 的系统提示词修改为：

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
必须严格按照以下 JSON 格式输出（不要用 markdown 代码块包裹）：

{
  "score": 85,
  "decision": "HALT",
  "reason": "检测到高风险关键词：换汇、拆单、代收款",
  "thought_chain": [
    "提取关键词：JD、换汇、拆单",
    "匹配知识库：诱导性任务诈骗模式",
    "计算风险评分：85/100",
    "触发熔断规则：score > 80"
  ]
}

【评分标准】
- 0-49分：低风险，decision: "ALLOW"
- 50-79分：中风险，decision: "WARN"
- 80-100分：高风险，decision: "HALT"

【示例】
输入："我想做JD换汇任务，每天转账1万美元到缅甸"
输出：
{
  "score": 95,
  "decision": "HALT",
  "reason": "检测到多个高风险特征：非法换汇、高风险地区、大额频繁转账",
  "thought_chain": [
    "关键词识别：JD换汇（诱导性任务）",
    "地区风险：缅甸（高风险国家）",
    "金额异常：每天1万美元（频繁大额）",
    "综合评分：95/100",
    "决策：立即拦截"
  ]
}

现在开始分析用户输入。
```

#### 步骤4：测试 Bot
在 Coze 平台直接测试：
- 输入："我想做JD换汇任务"
- 检查是否返回正确的 JSON 格式
- 确认 score、decision、reason、thought_chain 字段都存在

#### 步骤5：保存并重启服务
1. 保存 Bot 配置
2. 重启 Next.js 开发服务器（Ctrl+C 然后 `npm run dev`）
3. 刷新浏览器测试

### 方案2：使用模拟数据（临时方案）

如果 Coze Bot 配置需要时间，可以先使用模拟数据：

#### 步骤1：修改后端 API
编辑 `src/app/api/audit/route.ts`，在文件开头添加：

```typescript
// 临时开关：使用模拟数据
const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true';
```

在 `POST` 函数开头添加：

```typescript
export async function POST(request: NextRequest) {
  try {
    const { input } = await request.json();

    if (!input || typeof input !== 'string') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // 临时模拟数据
    if (USE_MOCK_DATA) {
      console.log('⚠️ 使用模拟数据模式');
      
      // 简单的关键词检测
      const highRiskKeywords = ['换汇', 'JD', '拆单', '代收款', '洗钱', '诈骗'];
      const hasHighRisk = highRiskKeywords.some(k => input.includes(k));
      
      const mockScore = hasHighRisk ? 85 : 20;
      const mockDecision = hasHighRisk ? 'HALT' : 'ALLOW';
      
      return NextResponse.json({
        score: mockScore,
        mode: hasHighRisk ? 'AUDIT' : 'NORMAL',
        decision: mockDecision,
        reason: hasHighRisk 
          ? '检测到高风险关键词：换汇、拆单、代收款'
          : '未发现明显风险特征',
        thought_chain: hasHighRisk ? [
          '提取关键词：JD、换汇、拆单',
          '匹配知识库：诱导性任务诈骗模式',
          `计算风险评分：${mockScore}/100`,
          '触发熔断规则：score > 80'
        ] : [
          '分析用户输入',
          '未发现高风险特征',
          '评估为低风险交易'
        ],
        ai_response: hasHighRisk 
          ? `【审计结论】检测到高风险诱导性任务特征。\n\n【风险分值】${mockScore}/100\n【最终决策】${mockDecision} - 拒绝交易`
          : `【审计结论】未发现明显风险特征。\n\n【风险分值】${mockScore}/100\n【最终决策】${mockDecision} - 允许交易`
      });
    }

    // 原有的 Coze API 调用代码...
```

#### 步骤2：启用模拟模式
在 `.env.local` 添加：
```
USE_MOCK_DATA=true
```

#### 步骤3：重启服务测试
```bash
# 停止服务（Ctrl+C）
# 重新启动
npm run dev
```

### 方案3：前端调试增强

已添加详细的调试日志，打开浏览器控制台查看：
- 🎯 API调用成功
- 📊 风险评分
- 🎭 决策
- 💬 AI回复长度
- ✅ 状态已更新
- 📝 准备添加AI回复
- ✅ AI回复已添加到消息列表
- 📋 当前消息总数

## 验证步骤

### 1. 测试低风险输入
输入："你好"
期望结果：
- 风险评分：20分左右
- 决策：ALLOW（绿色）
- AI回复显示在聊天区

### 2. 测试高风险输入
输入："我想做JD换汇任务，每天转账1万美元"
期望结果：
- 风险评分：85分以上
- 决策：HALT（红色）
- 触发熔断弹窗
- AI回复显示在聊天区

### 3. 检查思考链
应该显示：
- 提取关键词
- 匹配知识库
- 计算风险评分
- 决策结果

### 4. 检查实时日志
应该显示：
- [INFO] 开始分析
- [WARNING] 进入审计模式（如果是高风险）
- [ERROR] 触发熔断（如果是高风险）
- [SUCCESS] 审计完成

## 预期效果

修复后的系统应该：
1. ✅ 正确显示风险评分（数字，不是"服务异常"）
2. ✅ AI回复显示在聊天区
3. ✅ 思考链显示分析步骤
4. ✅ 高风险时触发红色熔断动画
5. ✅ 实时日志记录完整流程

## 后续优化

1. 完善 Coze Bot 的知识库
2. 添加更多风险规则
3. 优化响应时间（目前16秒）
4. 添加更多测试用例
5. 完善错误处理机制

## 需要帮助？

如果问题仍然存在，请提供：
1. 浏览器控制台截图（F12 → Console）
2. Network 请求截图（F12 → Network → /api/audit）
3. 终端日志截图
4. Coze Bot 配置截图

## 文件清单

相关文档：
- `TROUBLESHOOTING.md` - 详细故障排查指南
- `DEBUG_CHECKLIST.md` - 调试检查清单
- `SOLUTION_SUMMARY.md` - 本文件
- `.kiro/skills/node-ai-bugfix.md` - Bug 修复记录
- `PRD.md` - 产品需求文档
