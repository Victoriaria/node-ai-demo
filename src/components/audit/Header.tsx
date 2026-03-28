/**
 * NODE AI 审计系统 - 头部组件
 */
'use client'

import { Button } from '@/components/ui/button'
import { AlertTriangle, FileText } from 'lucide-react'
import { getMessage } from '@/constants/messages'

interface HeaderProps {
  isChinese: boolean
  onLanguageChange: () => void
  onSimulateAttack: () => void
  onViewArchitecture?: () => void
  isLoading: boolean
}

export function Header({
  isChinese,
  onLanguageChange,
  onSimulateAttack,
  onViewArchitecture,
  isLoading,
}: HeaderProps) {
  return (
    <header className="flex justify-between items-center mb-6 pb-4">
      <div className="flex items-center gap-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-8 w-8 text-blue-400"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          <text
            x="12"
            y="15"
            textAnchor="middle"
            fontSize="10"
            fontWeight="bold"
            fill="currentColor"
          >
            N
          </text>
        </svg>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {getMessage('APP_TITLE', isChinese ? 'zh' : 'en')}
          </h1>
          <p className="text-xs text-gray-300">
            {getMessage(
              'APP_SUBTITLE',
              isChinese ? 'zh' : 'en'
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* 查看系统架构按钮 */}
        {onViewArchitecture && (
          <Button
            variant="outline"
            onClick={onViewArchitecture}
            className="flex items-center gap-2 border border-blue-800/50 text-white hover:bg-blue-900/30"
          >
            <FileText className="h-4 w-4" />
            {isChinese ? '查看系统架构' : 'View Architecture'}
          </Button>
        )}

        {/* 中英文切换按钮 */}
        <Button
          variant="outline"
          onClick={onLanguageChange}
          className="flex items-center gap-2 border border-blue-800/50 text-white hover:bg-blue-900/30"
        >
          {getMessage('EN_BUTTON', isChinese ? 'zh' : 'en')}
        </Button>

        {/* 模拟高风险攻击按钮 */}
        <Button
          variant="destructive"
          onClick={onSimulateAttack}
          disabled={isLoading}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-400 text-white disabled:opacity-50"
        >
          <AlertTriangle className="h-4 w-4" />
          {getMessage('SIMULATE_ATTACK', isChinese ? 'zh' : 'en')}
        </Button>
      </div>
    </header>
  )
}
