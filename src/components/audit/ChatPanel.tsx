/**
 * NODE AI 审计系统 - 聊天面板组件
 */
'use client'

import { Message } from '@/types/audit'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Zap, MessageSquare } from 'lucide-react'
import { getMessage } from '@/constants/messages'

interface ChatPanelProps {
  messages: Message[]
  input: string
  isLoading: boolean
  onSend: () => void
  onInputChange: (value: string) => void
  isChinese: boolean
  mode: 'NORMAL' | 'AUDIT'
}

export function ChatPanel({
  messages,
  input,
  isLoading,
  onSend,
  onInputChange,
  isChinese,
  mode,
}: ChatPanelProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className="lg:flex-1 flex flex-col rounded-lg overflow-hidden bg-gray-900/80 border border-gray-800 shadow-lg min-h-[600px]">
      {/* 对话标题 */}
      <div className="p-4 border-b border-gray-800 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-blue-400" />
        <h2 className="font-semibold text-white">
          {getMessage('CHAT_AREA', isChinese ? 'zh' : 'en')}
        </h2>
        <span className="ml-auto text-xs text-gray-400">
          {mode === 'AUDIT' ? (
            <span className="text-white/70">
              {getMessage(
                'AUDIT_MODE',
                isChinese ? 'zh' : 'en'
              )}
            </span>
          ) : (
            getMessage('NORMAL_MODE', isChinese ? 'zh' : 'en')
          )}
        </span>
      </div>

      {/* 对话内容 */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === 'user'
                  ? 'justify-end'
                  : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-blue-500/80 text-white'
                    : 'bg-blue-900/80 text-white border border-blue-800/50'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="flex gap-2 mb-3">
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
                'CHAT_INSTRUCTION',
                isChinese ? 'zh' : 'en'
              )}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {getMessage(
                'CHAT_DETAIL',
                isChinese ? 'zh' : 'en'
              )}
            </p>
          </div>
        )}
      </div>

      {/* 输入区域 */}
      <div className="p-4 border-t border-gray-800">
        <Textarea
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={getMessage(
            'CHAT_PLACEHOLDER',
            isChinese ? 'zh' : 'en'
          )}
          className="min-h-[100px] resize-none bg-gray-800/50 border border-gray-700 text-white placeholder-white/70"
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <div className="flex justify-end mt-2">
          <Button
            onClick={onSend}
            disabled={isLoading || !input.trim()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50"
          >
            <Zap className="h-4 w-4" />
            {getMessage('SEND', isChinese ? 'zh' : 'en')}
          </Button>
        </div>
      </div>
    </div>
  )
}
