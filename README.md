# NODE AI - 跨境支付AI原生合规审计引擎

一款专为跨境电商、跨国贸易及支付机构打造的 "AI 原生合规审计引擎"，深度嵌入支付工作流，定位为 "数字首席风控官（dCRO）"。

## 项目文档

- [✅ 系统状态报告](./SYSTEM_STATUS.md) - **系统已完全调通！所有测试通过！**
- [PRD - 产品需求文档](./PRD.md) - 完整的产品定义、技术架构和功能规范
- [Coze API 集成指南](./COZE_API_INTEGRATION.md) - 如何切换到真实 Coze API
- [Vercel 部署指南](./VERCEL_DEPLOYMENT.md) - 详细的部署步骤
- [快速部署检查清单](./deploy-checklist.md) - 3分钟快速部署
- [部署就绪说明](./DEPLOYMENT_READY.md) - 构建测试通过，随时可部署

## 技术栈

- **前端框架**: Next.js 15
- **UI框架**: React
- **样式**: Tailwind CSS
- **UI组件库**: shadcn/ui
- **图标库**: Lucide Icons

## 界面风格

深色金融工业风（Bloomberg Terminal风格）：
- 主色调: #0a0a1a
- 高亮色: Neon Blue #00f2ff
- 警告色: Alert Red #ff4d4d

## 功能特性

### 核心功能

1. **AI对话区**
   - 支持多轮对话输入
   - JD文本粘贴功能
   - 实时对话历史记录

2. **实时风控看板**
   - Risk Score半圆仪表盘
   - Thought Chain垂直时间线
   - 实时日志流

3. **智能风控**
   - 自动关键词检测（支付/金融/风控）
   - 审计模式切换（背景变深黑、线条荧光绿）
   - 风险熔断机制（score≥80触发）

4. **交互功能**
   - Coze SDK对接Workflow API
   - 模拟高风险攻击测试
   - 全屏熔断动画效果

## 快速开始

### 安装依赖

```bash
npm install
```

### 配置环境变量

复制 `.env.example` 文件为 `.env` 并配置Coze API密钥：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
NEXT_PUBLIC_COZE_API_KEY=your_coze_api_key_here
NEXT_PUBLIC_COZE_WORKFLOW_ID=your_workflow_id_here
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看应用

### 构建生产版本

```bash
npm run build
npm start
```

## 项目结构

```
.
├── src/
│   ├── app/
│   │   ├── layout.tsx    # 根布局
│   │   └── page.tsx      # 主页面
│   ├── components/
│   │   └── ui/           # shadcn/ui组件
│   ├── lib/
│   │   └── utils.ts      # 工具函数
│   └── styles/
│       └── globals.css   # 全局样式
├── .env.example          # 环境变量示例
├── package.json          # 项目配置
├── tailwind.config.js    # Tailwind配置
└── next.config.js        # Next.js配置
```

## 使用说明

1. **基本对话**：在左侧AI对话区输入内容，系统会自动进行风险评估
2. **查看系统架构**：点击右上角"查看系统架构"按钮，了解产品架构和技术架构
3. **JD文本粘贴**：直接粘贴JD文本，系统会自动分析关键词
4. **模拟高风险攻击**：点击右上角"模拟高风险攻击"按钮测试熔断机制
5. **关键词检测**：开启JD关键词检测开关，系统会自动高亮金融相关关键词

## 风控规则

- **风险分数 < 50**：低风险，允许继续处理
- **50 ≤ 风险分数 < 80**：中风险，进入审计模式
- **风险分数 ≥ 80**：高风险，触发熔断机制

## 开发说明

### 添加新组件

使用shadcn/ui CLI添加新组件：

```bash
npx shadcn-ui add component-name
```

### 自定义样式

修改 `tailwind.config.js` 中的颜色配置：

```javascript
colors: {
  brand: {
    dark: "#0a0a1a",
    neon: "#00f2ff",
    alert: "#ff4d4d",
    success: "#00ff88",
  },
}
```

## 许可证

MIT License
