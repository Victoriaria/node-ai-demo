/**
 * NODE AI 审计系统 - 多语言消息
 */

export const MESSAGES = {
  zh: {
    // 标题和描述
    APP_TITLE: 'NODE AI',
    APP_SUBTITLE: '出海金融AI原生合规风控平台',

    // 按钮
    SEND: '发送',
    CONFIRM_RESET: '确认并重置',
    EN_BUTTON: 'EN',

    // 模式相关
    NORMAL_MODE: '正常模式',
    AUDIT_MODE: '审计模式',

    // 风险评级
    RISK_SCORE_LABEL: '风险评分',
    RISK_DETECTION: '出海业务合规度检测',
    RISK_LEVEL_HIGH: '高风险',
    RISK_LEVEL_MED: '中风险',
    RISK_LEVEL_LOW: '低风险',
    RISK_LEVEL_INFO_REQUIRED: '需补充信息',
    SERVICE_ERROR: '服务异常',

    // 聊天区域
    CHAT_AREA: 'AI 对话区',
    CHAT_PLACEHOLDER: '请输入出海业务咨询或粘贴金融交易流水进行合规审计...',
    CHAT_INSTRUCTION: '开始与 NODE AI 对话',
    CHAT_DETAIL: '输入出海业务咨询或粘贴金融交易流水',

    // 思考链
    THOUGHT_CHAIN: '思考链',
    NO_THOUGHT_DATA: '暂无思考链数据',

    // 日志
    REAL_TIME_LOGS: '实时日志',
    NO_LOG_DATA: '暂无日志数据',

    // 日志消息
    LOG_ANALYSIS_START: '正在分析',
    LOG_API_FAILED: 'API调用失败',
    LOG_RESPONSE_PARSE_ERROR: '解析响应失败',
    LOG_RESPONSE_FORMAT_ERROR: 'API响应格式异常',
    LOG_API_ERROR: 'API返回错误',
    LOG_ANALYSIS_COMPLETE: '分析完成',
    LOG_AUDIT_MODE: '系统进入审计模式',
    LOG_FUSE_TRIGGERED: '触发风险拦截，系统熔断',
    LOG_FUSE_RESET: '系统熔断已重置',
    LOG_ENGINE_START: 'NODE AI 合规审计引擎已启动',
    LOG_SYSTEM_READY: '系统就绪，等待用户输入',

    // 错误消息
    ERROR_RESPONSE_PARSE: '解析响应失败',
    ERROR_API_CONNECTION: '【系统预警】审计服务连接失败',
    ERROR_API_RESPONSE_EMPTY: '审计服务连接失败，请稍后再试。我们的技术团队正在处理，请耐心等待。',
    ERROR_INVALID_CONFIG: '环境变量未配置 (COZE_API_KEY / COZE_BOT_ID)',
    ERROR_STREAM_READ: '无法读取响应流',
    ERROR_NO_AI_RESPONSE: '未获取到AI回复内容，请检查Bot ID是否正确',
    ERROR_SYSTEM_ERROR: '审计服务异常，请稍后再试',
    ERROR_UNKNOWN: '未知错误',
    ERROR_SERVICE_EXCEPTION: '服务异常',

    // 弹窗相关
    FUSE_TITLE: 'NODE AI 风险拦截',
    FUSE_DESCRIPTION: '系统检测到高风险交易模式，已自动触发熔断机制',
    FUSE_REASON: '风险原因',
    FUSE_THOUGHT_CHAIN: '思考链',

    // 测试按钮
    SIMULATE_ATTACK: '模拟高风险攻击',
    SIMULATE_ATTACK_MESSAGE: '这是一个高风险攻击测试，模拟洗钱交易行为',
  },
  en: {
    // 标题和描述
    APP_TITLE: 'NODE AI',
    APP_SUBTITLE: 'Global Finance AI Native Compliance Risk Control Platform',

    // 按钮
    SEND: 'Send',
    CONFIRM_RESET: 'Confirm and Reset',
    EN_BUTTON: '中',

    // 模式相关
    NORMAL_MODE: 'Normal Mode',
    AUDIT_MODE: 'Audit Mode',

    // 风险评级
    RISK_SCORE_LABEL: 'Risk Score',
    RISK_DETECTION: 'Global Business Compliance Detection',
    RISK_LEVEL_HIGH: 'High Risk',
    RISK_LEVEL_MED: 'Medium Risk',
    RISK_LEVEL_LOW: 'Low Risk',
    RISK_LEVEL_INFO_REQUIRED: 'Info Required',
    SERVICE_ERROR: 'Service Error',

    // 聊天区域
    CHAT_AREA: 'AI Chat Area',
    CHAT_PLACEHOLDER: 'Please enter global business inquiries or paste financial transaction flows for compliance audit...',
    CHAT_INSTRUCTION: 'Start chatting with NODE AI',
    CHAT_DETAIL: 'Enter global business inquiries or paste financial transaction flows',

    // 思考链
    THOUGHT_CHAIN: 'Thought Chain',
    NO_THOUGHT_DATA: 'No thought chain data',

    // 日志
    REAL_TIME_LOGS: 'Real-time Logs',
    NO_LOG_DATA: 'No log data',

    // 日志消息
    LOG_ANALYSIS_START: 'Analyzing',
    LOG_API_FAILED: 'API call failed',
    LOG_RESPONSE_PARSE_ERROR: 'Failed to parse response',
    LOG_RESPONSE_FORMAT_ERROR: 'API response format error',
    LOG_API_ERROR: 'API returned error',
    LOG_ANALYSIS_COMPLETE: 'Analysis complete',
    LOG_AUDIT_MODE: 'System entered audit mode',
    LOG_FUSE_TRIGGERED: 'Risk interception triggered, system circuit breaker activated',
    LOG_FUSE_RESET: 'System circuit breaker reset',
    LOG_ENGINE_START: 'NODE AI compliance audit engine started',
    LOG_SYSTEM_READY: 'System ready, waiting for user input',

    // 错误消息
    ERROR_RESPONSE_PARSE: 'Failed to parse response',
    ERROR_API_CONNECTION: '[System Alert] Audit service connection failed',
    ERROR_API_RESPONSE_EMPTY: 'Audit service connection failed. Please try again later. Our technical team is working on it.',
    ERROR_INVALID_CONFIG: 'Environment variables not configured (COZE_API_KEY / COZE_BOT_ID)',
    ERROR_STREAM_READ: 'Unable to read response stream',
    ERROR_NO_AI_RESPONSE: 'No AI response received, please check if Bot ID is correct',
    ERROR_SYSTEM_ERROR: 'Audit service error, please try again later',
    ERROR_UNKNOWN: 'Unknown error',
    ERROR_SERVICE_EXCEPTION: 'Service exception',

    // 弹窗相关
    FUSE_TITLE: 'NODE AI Risk Interception',
    FUSE_DESCRIPTION: 'System detected high-risk transaction pattern, automatic circuit breaker triggered',
    FUSE_REASON: 'Risk Reason',
    FUSE_THOUGHT_CHAIN: 'Thought Chain',

    // 测试按钮
    SIMULATE_ATTACK: 'Simulate High Risk Attack',
    SIMULATE_ATTACK_MESSAGE: 'This is a high-risk attack test simulating money laundering transaction behavior',
  },
} as const

export type MessageKey = keyof typeof MESSAGES.zh

/**
 * 获取消息
 */
export function getMessage(key: MessageKey, lang: 'zh' | 'en' = 'zh'): string {
  return MESSAGES[lang][key] || MESSAGES.zh[key] || ''
}
