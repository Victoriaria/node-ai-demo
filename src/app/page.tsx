'use client'

import React, { useCallback, useState } from 'react'
import { RiskDecision } from '@/types/audit'
import { useAuditState } from '@/hooks/useAuditState'
import { useMessages } from '@/hooks/useMessages'
import { useLogs } from '@/hooks/useLogs'
import { useAuditAPI } from '@/hooks/useAuditAPI'
import { Header } from '@/components/audit/Header'
import { ChatPanel } from '@/components/audit/ChatPanel'
import { RiskDashboard } from '@/components/audit/RiskDashboard'
import { FuseDialog } from '@/components/audit/FuseDialog'
import { ArchitectureDialog } from '@/components/audit/ArchitectureDialog'
import { getMessage } from '@/constants/messages'

export default function ComplianceEngine() {
  const [isChinese, setIsChinese] = useState(true)
  const [showArchitecture, setShowArchitecture] = useState(false)

  const auditState = useAuditState()
  const messagesState = useMessages()
  const { logs, info, warning, error, success } = useLogs()
  const auditAPI = useAuditAPI()

  // 处理发送消息
  const handleSend = useCallback(async () => {
    const input = messagesState.input
    if (!input.trim()) return
    if (auditAPI.loading) return

    const originalInput = input
    messagesState.clearInput()
    messagesState.addMessage(originalInput, 'user')
    
    info(
      `${getMessage('LOG_ANALYSIS_START', isChinese ? 'zh' : 'en')}: ${originalInput.substring(0, 50)}...`
    )

    try {
      const result = await auditAPI.call(originalInput)
      console.log('🎯 API调用成功，结果:', result)
      console.log('📊 风险评分:', result.score)
      console.log('🎭 决策:', result.decision)
      console.log('💬 AI回复长度:', result.ai_response?.length)

      auditState.updateAssessment(result)
      console.log('✅ 状态已更新')

      if (result.mode === 'AUDIT') {
        warning(getMessage('LOG_AUDIT_MODE', isChinese ? 'zh' : 'en'))
      }

      if (result.decision === RiskDecision.HALT) {
        auditState.triggerFuse(result.reason)
        error(getMessage('LOG_FUSE_TRIGGERED', isChinese ? 'zh' : 'en'))
      }

      console.log('📝 准备添加AI回复:', result.ai_response?.substring(0, 100))
      const addedMessage = messagesState.addMessage(result.ai_response, 'ai')
      console.log('✅ AI回复已添加到消息列表, ID:', addedMessage.id)
      console.log('📋 当前消息总数:', messagesState.messages.length)
      
      success('审计完成')
    } catch (err) {
      console.error('❌ API调用失败:', err)
      const errorMsg = err instanceof Error ? err.message : '未知错误'
      error(`处理失败: ${errorMsg}`)
      messagesState.addMessage(
        getMessage('ERROR_SYSTEM_ERROR', isChinese ? 'zh' : 'en'),
        'ai'
      )
    }
  }, [
    messagesState.input,
    messagesState.clearInput,
    messagesState.addMessage,
    auditAPI.loading,
    auditAPI.call,
    auditState.updateAssessment,
    auditState.triggerFuse,
    info,
    warning,
    error,
    success,
    isChinese,
  ])

  const handleSimulateAttack = useCallback(() => {
    const attackMessage = getMessage(
      'SIMULATE_ATTACK_MESSAGE',
      isChinese ? 'zh' : 'en'
    )
    messagesState.setInput(attackMessage)
    setTimeout(() => handleSend(), 100)
  }, [messagesState, handleSend, isChinese])

  const handleResetFuse = useCallback(() => {
    auditState.resetFuse()
    info(getMessage('LOG_FUSE_RESET', isChinese ? 'zh' : 'en'))
  }, [auditState.resetFuse, info, isChinese])

  return (
    <div
      className={`min-h-screen bg-[#0a0a1a] transition-colors duration-500 ${
        auditState.mode === 'AUDIT' ? 'bg-black' : ''
      }`}
    >
      {auditState.isFuseActive && (
        <div className="fixed inset-0 bg-[#ff4d4d]/30 animate-pulse z-40" />
      )}

      <div className="container mx-auto px-4 py-6 relative">
        <Header
          isChinese={isChinese}
          onLanguageChange={() => setIsChinese(!isChinese)}
          onSimulateAttack={handleSimulateAttack}
          onViewArchitecture={() => setShowArchitecture(true)}
          isLoading={auditAPI.loading}
        />

        <div className="flex flex-col lg:flex-row gap-6 relative z-10">
          <ChatPanel
            messages={messagesState.messages}
            input={messagesState.input}
            isLoading={auditAPI.loading}
            onSend={handleSend}
            onInputChange={messagesState.setInput}
            isChinese={isChinese}
            mode={auditState.mode}
          />

          <RiskDashboard
            riskScore={auditState.riskScore}
            decision={auditState.decision}
            thoughtChain={auditState.thoughtChain}
            logs={logs}
            mode={auditState.mode}
            isChinese={isChinese}
          />
        </div>
      </div>

      <FuseDialog
        open={auditState.showFuseDialog}
        reason={auditState.currentRiskReason}
        thoughtChain={auditState.thoughtChain}
        onConfirm={handleResetFuse}
        isChinese={isChinese}
      />

      <ArchitectureDialog
        open={showArchitecture}
        onClose={() => setShowArchitecture(false)}
        isChinese={isChinese}
      />

      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none z-0"></div>
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-500/10 to-transparent blur-3xl pointer-events-none z-0"></div>
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-0">
        <svg
          className="w-full h-full"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="rgba(13, 13, 33, 0.6)"
            fillOpacity="1"
            d="M0,192L48,181.3C96,171,192,149,288,149.3C384,149,480,171,576,170.7C672,171,768,149,864,144C960,139,1056,149,1152,160C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
    </div>
  )
}
