/**
 * NODE AI 审计系统 - 风险计算工具
 */
import {
  RiskAssessment,
  RiskDecision,
  AuditMode,
  ApiResponse,
} from '@/types/audit'
import {
  RISK_THRESHOLDS,
  HIGH_RISK_KEYWORDS,
  MED_RISK_KEYWORDS,
  INFO_MISSING_KEYWORDS,
} from '@/constants/config'
import { logger } from './logger'

/**
 * 从 API 响应计算风险
 */
export function calculateRiskFromResponse(answer: string): RiskAssessment {
  let score: number | null | undefined
  let mode: AuditMode = AuditMode.NORMAL
  let decision: RiskDecision = RiskDecision.ALLOW
  let reason = '未发现明显高风险特征'
  let thought_chain: string[] = []
  thought_chain.push('审计完成')

  // 第一步：尝试解析 JSON 块
  const jsonResult = parseJsonResponse(answer)
  if (jsonResult.score !== undefined) score = jsonResult.score
  if (jsonResult.mode) mode = jsonResult.mode
  if (jsonResult.reason) reason = jsonResult.reason
  if (jsonResult.thought_chain && jsonResult.thought_chain.length > 0) thought_chain = jsonResult.thought_chain

  // 第二步：尝试从标记解析
  if (score === undefined || score === null) {
    const markerResult = parseMarkerResponse(answer)
    if (markerResult.score !== undefined) score = markerResult.score
    if (markerResult.mode) mode = markerResult.mode
    if (markerResult.reason) reason = markerResult.reason
    if (markerResult.decision) decision = markerResult.decision
  }

  // 第三步：语义推断
  if (score === undefined) {
    score = semanticInference(answer)
  }

  // 第四步：确定原因和思考链
  if (reason === '未发现明显高风险特征') {
    reason = extractReason(answer)
  }

  if (thought_chain.length <= 1) {
    thought_chain = extractThoughtChain(answer)
  }

  // 第五步：确定最终决策
  if (score === undefined || score === null) {
    mode = AuditMode.AUDIT
    decision = RiskDecision.WARN
  } else if (score >= RISK_THRESHOLDS.HALT_THRESHOLD) {
    decision = RiskDecision.HALT
    mode = AuditMode.AUDIT
  } else if (score >= RISK_THRESHOLDS.WARN_THRESHOLD) {
    decision = RiskDecision.WARN
    mode = AuditMode.AUDIT
  } else {
    decision = RiskDecision.ALLOW
  }

  // 规范化分数
  const normalizedScore =
    score !== undefined && score !== null ? Math.max(0, Math.min(100, score)) : null

  return {
    score: normalizedScore,
    mode,
    decision,
    reason,
    thought_chain,
    ai_response: answer,
  }
}

/**
 * 解析 JSON 响应
 */
function parseJsonResponse(answer: string): Partial<RiskAssessment> {
  try {
    const jsonMatch =
      answer.match(/```json\s*([\s\S]*?)```/) ||
      answer.match(/(\{[\s\S]*?\})/)
    if (!jsonMatch) return {}

    const extracted = JSON.parse(jsonMatch[1] ?? jsonMatch[0])

    let score: number | undefined
    if (extracted.score !== undefined) {
      score = Number(extracted.score)
    }

    // 处理 risk_level 字段
    if (extracted.risk_level) {
      const rl = String(extracted.risk_level).toLowerCase()
      if (rl === 'undetermined') {
        score = undefined
      } else if (rl === 'high') {
        score = 95
      } else if (rl === 'medium') {
        score = 65
      } else if (rl === 'low') {
        score = 20
      }
    }

    const mode = extracted.mode === 'AUDIT' ? AuditMode.AUDIT : AuditMode.NORMAL
    const reason = extracted.reason || '未发现明显高风险特征'
    const thought_chain = Array.isArray(extracted.thought_chain)
      ? extracted.thought_chain
      : ['审计完成']

    return { score, mode, reason, thought_chain }
  } catch {
    logger.warning('JSON 解析失败，尝试其他方法')
    return {}
  }
}

/**
 * 解析标记响应（【HALT】、【WARN】等）
 */
