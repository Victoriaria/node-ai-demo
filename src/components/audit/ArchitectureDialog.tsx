/**
 * NODE AI 审计系统 - 系统架构对话框
 */
'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ArchitectureDialogProps {
  open: boolean
  onClose: () => void
  isChinese: boolean
}

export function ArchitectureDialog({
  open,
  onClose,
  isChinese,
}: ArchitectureDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-[#0d0d21] border border-blue-800/50 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-blue-400">
            {isChinese ? '系统架构' : 'System Architecture'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 text-gray-200">
          {/* 产品架构 */}
          <section>
            <h3 className="text-xl font-semibold text-blue-300 mb-3">
              {isChinese ? '2.1 产品架构' : '2.1 Product Architecture'}
            </h3>
            <p className="mb-4 text-sm">
              {isChinese
                ? '产品核心决策流程遵循三阶段模型：'
                : 'Core decision flow follows a three-stage model:'}
            </p>
            
            <div className="bg-[#1a1a2e] p-4 rounded-lg border border-blue-900/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1 text-center">
                  <div className="bg-blue-600/20 border border-blue-500 rounded-lg p-3">
                    <div className="font-bold text-blue-300">
                      {isChinese ? '语义解析' : 'Semantic Analysis'}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {isChinese ? '关键词提取 | 意图识别 | 实体抽取' : 'Keyword Extraction | Intent Recognition | Entity Extraction'}
                    </div>
                  </div>
                </div>
                <div className="px-4 text-blue-400">→</div>
                <div className="flex-1 text-center">
                  <div className="bg-yellow-600/20 border border-yellow-500 rounded-lg p-3">
                    <div className="font-bold text-yellow-300">
                      {isChinese ? '风险建模' : 'Risk Modeling'}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {isChinese ? '知识库匹配 | 行为特征 | Risk Score 0-100' : 'KB Matching | Behavior Analysis | Risk Score 0-100'}
                    </div>
                  </div>
                </div>
                <div className="px-4 text-blue-400">→</div>
                <div className="flex-1 text-center">
                  <div className="bg-red-600/20 border border-red-500 rounded-lg p-3">
                    <div className="font-bold text-red-300">
                      {isChinese ? '熔断决策' : 'Circuit Breaker'}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {isChinese ? 'PASS | HALT | REVIEW' : 'PASS | HALT | REVIEW'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  <strong className="text-blue-300">
                    {isChinese ? '语义解析：' : 'Semantic Analysis: '}
                  </strong>
                  {isChinese
                    ? '从用户输入中提取交易关键信息（金额、地区、支付方式、关键词等）'
                    : 'Extract key transaction info (amount, region, payment method, keywords, etc.)'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">•</span>
                <span>
                  <strong className="text-yellow-300">
                    {isChinese ? '风险建模：' : 'Risk Modeling: '}
                  </strong>
                  {isChinese
                    ? '基于专家知识库和行为特征，计算 0-100 风险评分'
                    : 'Calculate 0-100 risk score based on expert knowledge base and behavior patterns'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span>
                  <strong className="text-red-300">
                    {isChinese ? '熔断决策：' : 'Circuit Breaker: '}
                  </strong>
                  {isChinese
                    ? '根据评分和规则，输出 PASS/HALT/REVIEW 三种决策'
                    : 'Output PASS/HALT/REVIEW decisions based on score and rules'}
                </span>
              </li>
            </ul>
          </section>

          {/* 技术架构 */}
          <section>
            <h3 className="text-xl font-semibold text-blue-300 mb-3">
              {isChinese ? '2.2 技术架构' : '2.2 Technical Architecture'}
            </h3>
            <p className="mb-4 text-sm">
              {isChinese
                ? '系统采用前后端分离 + AI 中台的架构设计：'
                : 'System adopts frontend-backend separation + AI middleware architecture:'}
            </p>

            <div className="bg-[#1a1a2e] p-4 rounded-lg border border-blue-900/30 space-y-4">
              {/* 前端层 */}
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-green-300 mb-2">
                  {isChinese ? '前端层 - Next.js 15' : 'Frontend - Next.js 15'}
                </h4>
                <ul className="text-xs space-y-1 text-gray-300">
                  <li>• {isChinese ? '交互界面：React 18 + Tailwind CSS' : 'UI: React 18 + Tailwind CSS'}</li>
                  <li>• {isChinese ? '实时仪表盘：Risk Score + Thought Chain' : 'Dashboard: Risk Score + Thought Chain'}</li>
                  <li>• {isChinese ? '日志系统：Real-time Logs' : 'Logging: Real-time Logs'}</li>
                </ul>
              </div>

              {/* 服务端中转 */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-blue-300 mb-2">
                  {isChinese ? '服务端中转 - Next.js API Routes' : 'Backend Proxy - Next.js API Routes'}
                </h4>
                <ul className="text-xs space-y-1 text-gray-300">
                  <li>• {isChinese ? '/api/audit 审计接口' : '/api/audit endpoint'}</li>
                  <li>• {isChinese ? '环境变量隔离（Vercel Env）' : 'Environment isolation (Vercel Env)'}</li>
                  <li>• {isChinese ? '180秒长连接支持' : '180s long connection support'}</li>
                </ul>
              </div>

              {/* AI 专家内核 */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold text-purple-300 mb-2">
                  {isChinese ? 'AI 专家内核 - Coze' : 'AI Expert Core - Coze'}
                </h4>
                <ul className="text-xs space-y-1 text-gray-300">
                  <li>• {isChinese ? '模式识别：Python 节点' : 'Pattern Recognition: Python Node'}</li>
                  <li>• {isChinese ? 'RAG 知识库：合规条例检索' : 'RAG KB: Compliance retrieval'}</li>
                  <li>• {isChinese ? 'Workflow 编排：强制 JSON 输出' : 'Workflow: Forced JSON output'}</li>
                </ul>
              </div>
            </div>

            {/* 技术要点 */}
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <h5 className="font-semibold text-blue-300 mb-1">
                  1. {isChinese ? 'Next.js 15 服务端中转' : 'Next.js 15 Backend Proxy'}
                </h5>
                <ul className="text-xs space-y-1 text-gray-300 ml-4">
                  <li>• {isChinese ? 'API Routes 作为中间层，前端不直接暴露 Coze API Token' : 'API Routes as middleware, frontend never exposes Coze API Token'}</li>
                  <li>• {isChinese ? '服务端处理超时、重试、错误格式化' : 'Server handles timeout, retry, error formatting'}</li>
                  <li>• {isChinese ? '支持 180 秒长连接（Coze 推理耗时 30-60 秒）' : 'Supports 180s long connection (Coze inference takes 30-60s)'}</li>
                </ul>
              </div>

              <div>
                <h5 className="font-semibold text-purple-300 mb-1">
                  2. {isChinese ? 'Coze 专家内核' : 'Coze Expert Core'}
                </h5>
                <ul className="text-xs space-y-1 text-gray-300 ml-4">
                  <li>• {isChinese ? '模式识别：Python 节点提取关键词，判断普通/专家模式' : 'Pattern Recognition: Python node extracts keywords, determines normal/expert mode'}</li>
                  <li>• {isChinese ? 'RAG 知识库：存储合规条例、诈骗案例、黑名单等' : 'RAG KB: Stores compliance rules, fraud cases, blacklists, etc.'}</li>
                  <li>• {isChinese ? '强制 JSON 输出：避免自然语言幻觉，确保结构化返回' : 'Forced JSON output: Avoids NL hallucination, ensures structured response'}</li>
                </ul>
              </div>

              <div>
                <h5 className="font-semibold text-green-300 mb-1">
                  3. {isChinese ? 'Vercel 环境变量隔离' : 'Vercel Environment Isolation'}
                </h5>
                <ul className="text-xs space-y-1 text-gray-300 ml-4">
                  <li>• {isChinese ? '.env.local 存储敏感配置（COZE_API_KEY, COZE_BOT_ID）' : '.env.local stores sensitive config (COZE_API_KEY, COZE_BOT_ID)'}</li>
                  <li>• {isChinese ? '生产环境通过 Vercel Dashboard 配置' : 'Production env configured via Vercel Dashboard'}</li>
                  <li>• {isChinese ? '支持多环境部署（dev/staging/prod）' : 'Supports multi-env deployment (dev/staging/prod)'}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 数据流 */}
          <section>
            <h3 className="text-xl font-semibold text-blue-300 mb-3">
              {isChinese ? '数据流向' : 'Data Flow'}
            </h3>
            <div className="bg-[#1a1a2e] p-4 rounded-lg border border-blue-900/30">
              <div className="flex items-center gap-2 text-sm">
                <span className="px-3 py-1 bg-green-600/20 border border-green-500 rounded">
                  {isChinese ? '用户输入' : 'User Input'}
                </span>
                <span className="text-blue-400">→</span>
                <span className="px-3 py-1 bg-blue-600/20 border border-blue-500 rounded">
                  {isChinese ? '前端界面' : 'Frontend'}
                </span>
                <span className="text-blue-400">→</span>
                <span className="px-3 py-1 bg-blue-600/20 border border-blue-500 rounded">
                  API Routes
                </span>
                <span className="text-blue-400">→</span>
                <span className="px-3 py-1 bg-purple-600/20 border border-purple-500 rounded">
                  Coze AI
                </span>
                <span className="text-blue-400">→</span>
                <span className="px-3 py-1 bg-yellow-600/20 border border-yellow-500 rounded">
                  {isChinese ? '风险评分' : 'Risk Score'}
                </span>
                <span className="text-blue-400">→</span>
                <span className="px-3 py-1 bg-red-600/20 border border-red-500 rounded">
                  {isChinese ? '决策展示' : 'Decision Display'}
                </span>
              </div>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
