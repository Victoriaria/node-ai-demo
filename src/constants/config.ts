/**
 * NODE AI 审计系统 - 配置常量
 */
import { RiskDecision } from '@/types/audit'

/** 风险评分阈值配置 */
export const RISK_THRESHOLDS = {
  HIGH_RISK_MIN: 80,      // 高风险最低分数
  HALT_THRESHOLD: 90,      // 触发拦截的阈值
  WARN_THRESHOLD: 60,      // 警告阈值
  LOW_RISK_MAX: 20,        // 低风险最高分
} as const

/** 风险级别颜色 */
export const RISK_COLORS = {
  HIGH: '#ff4d4d',         // 高风险 - 红色
  MEDIUM: '#ffaa00',       // 中风险 - 橙色
  LOW: '#00ff88',          // 低风险 - 绿色
  UNKNOWN: '#cccccc',      // 未知 - 灰色
  INFO_REQUIRED: '#ffaa00' // 信息缺失 - 黄色
} as const

/** API 超时配置（毫秒） */
export const TIMEOUTS = {
  API_CALL: 120000,       // API 调用超时 120 秒
  RETRY_INITIAL: 1000,    // 首次重试延迟 1 秒
  RETRY_MAX: 10000,       // 最大重试延迟 10 秒
} as const

/** 列表限制 */
export const LIMITS = {
  MAX_MESSAGES: 100,      // 保留最多消息数
  MAX_LOGS: 50,           // 保留最多日志数
  MAX_THOUGHT_CHAIN: 10,  // 最多显示思考链条数
  LOG_MESSAGE_TRUNCATE: 100, // 日志消息最大长度
} as const

/** 重试配置 */
export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 2,        // 最多重试次数
  INITIAL_DELAY: 1000,    // 首次重试延迟
  MAX_DELAY: 10000,       // 最大延迟
  BACKOFF_MULTIPLIER: 2,  // 退避倍数
} as const

/** 高风险关键词 */
export const HIGH_RISK_KEYWORDS = [
  '洗钱', '帮信罪', '非法经营', '刑事责任', '刑法', '违法',
  '犯罪', '冻结账户', '司法解释', '立即停止', '高风险', '严重违规',
  '代收款项', '赚取佣金', '转账', '资金流转', '黑钱'
] as const

/** 中风险关键词 */
export const MED_RISK_KEYWORDS = [
  '风险', '合规', '注意', '谨慎', '建议', '可能', '潜在',
  '监管', '审查', '核实', '警惕'
] as const

/** 缺失信息判断关键词 */
export const INFO_MISSING_KEYWORDS = [
  '缺失', '缺少', '暂无法评定', 'undetermined'
] as const

/** 决策映射 - 分数到决策 */
export const DECISION_MAP: Record<number, RiskDecision> = {
  20: RiskDecision.ALLOW,
  50: RiskDecision.WARN,
  65: RiskDecision.WARN,
  85: RiskDecision.HALT,
  95: RiskDecision.HALT,
} as const

/** 风险文本映射 */
export const RISK_TEXT_MAP = {
  [RiskDecision.ALLOW]: '低风险',
  [RiskDecision.WARN]: '中风险',
  [RiskDecision.HALT]: '高风险',
  [RiskDecision.INFO_REQUIRED]: '需补充信息',
} as const

/** API 配置 */
export const COZE_CONFIG = {
  API_BASE: 'https://api.coze.cn',
  BOT_CHAT_ENDPOINT: '/v3/chat',
  REQUEST_TIMEOUT: 120000,
  USER_ID: 'node-ai-user',
} as const

/** UI 配置 */
export const UI_CONFIG = {
  CONTAINER_MAX_WIDTH: 'container',
  CHAT_MIN_HEIGHT: 600,
  DASHBOARD_WIDTH: 350,
  RISK_SCORE_SIZE: 48,
  TRUNCATE_LENGTH: 50,
} as const

/** 动画配置 */
export const ANIMATION_CONFIG = {
  PULSE_DELAY_1: '0ms',
  PULSE_DELAY_2: '200ms',
  PULSE_DELAY_3: '400ms',
  TRANSITION_DURATION: 500,
} as const