function parseMarkerResponse(
  answer: string
): Partial<RiskAssessment & { decision?: RiskDecision }> {
  const upper = answer.toUpperCase()

  // 检查是否缺失信息
  if (upper.includes('【HALT】') || upper.includes('HALT')) {
    if (INFO_MISSING_KEYWORDS.some((k) => answer.includes(k))) {
      return {
        score: null,
        mode: AuditMode.AUDIT,
        decision: RiskDecision.INFO_REQUIRED,
        reason: '缺少核心交易要素，无法完成风险评定，请补充信息后重新提交',
        thought_chain: extractThoughtChain(answer),
      }
    }
    return { score: 95, decision: RiskDecision.HALT }
  }

  if (upper.includes('【WARN】') || upper.includes('WARN')) {
    return { score: 65, decision: RiskDecision.WARN }
  }

  if (upper.includes('【ALLOW】') || upper.includes('ALLOW')) {
    return { score: 20, decision: RiskDecision.ALLOW }
  }

  return {}
}

/**
 * 语义推断 - 通过关键词分析
 */
function semanticInference(answer: string): number | undefined {
  const highMatches = HIGH_RISK_KEYWORDS.filter((k) =>
    answer.includes(k)
  ).length
  const medMatches = MED_RISK_KEYWORDS.filter((k) =>
    answer.includes(k)
  ).length

  if (highMatches >= 3) {
    return 85 + Math.min(highMatches, 5)
  } else if (highMatches >= 1) {
    return 70 + highMatches * 3
  } else if (medMatches >= 2) {
    return 50 + medMatches * 3
  } else if (medMatches > 0) {
    return 30
  }

  return undefined
}

/**
 * 提取风险原因
 */
function extractReason(answer: string): string {
  // 尝试从【审计结论】提取
  const conclusionMatch = answer.match(
    /【审计结论】[\s\S]*?最终决策[：:]\s*(.+)/
  )
  if (conclusionMatch) {
    return conclusionMatch[1].trim().replace(/【|】/g, '')
  }

  // 否则取第一句话
  const firstSentence = answer
    .split(/[。\n]/)
    .map((s) => s.trim())
    .find((s) => s.length > 10)

  if (firstSentence) {
    return firstSentence.substring(0, 100)
  }

  return '未发现明显高风险特征'
}

/**
 * 提取思考链
 */
export function extractThoughtChain(answer: string): string[] {
  const chain: string[] = []

  // 从【标题】提取
  const sections = answer.match(/【[^】]+】/g)
  if (sections) {
    sections.forEach((s) => {
      const title = s.replace(/【|】/g, '').trim()
      if (title && !chain.includes(title)) {
        chain.push(title)
      }
    })
  }

  // 提取风险分值
  const scoreMatch = answer.match(/风险分值[：:]\s*(.+)/)
  if (scoreMatch) {
    chain.push(`风险分值: ${scoreMatch[1].trim()}`)
  }

  // 提取最终决策
  const decisionMatch = answer.match(/最终决策[：:]\s*(.+)/)
  if (decisionMatch) {
    chain.push(
      `决策: ${decisionMatch[1].trim().replace(/【|】/g, '')}`
    )
  }

  // 如果还是没有，提取多个句子
  if (chain.length === 0) {
    const sentences = answer
      .split(/[。\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10 && s.length < 80)
    chain.push(...sentences.slice(0, 5))
  }

  return chain.length > 0 ? chain : ['审计分析完成']
}

/**
 * 获取风险决策
 */
export function getRiskDecision(score: number | null): RiskDecision {
  if (score === null) return RiskDecision.WARN
  if (score >= RISK_THRESHOLDS.HALT_THRESHOLD) return RiskDecision.HALT
  if (score >= RISK_THRESHOLDS.WARN_THRESHOLD) return RiskDecision.WARN
  return RiskDecision.ALLOW
}

/**
 * 获取风险模式
 */
export function getRiskMode(decision: RiskDecision): AuditMode {
  return decision === RiskDecision.ALLOW ? AuditMode.NORMAL : AuditMode.AUDIT
}

/**
 * 验证 API 响应是否有错误
 */
export function isApiErrorResponse(data: any): boolean {
  return (
    data?.error !== undefined ||
    data?.status === 'error' ||
    (!data?.score && !data?.decision && !data?.reason)
  )
}
