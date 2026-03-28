# 🔧 Coze SSE 流式响应修复指南

## 问题诊断

### 核心问题
**SSE 流响应为空** - Coze Bot 没有返回有效内容，导致：
- 思考链（Thought Chain）无法显示
- 风险评分（Risk Score）显示"待审计"
- AI 回复为空

### 根本原因
1. **COZE_BOT_ID 配置错误** - 最常见原因
2. **Coze Bot 未正确配置** - Bot 没有返回内容
3. **SSE 流处理问题** - Next.js/Vercel 缓冲问题

---

## 修复方案

### 1. 验证 Coze 配置 ✅ 最重要

#### 检查环境变量

**本地开发** (`.env.local`):
```env
COZE_API_KEY=pat_IS7gZeBKFHEETYYT5bqPkxSHHUti7PnZPcUu47wjlPxuF69YxNZkrV4HrUTN6gBR
COZE_BOT_ID=7621043639807967270
USE_MOCK_DATA=false  # ← 改为 false 使用真实 API
```

**Vercel 生产环境**:
1. 访问 Vercel 项目设置
2. 进入 **Settings** → **Environment Variables**
3. 添加/更新以下变量（所有环境：Production, Preview, Development）:
   - `COZE_API_KEY` = `pat_IS7gZeBKFHEETYYT5bqPkxSHHUti7PnZPcUu47wjlPxuF69YxNZkrV4HrUTN6gBR`
   - `COZE_BOT_ID` = `7621043639807967270`
   - `USE_MOCK_DATA` = `false`

#### 验证 Bot ID

