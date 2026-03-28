/**
 * NODE AI 审计系统 - 核心类型定义
 */

/** 风险决策枚举 */
export enum RiskDecision {
  ALLOW = 'ALLOW',           // 允许
  HALT = 'HALT',              // 拦截
  WARN = 'WARN',              // 警告
  INFO_REQUIRED = 'INFO_REQUIRED' // 需补充信息
}

/** 审计模式枚举 */
export enum AuditMode {
  NORMAL = 'NORMAL',
  AUDIT = 'AUDIT'
}

/** 日志级别枚举 */
export enum LogLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS'
}

/** 风险评估结果 */
export interface RiskAssessment {
  score: number | null
  mode: AuditMode
  decision: RiskDecision
  reason: string
  thought_chain: string[]
  ai_response: string
}

/** 聊天消息 */
export interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
}

/** 日志条目 */
export interface LogEntry {
  id: string
  message: string
  timestamp: Date
  level: LogLevel
}

/** API 请求体 */
export interface AuditRequest {
  input: string
}

/** 审计状态 */
export interface AuditState {
  riskScore: number | null
  mode: AuditMode
  decision: RiskDecision
  thoughtChain: string[]
  currentRiskReason: string
  isFuseActive: boolean
  showFuseDialog: boolean
}

/** 消息管理状态 */
export interface MessagesState {
  messages: Message[]
  input: string
}

/** 日志管理状态 */
export interface LogsState {
  logs: LogEntry[]
}

/** 语言配置 */
export type Language = 'zh' | 'en'

/** 组件属性基类 */
export interface BaseComponentProps {
  isChinese?: boolean
}

/** API 响应 - 成功 */
export interface ApiSuccessResponse extends RiskAssessment {}

/** API 响应 - 错误 */
export interface ApiErrorResponse {
  error?: string
  message?: string
  status?: string
}

/** API 完整响应 */
export type ApiResponse = ApiSuccessResponse | ApiErrorResponse

/** Coze API 配置 */
export interface CozeConfig {
  baseUrl: string
  apiKey: string
  botId: string
  timeout: number
}

/** 重试配置 */
export interface RetryConfig {
  maxAttempts: number
  initialDelay: number
  maxDelay: number
  backoffMultiplier: number
}
