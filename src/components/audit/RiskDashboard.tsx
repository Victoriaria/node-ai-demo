/**
 * NODE AI 审计系统 - 风险仪表盘组件
 */
'use client'

import { LogEntry, RiskDecision } from '@/types/audit'
import { Clock } from 'lucide-react'
import { RISK_COLORS, RISK_TEXT_MAP } from '@/constants/config'
import { getMessage } from '@/constants/messages'

interface RiskDashboardProps {
  riskScore: number | null
  decision: RiskDecision
  thoughtChain: string[]
  logs: LogEntry[]
  mode: 'NORMAL' | 'AUDIT'
  isChinese: boolean
}

function getRiskColor(
  score: number | null,
  decision?: RiskDecision
): string {
  if (decision === RiskDecision.INFO_REQUIRED)
    return RISK_COLORS.INFO_REQUIRED
  if (score === null) return RISK_COLORS.UNKNOWN
  if (score >= 80) return RISK_COLORS.HIGH
  if (score >= 50) return RISK_COLORS.MEDIUM
  return RISK_COLORS.LOW
}

export function RiskDashboard({
  riskScore,
  decision,
  thoughtChain,
  logs,
  mode,
  isChinese,
}: RiskDashboardProps) {
  return (
    <div className="lg:w-[350px] flex flex-col gap-4">
      {/* Risk Score半圆仪表盘 */}
      <div className="rounded-lg p-4 bg-gray-900/80 border border-gray-800 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-white">
            {getMessage(
              'RISK_SCORE_LABEL',
              isChinese ? 'zh' : 'en'
            )}
          </h3>
          <span className="text-xs text-white/70">
            {getMessage(
              'RISK_DETECTION',
              isChinese ? 'zh' : 'en'
            )}
          </span>
        </div>
        <div className="relative h-48 flex items-center justify-center">
          {/* 半圆背景 */}
          <svg className="w-full h-full" viewBox="0 0 100 60">
            {/* 背景轨道 */}
            <path
              d="M 10,50 A 40,40 0 0,1 90,50"
              stroke="#16213e"
              strokeWidth="10"
              fill="none"
            />
            {/* 进度弧 */}
            {(() => {
              const pct =
                riskScore === null ? 0 : riskScore / 100
              const angle = Math.PI * pct
              const cx = 50,
                cy = 50,
                r = 40
              const ex = cx - r * Math.cos(angle)
              const ey = cy - r * Math.sin(angle)
              const largeArc = pct > 0.5 ? 1 : 0
              return pct > 0 ? (
                <path
                  d={`M 10,50 A 40,40 0 ${largeArc},1 ${ex.toFixed(
                    2
                  )},${ey.toFixed(2)}`}
                  stroke={getRiskColor(
                    riskScore,
                    decision
                  )}
                  strokeWidth="10"
                  fill="none"
                  strokeLinecap="round"
                />
              ) : null
            })()}
          </svg>
          {/* 中心文字 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className={`text-4xl font-bold ${
                riskScore === null
                  ? 'text-blue-400'
                  : riskScore >= 80
                    ? 'text-risk-high'
                    : riskScore >= 50
                      ? 'text-risk-medium'
                      : 'text-risk-low'
              }`}
            >
              {decision ===
              RiskDecision.INFO_REQUIRED ? (
                isChinese ? (
                  '需补充信息'
                ) : (
                  'Info Required'
                )
              ) : riskScore === null ? (
                isChinese ? (
                  '待审计'
                ) : (
                  'Pending'
                )
              ) : (
                riskScore
              )}
            </span>
            <span className="text-sm text-gray-400">
              {riskScore !== null && '/100'}
            </span>
          </div>
        </div>
        <div className="mt-4 text-center">
          <span
            className={`text-sm font-medium ${
              riskScore === null
                ? 'text-blue-400'
                : riskScore >= 80
                  ? 'text-risk-high'
                  : riskScore >= 50
                    ? 'text-risk-medium'
                    : 'text-risk-low'
            }`}
          >
            {decision ===
            RiskDecision.INFO_REQUIRED ? (
              getMessage(
                'RISK_LEVEL_INFO_REQUIRED',
                isChinese ? 'zh' : 'en'
              )
            ) : riskScore === null ? (
              isChinese ? '等待输入' : 'Waiting for Input'
            ) : riskScore >= 80 ? (
              getMessage(
                'RISK_LEVEL_HIGH',
                isChinese ? 'zh' : 'en'
              )
            ) : riskScore >= 50 ? (
              getMessage(
                'RISK_LEVEL_MED',
                isChinese ? 'zh' : 'en'
              )
            ) : (
              getMessage(
                'RISK_LEVEL_LOW',
                isChinese ? 'zh' : 'en'
              )
            )}
          </span>
        </div>
      </div>

      {/* Thought Chain垂直时间线 */}
      <div className="rounded-lg p-4 bg-gray-900/80 border border-gray-800 flex-1 overflow-y-auto shadow-lg">
        <h3 className="text-sm font-semibold text-white mb-4">
          {getMessage(
            'THOUGHT_CHAIN',
            isChinese ? 'zh' : 'en'
          )}
        </h3>
        <div className="space-y-4">
          {thoughtChain.map((thought, index) => (
            <div key={`${index}-${thought}`} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`w-2 h-2 rounded-full ${
                    index === 0 ? 'bg-[#00f2ff]' : 'bg-gray-600'
                  }`}
                />
                {index < thoughtChain.length - 1 && (
                  <div className="w-px h-full bg-gray-600 mt-1" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-white">
                  {thought}
                </p>
              </div>
            </div>
          ))}
          {thoughtChain.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="flex gap-2 mb-2">
                <div
                  className="w-2 h-2 rounded-full bg-[#00f2ff] animate-pulse"
                  style={{ animationDelay: '0ms' }}
                />
                <div
                  className="w-2 h-2 rounded-full bg-[#00f2ff] animate-pulse"
                  style={{ animationDelay: '200ms' }}
                />
                <div
                  className="w-2 h-2 rounded-full bg-[#00f2ff] animate-pulse"
                  style={{ animationDelay: '400ms' }}
                />
              </div>
              <p className="text-sm text-gray-400">
                {getMessage(
                  'NO_THOUGHT_DATA',
                  isChinese ? 'zh' : 'en'
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 实时日志流 */}
      <div className="rounded-lg p-4 bg-gray-900/80 border border-gray-800 h-48 overflow-y-auto shadow-lg">
        <h3 className="text-sm font-semibold text-white mb-2">
          {getMessage(
            'REAL_TIME_LOGS',
            isChinese ? 'zh' : 'en'
          )}
        </h3>
        <div className="space-y-1">
          {logs.map((log, index) => {
            const timeStr = log.timestamp
              ? new Date(log.timestamp).toLocaleTimeString('zh-CN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })
              : 'N/A';
            return (
              <div
                key={log.id || `log-${index}-${log.timestamp || Date.now()}`}
                className="flex items-start gap-2 text-xs"
              >
                <Clock className="h-3 w-3 mt-0.5 text-gray-400 flex-shrink-0" />
                <span className="text-gray-400 whitespace-nowrap">
                  {timeStr}
                </span>
                <span
                  className={`font-medium ${
                    log.level === 'ERROR'
                      ? 'text-[#ff4d4d]'
                      : log.level === 'WARNING'
                        ? 'text-yellow-400'
                        : log.level === 'SUCCESS'
                          ? 'text-[#00ff88]'
                          : 'text-gray-400'
                  }`}
                >
                  [{log.level}]
                </span>
                <span className="flex-1 text-white">
                  {log.message}
                </span>
              </div>
            );
          })}
          {logs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="flex gap-2 mb-2">
                <div
                  className="w-2 h-2 rounded-full bg-[#00f2ff] animate-pulse"
                  style={{ animationDelay: '0ms' }}
                />
                <div
                  className="w-2 h-2 rounded-full bg-[#00f2ff] animate-pulse"
                  style={{ animationDelay: '200ms' }}
                />
                <div
                  className="w-2 h-2 rounded-full bg-[#00f2ff] animate-pulse"
                  style={{ animationDelay: '400ms' }}
                />
              </div>
              <p className="text-sm text-gray-400">
                {getMessage(
                  'NO_LOG_DATA',
                  isChinese ? 'zh' : 'en'
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