1. 登录 [Coze 平台](https://www.coze.cn/)
2. 进入你的 Bot
3. 查看 Bot ID（通常在 URL 或设置中）
4. 确认 Bot ID 与环境变量中的一致

#### 测试 Coze API

使用以下命令测试 Coze API 是否正常：

```bash
curl -X POST https://api.coze.cn/v3/chat \
  -H "Authorization: Bearer pat_IS7gZeBKFHEETYYT5bqPkxSHHUti7PnZPcUu47wjlPxuF69YxNZkrV4HrUTN6gBR" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "bot_id": "7621043639807967270",
    "user_id": "test-user",
    "additional_messages": [{
      "role": "user",
      "content": "测试消息",
      "content_type": "text"
    }],
    "stream": true
  }'
```

**预期结果**:
- 返回 SSE 流式数据
- 包含 `event:` 和 `data:` 行
- 最终有 `[DONE]` 标记

---

### 2. 代码优化 ✅ 已完成

#### 已修复的问题

1. **添加 `export const dynamic = 'force-dynamic'`**
   - 防止 Vercel 缓存 API 响应
   - 确保每次请求都是动态的

2. **增强日志输出**
   - 详细记录 SSE 流读取过程
   - 显示消息数量和内容长度
   - 便于调试问题

3. **改进错误处理**
   - 更详细的错误信息
   - 明确指出可能的原因
   - 提供修复建议

4. **增加超时时间**
   - 从 120 秒增加到 180 秒
   - 适应 Coze API 的响应时间

5. **添加 Accept 头**
   - `Accept: text/event-stream`
   - 明确告诉服务器期望 SSE 响应

---

### 3. 切换到真实 API

#### 本地开发

修改 `.env.local`:
```env
USE_MOCK_DATA=false
```

重启开发服务器:
```bash
npm run dev
```

#### Vercel 生产环境

1. 在 Vercel 项目设置中修改环境变量:
   - `USE_MOCK_DATA` = `false`

2. 重新部署:
```bash
git add .
git commit -m "chore: 切换到真实 Coze API"
git push origin main
```

或手动触发部署:
```bash
vercel --prod
```

---

## 测试验证

### 本地测试

1. **启动开发服务器**:
```bash
npm run dev
```

2. **测试 API 端点**:
```bash
# PowerShell
Invoke-WebRequest -Uri "http://localhost:3000/api/audit" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"input":"测试JD换汇任务"}' | 
  Select-Object -ExpandProperty Content
```

3. **检查日志输出**:
查看控制台，应该看到：
```
📥 收到输入: 测试JD换汇任务
🔄 调用 Coze Bot Chat API
🤖 Bot ID: 7621043639807967270
🔑 API Key: pat_IS7gZe...
📡 Coze API 响应状态: 200
📖 开始读取 SSE 流...
📌 事件类型: conversation.message.delta
📡 SSE 消息 #1: {...}
📝 累计收集 100 字符...
✅ SSE 流读取完成
💬 流式收集完成
💬 总消息数: 15
💬 Answer 长度: 450
💬 Answer 前 300 字: 【审计结论】...
✅ 最终结果: {...}
```

### 前端测试

1. 访问 http://localhost:3000
2. 输入测试消息："JD换汇任务"
3. 点击发送
4. 观察：
   - ✅ 风险评分应该显示数字（如 94）
   - ✅ 思考链应该显示多个步骤
   - ✅ AI 回复应该显示完整内容
   - ✅ 实时日志应该显示处理过程

---

## 常见问题

### Q1: 仍然显示"SSE 流响应为空"

**可能原因**:
1. COZE_BOT_ID 错误
2. Coze Bot 没有配置知识库或回复逻辑
3. API Key 权限不足

**解决方案**:
1. 重新检查 Bot ID
2. 在 Coze 平台测试 Bot 是否能正常回复
3. 确认 API Key 有访问该 Bot 的权限

### Q2: Vercel 部署后不工作

**可能原因**:
1. 环境变量未配置
2. 环境变量未应用到所有环境
3. 需要重新部署

**解决方案**:
1. 检查 Vercel 项目设置中的环境变量
2. 确保变量应用到 Production 环境
3. 手动触发重新部署

### Q3: 本地工作但 Vercel 不工作

**可能原因**:
1. Vercel 的 Serverless 函数超时（默认 10 秒）
2. 环境变量配置不同

**解决方案**:
1. 在 `vercel.json` 中增加超时时间:
```json
{
  "functions": {
    "src/app/api/audit/route.ts": {
      "maxDuration": 60
    }
  }
}
```

2. 确认 Vercel 环境变量与本地一致

### Q4: 响应太慢

**可能原因**:
1. Coze API 响应慢
2. Bot 处理复杂

**解决方案**:
1. 优化 Bot 的 Prompt
2. 减少 Bot 的知识库大小
3. 考虑使用缓存

---

## 调试技巧

### 1. 查看详细日志

在 API 路由中已添加详细日志，查看：
- Bot ID 和 API Key（部分）
- API 响应状态
- SSE 消息数量
- Answer 长度

### 2. 使用 Coze 平台测试

在 Coze 平台直接测试 Bot：
1. 进入 Bot 编辑页面
2. 使用测试功能
3. 输入相同的测试消息
4. 查看 Bot 是否正常回复

### 3. 检查网络请求

使用浏览器开发者工具：
1. 打开 Network 标签
2. 发送测试请求
3. 查看 `/api/audit` 请求
4. 检查响应内容和状态码

---

## 性能优化建议

### 1. 添加响应缓存

对于相同的输入，可以缓存结果：

```typescript
// 简单的内存缓存
const cache = new Map<string, any>();

export async function POST(request: NextRequest) {
  const { input } = await request.json();
  
  // 检查缓存
  const cacheKey = `audit:${input}`;
  if (cache.has(cacheKey)) {
    console.log('✅ 使用缓存结果');
    return NextResponse.json(cache.get(cacheKey));
  }
  
  // ... 调用 API
  
  // 存入缓存（5 分钟过期）
  cache.set(cacheKey, result);
  setTimeout(() => cache.delete(cacheKey), 5 * 60 * 1000);
  
  return NextResponse.json(result);
}
```

### 2. 使用 Redis 缓存

对于生产环境，使用 Redis：

```typescript
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
});

// 缓存 5 分钟
await redis.setex(cacheKey, 300, JSON.stringify(result));
```

### 3. 实现请求队列

避免并发请求过多：

```typescript
import PQueue from 'p-queue';

const queue = new PQueue({ concurrency: 5 });

export async function POST(request: NextRequest) {
  return queue.add(async () => {
    // ... API 调用逻辑
  });
}
```

---

## 监控和告警

### 1. 添加错误追踪

使用 Sentry 或类似服务：

```typescript
import * as Sentry from '@sentry/nextjs';

try {
  // ... API 调用
} catch (error) {
  Sentry.captureException(error);
  throw error;
}
```

### 2. 添加性能监控

记录 API 响应时间：

```typescript
const startTime = Date.now();
// ... API 调用
const duration = Date.now() - startTime;
console.log(`⏱️ API 调用耗时: ${duration}ms`);
```

---

## 总结

### 修复清单

- [x] 添加 `export const dynamic = 'force-dynamic'`
- [x] 增强 SSE 流读取日志
- [x] 改进错误处理和提示
- [x] 增加 API 超时时间
- [x] 添加 Accept 头
- [ ] 验证 COZE_BOT_ID 配置
- [ ] 切换 USE_MOCK_DATA=false
- [ ] 测试真实 API 调用
- [ ] 部署到 Vercel
- [ ] 验证生产环境

### 下一步

1. **立即操作**: 修改 `.env.local` 中的 `USE_MOCK_DATA=false`
2. **测试**: 在本地测试真实 API 调用
3. **部署**: 推送到 GitHub，触发 Vercel 部署
4. **验证**: 在生产环境测试功能

---

**修复完成时间**: 2026-03-28  
**修复状态**: ✅ 代码已优化，等待配置验证
