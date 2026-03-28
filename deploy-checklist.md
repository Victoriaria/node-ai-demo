# 🚀 Vercel 部署快速检查清单

## ✅ 部署前（5分钟）

### 1. 检查代码
```bash
# 确保没有语法错误
npm run build

# 如果构建成功，继续下一步
```

### 2. 提交代码到 Git
```bash
git status
git add .
git commit -m "准备部署到 Vercel"
git push origin main
```

### 3. 准备环境变量
复制以下内容，准备在 Vercel 中粘贴：

```
COZE_API_KEY=pat_IS7gZeBKFHEETYYT5bqPkxSHHUti7PnZPcUu47wjlPxuF69YxNZkrV4HrUTN6gBR
COZE_BOT_ID=7621043639807967270
USE_MOCK_DATA=true
```

---

## 🌐 在 Vercel 部署（3分钟）

### 步骤1：导入项目
1. 访问 https://vercel.com
2. 登录（使用 GitHub 账号）
3. 点击 "Add New..." → "Project"
4. 选择你的仓库
5. 点击 "Import"

### 步骤2：配置环境变量
在 "Environment Variables" 部分，添加三个变量：

**变量1**：
- Name: `COZE_API_KEY`
- Value: `pat_IS7gZeBKFHEETYYT5bqPkxSHHUti7PnZPcUu47wjlPxuF69YxNZkrV4HrUTN6gBR`

**变量2**：
- Name: `COZE_BOT_ID`
- Value: `7621043639807967270`

**变量3**：
- Name: `USE_MOCK_DATA`
- Value: `true`

### 步骤3：部署
1. 点击 "Deploy" 按钮
2. 等待 2-3 分钟
3. 完成！

---

## ✅ 部署后验证（2分钟）

访问 Vercel 提供的 URL，测试：

### 测试1：页面加载
- [ ] 页面正常显示
- [ ] 显示"待审计"（蓝色）

### 测试2：低风险
- [ ] 输入："你好"
- [ ] 显示绿色，20分左右

### 测试3：高风险
- [ ] 输入："JD换汇任务"
- [ ] 显示红色，90分以上
- [ ] 触发熔断动画

---

## 🎉 完成！

如果所有测试通过，部署成功！

**你的应用地址**：`https://your-project.vercel.app`

---

## 🔧 可选配置

### 自定义域名
1. 进入 Vercel 项目
2. Settings → Domains
3. 添加你的域名

### 切换到真实 API
当 Coze Bot 配置好后：
1. Settings → Environment Variables
2. 修改 `USE_MOCK_DATA` 为 `false`
3. 点击 "Redeploy"

---

## 📞 遇到问题？

查看详细文档：`VERCEL_DEPLOYMENT.md`
