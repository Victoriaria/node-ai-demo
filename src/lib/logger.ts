/**
 * NODE AI 审计系统 - 日志工具
 */
import { LogLevel, LogEntry } from '@/types/audit'

/**
 * 日志管理类
 */
export class Logger {
  private logs: LogEntry[] = []
  private maxLogs: number = 50

  constructor(maxLogs: number = 50) {
    this.maxLogs = maxLogs
  }

  /**
   * 添加日志
   */
  log(level: LogLevel, message: string): LogEntry {
    const entry: LogEntry = {
      id: this.generateId(),
      message,
      timestamp: new Date(),
      level,
    }

    this.logs.unshift(entry) // 新日志放在最前面
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs)
    }

    // 同时输出到控制台
    this.consoleLog(level, message)

    return entry
  }

  /**
   * 信息级别日志
   */
  info(message: string): LogEntry {
    return this.log(LogLevel.INFO, message)
  }

  /**
   * 警告级别日志
   */
  warning(message: string): LogEntry {
    return this.log(LogLevel.WARNING, message)
  }

  /**
   * 错误级别日志
   */
  error(message: string): LogEntry {
    return this.log(LogLevel.ERROR, message)
  }

  /**
   * 成功级别日志
   */
  success(message: string): LogEntry {
    return this.log(LogLevel.SUCCESS, message)
  }

  /**
   * 获取所有日志
   */
  getLogs(): LogEntry[] {
    return [...this.logs]
  }

  /**
   * 清空日志
   */
  clear(): void {
    this.logs = []
  }

  /**
   * 生成唯一 ID
   */
  private generateId(): string {
    return crypto?.randomUUID?.() || Date.now().toString()
  }

  /**
   * 输出到控制台
   */
  private consoleLog(level: LogLevel, message: string): void {
    const emoji = {
      [LogLevel.INFO]: 'ℹ️',
      [LogLevel.WARNING]: '⚠️',
      [LogLevel.ERROR]: '❌',
      [LogLevel.SUCCESS]: '✅',
    }[level]

    const style = {
      [LogLevel.INFO]: 'color: #0066ff; font-weight: bold',
      [LogLevel.WARNING]: 'color: #ffaa00; font-weight: bold',
      [LogLevel.ERROR]: 'color: #ff4d4d; font-weight: bold',
      [LogLevel.SUCCESS]: 'color: #00ff88; font-weight: bold',
    }[level]

    console.log(
      `%c${emoji} [${level.toUpperCase()}] ${message}`,
      style
    )
  }
}

// 创建全局日志实例
export const logger = new Logger(50)
