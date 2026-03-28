// src/hooks/useLogs.ts
import { useState, useCallback, useRef, useEffect } from 'react';

const MAX_LOGS = 100;

export const useLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const hasInitialized = useRef(false);

  const addLog = useCallback((newLog: any) => {
    setLogs((prev) => [newLog, ...prev].slice(0, MAX_LOGS));
  }, []);

  const createLog = useCallback((level: string, message: string, data?: any) => {
    const now = new Date();
    return {
      id: `${level}-${now.getTime()}-${Math.random().toString(36).slice(2)}`, // 保证唯一 id
      timestamp: now.toISOString(),
      level,
      message,
      data,
    };
  }, []);

  const info = useCallback((message: string, data?: any) => {
    const logEntry = createLog('INFO', message, data);
    addLog(logEntry);
    console.log(`[INFO] ${message}`, data || '');
  }, [createLog, addLog]);

  const warning = useCallback((message: string, data?: any) => {
    const logEntry = createLog('WARNING', message, data);
    addLog(logEntry);
    console.warn(`[WARNING] ${message}`, data || '');
  }, [createLog, addLog]);

  const error = useCallback((message: string, data?: any) => {
    const logEntry = createLog('ERROR', message, data);
    addLog(logEntry);
    console.error(`[ERROR] ${message}`, data || '');
  }, [createLog, addLog]);

  const success = useCallback((message: string, data?: any) => {
    const logEntry = createLog('SUCCESS', message, data);
    addLog(logEntry);
    console.log(`[SUCCESS] ${message}`, data || '');
  }, [createLog, addLog]);

  // 初始化日志 - 必须在 useEffect 中，避免渲染时更新
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    info("NODE AI 合规审计引擎已启动");
    info("System ready, waiting for user input");
  }, [info]);

  return { logs, info, warning, error, success, addLog };
};
