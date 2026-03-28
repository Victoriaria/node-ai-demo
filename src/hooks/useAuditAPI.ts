/**
 * NODE AI 审计系统 - API 调用 Hook
 */
'use client'

import { useState, useCallback } from 'react'
import { RiskAssessment } from '@/types/audit'
import { callCozeAPI } from '@/lib/apiClient'
import { handleApiError } from '@/lib/errorHandler'
import { logger } from '@/lib/logger'

interface UseAuditAPIState {
  loading: boolean
  error: string | null
  data: RiskAssessment | null
}

export function useAuditAPI() {
  const [state, setState] = useState<UseAuditAPIState>({
    loading: false,
    error: null,
    data: null,
  })

  // 调用 API
  const call = useCallback(
    async (input: string): Promise<RiskAssessment> => {
      setState({
        loading: true,
        error: null,
        data: null,
      })

      try {
        logger.info(`开始审计: ${input.substring(0, 50)}...`)

        const result = await callCozeAPI(input)

        setState({
          loading: false,
          error: null,
          data: result,
        })

        logger.success('审计完成')
        return result
      } catch (err) {
        const errorResult = handleApiError(err)

        setState({
          loading: false,
          error: err instanceof Error ? err.message : '未知错误',
          data: errorResult,
        })

        return errorResult
      }
    },
    []
  )

  // 重置状态
  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      data: null,
    })
  }, [])

  // 清空错误
  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }))
  }, [])

  return {
    ...state,
    call,
    reset,
    clearError,
  }
}
