/**
 * NODE AI 审计系统 - 错误处理工具
 */
import { RiskAssessment, RiskDecision, AuditMode } from '@/types/audit'
import { logger } from './logger'

/**
 * 自定义错误类
 */
export class AuditError extends Error {
  constructor(
    public code: string,
    message: string,
    public context?: Record<string, any>
  ) {
    super(message)
    this.name = 'AuditError'
  }
}

/**
 * 错误代码枚举
 */
export const ERROR_CODES = {
  API_CONNECTION_FAILED: 'API_CONNECTION_FAILED',
  API_TIMEOUT: 'API_TIMEOUT',
  INVALID_RESPONSE: 'INVALID_RESPONSE',
  PARSE_ERROR: 'PARSE_ERROR',
  CONFIG_MISSING: 'CONFIG_MISSING',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN: 'UNKNOWN',
} as const

/**
 * 错误映射 - 错误代码到用户友好消息
 */
const ERROR_MESSAGE_MAP: Record<string, string> = {
  [ERROR_CODES.API_CONNECTION_FAILED]: '审计服务连接失败，请检查网络和配置',
  [ERROR_CODES.API_TIMEOUT]: '审计服务响应超时，请稍后重试',
  [ERROR_CODES.INVALID_RESPONSE]: '审计服务返回无效响应',
  [ERROR_CODES.PARSE_ERROR]: '解析审计结果失败',
  [ERROR_CODES.CONFIG_MISSING]: '系统配置不完整，请联系管理员',
  [ERROR_CODES.NETWORK_ERROR]: '网络连接失败',
  [ERROR_CODES.UNKNOWN]: '发生未知错误',
}

/**
 * 获取用户友好的错误消息
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AuditError) {
    return ERROR_MESSAGE_MAP[error.code] || error.message
  }

  if (error instanceof Error) {
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return ERROR_MESSAGE_MAP[ERROR_CODES.NETWORK_ERROR]
    }
    if (error.message.includes('timeout')) {
      return ERROR_MESSAGE_MAP[ERROR_CODES.API_TIMEOUT]
    }
    return error.message
  }

  return ERROR_MESSAGE_MAP[ERROR_CODES.UNKNOWN]
}

/**
 * 创建默认的错误响应
 */
export function createErrorResponse(
  code: string,
  reason: string,
  aiResponse?: string
): RiskAssessment {
  return {
    score: null,
    mode: AuditMode.AUDIT,
    decision: RiskDecision.WARN,
    reason: reason || getErrorMessage(new AuditError(code, code)),
    thought_chain: [code, '系统异常'],
    ai_response: aiResponse || '审计服务暂时不可用，请稍后再试',
  }
}

/**
 * 处理 API 错误
 */
export function handleApiError(
  error: unknown,
  context?: Record<string, any>
): RiskAssessment {
  logger.error(`API 错误: ${error instanceof Error ? error.message : '未知错误'}`)

  if (error instanceof AuditError) {
    return createErrorResponse(
      error.code,
      getErrorMessage(error),
      error.context?.aiResponse
    )
  }

  if (error instanceof TypeError) {
    if (error.message.includes('fetch')) {
      return createErrorResponse(
        ERROR_CODES.NETWORK_ERROR,
        '网络连接失败'
      )
    }
  }

  return createErrorResponse(
    ERROR_CODES.UNKNOWN,
    getErrorMessage(error)
  )
}

/**
 * 验证 API 响应格式
 */
export function validateApiResponse(data: unknown): boolean {
  if (!data || typeof data !== 'object') {
    return false
  }

  const obj = data as Record<string, any>
  return (
    typeof obj.score === 'number' || obj.score === null ||
    typeof obj.decision === 'string' ||
    typeof obj.reason === 'string' ||
    Array.isArray(obj.thought_chain) ||
    typeof obj.ai_response === 'string'
  )
}

/**
 * 包装 fetch 调用，添加错误处理
 */
export async function fetchWithErrorHandling(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  try {
    const response = await fetch(url, {
      ...options,
      signal: options.signal || AbortSignal.timeout(120000),
    })

    if (!response.ok) {
      throw new AuditError(
        ERROR_CODES.API_CONNECTION_FAILED,
        `API 请求失败: ${response.status} ${response.statusText}`,
        { status: response.status }
      )
    }

    return response
  } catch (error) {
    if (error instanceof AuditError) {
      throw error
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new AuditError(
        ERROR_CODES.NETWORK_ERROR,
        '网络连接失败',
        { originalError: error }
      )
    }

    throw new AuditError(
      ERROR_CODES.UNKNOWN,
      error instanceof Error ? error.message : '未知错误',
      { originalError: error }
    )
  }
}
