/**
 * NODE AI 审计系统 - 审计状态 Hook
 */
'use client'

import { useState, useCallback } from 'react'
import {
  AuditState,
  RiskAssessment,
  RiskDecision,
  AuditMode,
} from '@/types/audit'

export function useAuditState() {
  const [auditState, setAuditState] = useState<AuditState>({
    riskScore: null,
    mode: AuditMode.NORMAL,
    decision: RiskDecision.ALLOW,
    thoughtChain: [],
    currentRiskReason: '',
    isFuseActive: false,
    showFuseDialog: false,
  })

  // 更新评估结果
  const updateAssessment = useCallback(
    (assessment: RiskAssessment) => {
      console.log('🔄 updateAssessment 被调用，数据:', assessment)
      console.log('📊 score:', assessment.score, '类型:', typeof assessment.score)
      
      setAuditState((prev) => {
        const newState = {
          ...prev,
          riskScore: assessment.score,
          mode: assessment.mode,
          decision: assessment.decision,
          thoughtChain: assessment.thought_chain,
          currentRiskReason: assessment.reason,
        }
        console.log('✅ 新状态:', newState)
        return newState
      })
    },
    []
  )

  // 触发熔断
  const triggerFuse = useCallback((reason: string) => {
    setAuditState((prev) => ({
      ...prev,
      isFuseActive: true,
      showFuseDialog: true,
      currentRiskReason: reason,
    }))
  }, [])

  // 重置熔断
  const resetFuse = useCallback(() => {
    setAuditState((prev) => ({
      ...prev,
      isFuseActive: false,
      showFuseDialog: false,
    }))
  }, [])

  // 关闭弹窗
  const closeDialog = useCallback(() => {
    setAuditState((prev) => ({
      ...prev,
      showFuseDialog: false,
    }))
  }, [])

  // 重置所有状态
  const reset = useCallback(() => {
    setAuditState({
      riskScore: null,
      mode: AuditMode.NORMAL,
      decision: RiskDecision.ALLOW,
      thoughtChain: [],
      currentRiskReason: '',
      isFuseActive: false,
      showFuseDialog: false,
    })
  }, [])

  return {
    ...auditState,
    updateAssessment,
    triggerFuse,
    resetFuse,
    closeDialog,
    reset,
  }
}
