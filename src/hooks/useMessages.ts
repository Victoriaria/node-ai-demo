/**
 * NODE AI 审计系统 - 消息管理 Hook
 */
'use client'

import { useState, useCallback } from 'react'
import { Message } from '@/types/audit'
import { LIMITS } from '@/constants/config'

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')

  // 添加消息
  const addMessage = useCallback(
    (content: string, sender: 'user' | 'ai'): Message => {
      const message: Message = {
        id: crypto?.randomUUID?.() || Date.now().toString(),
        content,
        sender,
        timestamp: new Date(),
      }

      setMessages((prev) => {
        const updated = [...prev, message]
        console.log('✅ 消息已添加:', { sender, id: message.id, totalMessages: updated.length })
        // 保留最多 MAX_MESSAGES 条
        return updated.slice(-LIMITS.MAX_MESSAGES)
      })

      return message
    },
    []
  )

  // 清空消息
  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  // 更新输入框
  const handleInputChange = useCallback(
    (value: string) => {
      setInput(value)
    },
    []
  )

  // 清空输入框
  const clearInput = useCallback(() => {
    setInput('')
  }, [])

  // 获取最后一条消息
  const getLastMessage = useCallback((): Message | undefined => {
    return messages[messages.length - 1]
  }, [messages])

  return {
    messages,
    input,
    addMessage,
    clearMessages,
    setInput: handleInputChange,
    clearInput,
    getLastMessage,
  }
}
