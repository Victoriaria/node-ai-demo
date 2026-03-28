# NODE AI - Vercel 部署指南

## 📋 部署前准备

### 1. 确保代码已提交到 Git

```bash
# 查看当前状态
git status

# 添加所有文件
git add .

# 提交
git commit -m "准备部署到 Vercel"

# 推送到远程仓库（GitHub/GitLab/Bitbucket）
git push origin main
```

### 2. 准备环境变量

需要在 Vercel 配置以下环境变量：

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `COZE_API_KEY` | Coze API 密钥 | `pat_IS7gZe...` |
| `COZE_BOT_ID` | Coze Bot ID | `7621043639807967270` |
| `USE_MOCK_DATA` | 是否使用模拟数据 | `true` 或 `false` |

**重要提示**：
- 如果 Coze Bot 还未配置好，建议设置 `USE_MOCK_DATA=true`
- 这样部署后可以立即使用模拟数据进行演示

---

## 🚀 部署步骤

### 方法1：通过 Vercel 网站部署（推荐）

#### 步骤1：登录 Vercel
1. 访问 https://vercel.com
2. 使用 GitHub/GitLab/Bitbucket 账号登录

#### 步骤2：导入项目
1. 点击 "Add New..." → "Project"
2. 选择你的 Git 仓库
3. 点击 "Import"

#### 步骤3：配置项目
1. **Framework Preset**: 自动检测为 Next.js
2. **Root Directory**: 保持默认（./）
3. **Build Command**: `npm run build`（自动填充）
4. **Output Directory**: `.next`（自动填充）

#### 步骤4：配置环境变量
点击 "Environment Variables"，添加：

```
COZE_API_KEY = pat_IS7gZeBKFHEETYYT5bqPkxSHHUti7PnZPcUu47wjlPxuF69YxNZkrV4HrUTN6gBR
COZE_BOT_ID = 7621043639807967270
USE_MOCK_DATA = true
```

**注意**：
- 每个变量单独添加
- 确保没有多余的空格
- `USE_MOCK_DATA=true` 表示使用模拟数据

#### 步骤5：部署
1. 点击 "Deploy" 按钮
2. 等待构建完成（约 2-3 分钟）
3. 部署成功后会显示预览链接

---

### 方法2：通过 Vercel CLI 部署

#### 步骤1：安装 Vercel CLI
```bash
npm install -g vercel
```

#### 步骤2：登录
```bash
vercel login
```

#### 步骤3：部署
```bash
# 首次部署
vercel

# 生产环境部署
vercel --prod
```

#### 步骤4：设置环境变量
```bash
# 设置环境变量
vercel env add COZE_API_KEY
vercel env add COZE_BOT_ID
vercel env add USE_MOCK_DATA

# 或者一次性设置
vercel env add COZE_API_KEY production
# 输入值: pat_IS7gZe...

vercel env add COZE_BOT_ID production
# 输入值: 7621043639807967270

vercel env add USE_MOCK_DATA production
# 输入值: true
```

---

## 🔧 部署后配置

### 1. 验证部署

访问 Vercel 提供的 URL（如 `https://your-project.vercel.app`）

**测试步骤**：
1. 页面加载正常
2. 显示"待审计"（蓝色）
3. 输入"你好"，看到绿色低风险评分
4. 输入"JD换汇任务"，看到红色高风险 + 熔断动画

### 2. 自定义域名（可选）

在 Vercel 项目设置中：
1. 进入 "Settings" → "Domains"
2. 添加你的域名
3. 按照提示配置 DNS

### 3. 环境变量管理

在 Vercel 项目设置中：
1. 进入 "Settings" → "Environment Variables"
2. 可以随时修改环境变量
3. 修改后需要重新部署（Redeploy）

---

## 🎯 部署模式选择

### 模式1：模拟数据模式（推荐用于演示）

**环境变量**：
```
USE_MOCK_DATA=true
```

**优点**：
- ✅ 响应速度快（<100ms）
- ✅ 100% 可靠
- ✅ 无需配置 Coze Bot
- ✅ 适合演示和测试

**缺点**：
- ❌ 不是真实的 AI 分析
- ❌ 基于关键词匹配

### 模式2：真实 Coze API 模式

**环境变量**：
```
USE_MOCK_DATA=false
COZE_API_KEY=your_real_api_key
COZE_BOT_ID=your_bot_id
```

**优点**：
- ✅ 真实的 AI 分析
- ✅ 可以持续学习优化

**缺点**：
- ❌ 响应较慢（15-30秒）
- ❌ 需要正确配置 Coze Bot
- ❌ 有 API 调用成本

---

## 🐛 常见问题

### Q1: 部署失败，提示构建错误
**解决方案**：
```bash
# 本地测试构建
npm run build

# 如果本地构建成功，检查 Vercel 的 Node.js 版本
# 在 package.json 添加：
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Q2: 部署成功但页面显示 500 错误
**解决方案**：
1. 检查 Vercel 的 "Functions" 日志
2. 确认环境变量已正确设置
3. 确认 `USE_MOCK_DATA=true`

### Q3: API 调用超时
**解决方案**：
- Vercel Serverless Functions 默认超时 10 秒
- 升级到 Pro 计划可以延长到 60 秒
- 或者使用 `USE_MOCK_DATA=true`

### Q4: 环境变量不生效
**解决方案**：
1. 确认变量名正确（区分大小写）
2. 修改环境变量后需要 "Redeploy"
3. 不要在变量值前后加引号

---

## 📊 性能优化

### 1. 启用 Edge Runtime（可选）

在 `src/app/api/audit/route.ts` 添加：
```typescript
export const runtime = 'edge';
```

**注意**：Edge Runtime 有一些限制，如果遇到问题可以移除。

### 2. 配置缓存

在 `next.config.js` 添加：
```javascript
module.exports = {
  // ... 其他配置
  headers: async () => [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Cache-Control', value: 'no-store' }
      ]
    }
  ]
}
```

---

## 🔄 更新部署

### 自动部署
- 推送到 main 分支会自动触发部署
- 推送到其他分支会创建预览部署

### 手动部署
在 Vercel Dashboard：
1. 进入项目
2. 点击 "Deployments"
3. 点击最新部署的 "..." → "Redeploy"

---

## 📱 监控和日志

### 查看日志
1. 进入 Vercel 项目
2. 点击 "Deployments"
3. 选择一个部署
4. 点击 "Functions" 查看 API 日志

### 性能监控
1. 进入 "Analytics"
2. 查看访问量、响应时间等指标

---

## 🎉 部署检查清单

部署前确认：
- [ ] 代码已提交到 Git
- [ ] `.gitignore` 已更新
- [ ] 环境变量已准备好
- [ ] 本地构建成功（`npm run build`）
- [ ] 本地测试通过（`npm run dev`）

部署后验证：
- [ ] 页面可以正常访问
- [ ] 初始状态显示"待审计"
- [ ] 可以输入消息
- [ ] 风险评分正确显示
- [ ] AI 回复正常显示
- [ ] 高风险触发熔断动画

---

## 📞 需要帮助？

- Vercel 文档：https://vercel.com/docs
- Next.js 部署：https://nextjs.org/docs/deployment
- 项目问题：查看 `TROUBLESHOOTING.md`

---

## 🎯 推荐配置

**用于演示/测试**：
```
USE_MOCK_DATA=true
```

**用于生产环境**（Coze Bot 配置好后）：
```
USE_MOCK_DATA=false
COZE_API_KEY=your_real_key
COZE_BOT_ID=your_bot_id
```

---

**部署愉快！** 🚀

如果遇到问题，请查看 Vercel 的部署日志或联系支持。
