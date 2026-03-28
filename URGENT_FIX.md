# 🚨 紧急修复：Vercel 环境变量配置

## 问题诊断

生产环境测试结果：
```
❌ 评分: 待评定
❌ 决策: WARN
❌ 原因: 未获取到AI回复内容，请检查Bot ID是否正确
❌ 思考链: SSE流响应为空
```

**根本原因**：Vercel 环境变量 `USE_LOCAL_WORKFLOW` 未设置，系统仍在使用 Coze API。

---

## 立即修复步骤

### 步骤1：访问 Vercel

1. 打开浏览器
2. 访问 https://vercel.com
3. 登录你的账号

### 步骤2：进入项目设置

1. 在 Dashboard 中找到 "node-ai" 项目
2. 点击项目名称进入详情页
3. 点击顶部的 "Settings" 标签
4. 在左侧菜单中点击 "Environment Variables"

### 步骤3：添加环境变量

点击 "Add New" 按钮，填写：

```
Key (变量名):
USE_LOCAL_WORKFLOW

Value (值):
true

Environments (环境):
☑️ Production
☑️ Preview  
☑️ Development
```

点击 "Save" 保存。

### 步骤4：重新部署

**重要**：添加环境变量后必须重新部署才能生效！

方式1：手动重新部署（推荐）
1. 点击顶部的 "Deployments" 标签
2. 找到最新的部署（第一行）
3. 点击右侧的 "..." 三个点菜单
4. 选择 "Redeploy"
5. 在弹出的对话框中点击 "Redeploy" 确认

方式2：推送新代码
```bash
git commit --allow-empty -m "trigger redeploy"
git push origin main
```

### 步骤5：等待部署完成

- 部署时间：约 2-3 分钟
- 在 "Deployments" 页面查看进度
- 等待状态从 "Building" 变为 "Ready"

### 步骤6：验证修复

部署完成后，刷新页面：
https://node-ai-iota.vercel.app

输入测试：
```
我想帮朋友做个JD换汇任务，赚点佣金
```

**预期结果**：
- ✅ 评分：92/100
- ✅ 决策：HALT
- ✅ 显示红色高风险
- ✅ 触发熔断动画
- ✅ 思考链显示完整分析过程

---

## 验证清单

部署完成后，请确认：

- [ ] 环境变量 `USE_LOCAL_WORKFLOW=true` 已添加
- [ ] 环境变量应用到 Production 环境
- [ ] 已触发重新部署
- [ ] 部署状态为 "Ready"
- [ ] 测试 JD 换汇任务返回 92 分
- [ ] 测试正常咨询返回低风险

---

## 截图参考

### 环境变量设置页面应该显示：

```
Environment Variables

┌─────────────────────────────────────────┐
│ USE_LOCAL_WORKFLOW                      │
│ Value: true                             │
│ Environments: Production, Preview, Dev  │
│ [Edit] [Delete]                         │
└─────────────────────────────────────────┘
```

### 部署页面应该显示：

```
Deployments

✓ Ready    main    a86bdd09    Just now
  Building main    032fba72    5 minutes ago
```

---

## 如果还是不行

### 检查1：确认环境变量

在 Vercel 项目设置中：
1. Settings → Environment Variables
2. 确认 `USE_LOCAL_WORKFLOW` 存在
3. 确认值为 `true`（不是 "true" 带引号）
4. 确认 Production 环境有绿色标签

### 检查2：查看构建日志

1. Deployments → 点击最新部署
2. 查看 "Build Logs"
3. 搜索 "USE_LOCAL_WORKFLOW"
4. 应该看到：`Environments: .env.local`

### 检查3：测试 API

在浏览器控制台运行：
```javascript
fetch('/api/audit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ input: '我想帮朋友做个JD换汇任务，赚点佣金' })
})
.then(r => r.json())
.then(d => console.log('API响应:', d))
```

应该看到：
```json
{
  "score": 92,
  "decision": "HALT",
  "mode": "AUDIT",
  "thought_chain": [...]
}
```

---

## 联系支持

如果按照以上步骤操作后仍然有问题，请提供：

1. Vercel 环境变量截图
2. 最新部署的构建日志
3. 浏览器控制台的错误信息
4. API 测试的完整响应

---

**预计修复时间**：5-10 分钟  
**关键步骤**：添加环境变量 + 重新部署
