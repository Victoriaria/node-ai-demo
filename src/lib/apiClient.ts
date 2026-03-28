/**
 * NODE AI 审计系统 - API 客户端
 */
import { AuditRequest, AuditMode, RiskDecision } from '@/types/audit'
import { TIMEOUTS, RETRY_CONFIG } from '@/constants/config'
import {
  fetchWithErrorHandling,
  AuditError,
  ERROR_CODES,
  createErrorResponse,
} from './errorHandler'
import { calculateRiskFromResponse } from './riskCalculator'
import { logger } from './logger'

/**
 * 调用 Coze API 进行审计
 */
export async function callCozeAPI(input: string, retryCount = 0): Promise<any> {
  if (!input?.trim()) {
    throw new AuditError(
      ERROR_CODES.INVALID_RESPONSE,
      '输入不能为空'
    )
  }

  try {
    logger.info(`正在分析: ${input.substring(0, 50)}...`)

    // 获取 API 基础 URL
    const baseUrl =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'http://localhost:3000'
    const apiUrl = `${baseUrl}/api/audit`

    console.log('🔗 API调用URL:', apiUrl)

    // 发送请求
    const response = await fetchWithErrorHandling(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      body: JSON.stringify({ input }),
    })

    console.log('📡 API响应状态:', response.status)

    // 解析响应
    let data
    try {
      data = await response.json()
      console.log('✅ API响应数据:', JSON.stringify(data, null, 2))
    } catch (e) {
      const errorMsg = `解析响应失败: ${e instanceof Error ? e.message : '未知错误'}`
      logger.warning(errorMsg)
      throw new AuditError(
        ERROR_CODES.PARSE_ERROR,
        errorMsg,
        { context: 'response parsing' }
      )
    }

    // 检查错误响应
    if (data?.error || data?.status === 'error') {
      const errorMsg = data?.message || data?.error || '审计服务连接失败'
      logger.error(`API返回错误: ${errorMsg}`)
      throw new AuditError(
        ERROR_CODES.API_CONNECTION_FAILED,
        errorMsg,
        { apiError: data?.error }
      )
    }

    // 计算风险
    const result = calculateRiskFromResponse(data?.ai_response || '')

    // 补充缺失的数据
    if (data?.score !== undefined) result.score = data.score
    if (data?.mode) result.mode = data.mode
    if (data?.decision) result.decision = data.decision
    if (data?.reason) result.reason = data.reason
    if (data?.thought_chain) result.thought_chain = data.thought_chain

    logger.info(
      `分析完成: ${result.score}分, ${result.decision}`
    )

    return result
  } catch (error) {
    // 如果是可重试的错误，进行重试
    if (retryCount < RETRY_CONFIG.MAX_ATTEMPTS) {
      if (
        error instanceof AuditError &&
        (error.code === ERROR_CODES.API_TIMEOUT ||
          error.code === ERROR_CODES.NETWORK_ERROR)
      ) {
        const delay = Math.min(
          RETRY_CONFIG.INITIAL_DELAY *
            Math.pow(RETRY_CONFIG.BACKOFF_MULTIPLIER, retryCount),
          RETRY_CONFIG.MAX_DELAY
        )

        logger.warning(
          `API调用失败，${delay}ms 后进行第 ${retryCount + 1} 次重试`
        )

        await new Promise((resolve) => setTimeout(resolve, delay))
        return callCozeAPI(input, retryCount + 1)
      }
    }

    // 处理错误
    logger.error(`API调用失败: ${error instanceof Error ? error.message : '未知错误'}`)

    // 返回错误响应而不是抛出异常
    const errorResult = createErrorResponse(
      error instanceof AuditError
        ? error.code
        : ERROR_CODES.UNKNOWN,
      error instanceof Error ? error.message : '未知错误'
    )

    logger.info(
      `风险评估完成（错误）: 分数=${errorResult.score}, 决策=${errorResult.decision}, 模式=${errorResult.mode}`
    )

    return errorResult
  }
}

/**
 * 简单的重试包装
 */
export async function fetchWithRetry<T>(
  fetcher: () => Promise<T>,
  options = { maxRetries: RETRY_CONFIG.MAX_ATTEMPTS }
): Promise<T> {
  let lastError: Error | null = null

  for (let i = 0; i < options.maxRetries; i++) {
    try {
      return await fetcher()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (i < options.maxRetries - 1) {
        const delay = Math.min(
          RETRY_CONFIG.INITIAL_DELAY *
            Math.pow(
              RETRY_CONFIG.BACKOFF_MULTIPLIER,
              i
            ),
          RETRY_CONFIG.MAX_DELAY
        )
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}
