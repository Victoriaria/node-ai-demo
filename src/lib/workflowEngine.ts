/**
 * NODE AI 本地工作流引擎
 * 替代 Coze Workflow，实现完全本地化的审计流程
 */

import { fraudCaseDatabase } from './fraudCaseDatabase';

// 工作流节点类型
export type WorkflowNodeType = 'start' | 'qa' | 'condition' | 'llm' | 'end';

// 工作流上下文
export interface WorkflowContext {
  input: string;
  riskScore: number | null;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'UNDETERMINED';
  decision: 'ALLOW' | 'WARN' | 'HALT' | 'INFO_REQUIRED';
  reason: string;
  thoughtChain: string[];
  matchedCases: string[];
  keywords: string[];
  mode: 'NORMAL' | 'AUDIT';
}

// 关键词库
const KEYWORD_DATABASE = {
  // 高风险关键词（权重 10-15）
  CRITICAL: [
    'JD', '换汇', '拆单', '代收款', '洗钱', '诈骗', '黑钱', '帮信',
    '非法', '缅甸', '柬埔寨', '刷单', '返利', '佣金', '测试资金',
    '众包平台', '任务', '高频对倒', '套利', '账户接管', 'ATO',
    '规避', '阈值', '限额', '分成', '多笔', '连续'
  ],
  
  // 中风险关键词（权重 5-8）
  HIGH: [
    '跨境', '大额', '转账', '频繁', '异常', '可疑', '境外',
    '小额', '接近', '汇率', '波动', '美元', '欧元', '人民币'
  ],
  
  // 低风险关键词（权重 2-4）
  MEDIUM: [
    '支付', '汇款', '收款', '账户', '余额', '提现', '手续费'
  ]
};

/**
 * 工作流引擎类
 */
export class WorkflowEngine {
  private context: WorkflowContext;

  constructor(input: string) {
    this.context = {
      input,
      riskScore: null,
      riskLevel: 'UNDETERMINED',
      decision: 'ALLOW',
      reason: '',
      thoughtChain: [],
      matchedCases: [],
      keywords: [],
      mode: 'NORMAL'
    };
  }

  /**
   * 执行完整工作流
   */
  async execute(): Promise<WorkflowContext> {
    this.context.thoughtChain.push('🚀 启动审计工作流');

    // 节点1: 问答节点 - 提取关键词
    await this.qaNode();

    // 节点2: 条件分支 - 判断风险等级
    const branch = this.conditionNode();

    // 节点3: 大模型分析
    if (branch === 'high_risk') {
      await this.llmNodeHighRisk();
    } else if (branch === 'medium_risk') {
      await this.llmNodeMediumRisk();
    } else {
      await this.llmNodeLowRisk();
    }

    // 节点4: 结束节点 - 生成最终报告
    this.endNode();

    return this.context;
  }

  /**
   * 节点1: 问答节点 - 关键词提取与初步分析
   */
  private async qaNode(): Promise<void> {
    this.context.thoughtChain.push('📝 分析用户输入');

    const input = this.context.input.toLowerCase();
    const keywords: string[] = [];
    let totalWeight = 0;

    // 提取关键词并计算权重
    for (const [level, words] of Object.entries(KEYWORD_DATABASE)) {
      for (const word of words) {
        if (this.context.input.includes(word)) {
          keywords.push(word);
          
          // 计算权重
          if (level === 'CRITICAL') {
            totalWeight += 15;
          } else if (level === 'HIGH') {
            totalWeight += 8;
          } else if (level === 'MEDIUM') {
            totalWeight += 3;
          }
        }
      }
    }

    this.context.keywords = keywords;
    this.context.thoughtChain.push(`🔍 识别关键词: ${keywords.join('、') || '无'}`);

    // 匹配案例库
    const matchedCases = fraudCaseDatabase.matchCases(this.context.input);
    this.context.matchedCases = matchedCases.map(c => c.id);
    
    if (matchedCases.length > 0) {
      this.context.thoughtChain.push(`📚 匹配知险库: ${matchedCases.map(c => c.name).join('、')}`);
    }

    // 初步风险评分
    let baseScore = Math.min(totalWeight * 3, 100);
    
    // 案例库加成
    if (matchedCases.length > 0) {
      const maxCaseScore = Math.max(...matchedCases.map(c => c.baseScore));
      baseScore = Math.max(baseScore, maxCaseScore);
      
      // 如果匹配到 HALT 级别的案例，直接提升到 90+
      const hasHaltCase = matchedCases.some(c => c.decision === 'HALT');
      if (hasHaltCase && baseScore < 90) {
        baseScore = Math.max(baseScore, 92);
        this.context.thoughtChain.push('🚨 匹配到熔断级案例，风险评分提升');
      }
    }

    // 特殊规则：跨境+大额+转账/汇款 组合提升风险
    const hasCrossBorder = keywords.some(k => ['跨境', '境外'].includes(k));
    const hasTransfer = keywords.some(k => ['转账', '汇款', '支付'].includes(k));
    const hasAmount = /\d+/.test(this.context.input);
    
    if (hasCrossBorder && hasTransfer && hasAmount) {
      // 提取金额
      const amountMatch = this.context.input.match(/(\d+(?:\.\d+)?)\s*(万|千|美元|欧元|dollar)/);
      if (amountMatch) {
        const amount = parseFloat(amountMatch[1]);
        const unit = amountMatch[2];
        
        // 大额交易加分
        if ((unit === '万' && amount >= 1) || (unit.includes('美元') && amount >= 5000)) {
          baseScore = Math.min(baseScore + 20, 100);
          this.context.thoughtChain.push('⚠️ 检测到大额跨境交易，风险评分提升');
        } else if (amount >= 1000) {
          baseScore = Math.min(baseScore + 10, 100);
        }
      }
    }

    this.context.riskScore = baseScore;
    this.context.thoughtChain.push(`⚖️ 初步风险评分: ${baseScore}/100`);
  }

  /**
   * 节点2: 条件分支 - 根据风险评分分流
   */
  private conditionNode(): 'high_risk' | 'medium_risk' | 'low_risk' {
    const score = this.context.riskScore || 0;

    if (score >= 80) {
      this.context.riskLevel = 'CRITICAL';
      this.context.mode = 'AUDIT';
      this.context.thoughtChain.push('🚨 触发高风险分支');
      return 'high_risk';
    } else if (score >= 60) {
      this.context.riskLevel = 'HIGH';
      this.context.mode = 'AUDIT';
      this.context.thoughtChain.push('⚠️ 触发中风险分支');
      return 'medium_risk';
    } else {
      this.context.riskLevel = 'LOW';
      this.context.mode = 'NORMAL';
      this.context.thoughtChain.push('✅ 触发低风险分支');
      return 'low_risk';
    }
  }

  /**
   * 节点3a: 大模型节点 - 高风险分析
   */
  private async llmNodeHighRisk(): Promise<void> {
    this.context.thoughtChain.push('🔴 执行高风险深度分析');

    const matchedCases = fraudCaseDatabase.getCasesByIds(this.context.matchedCases);
    const score = this.context.riskScore || 0;

    // 检查是否缺少关键信息
    const missingInfo = this.checkMissingInfo();
    
    if (missingInfo.length > 0) {
      this.context.decision = 'INFO_REQUIRED';
      this.context.riskScore = null;
      this.context.riskLevel = 'UNDETERMINED';
      this.context.reason = `缺少核心交易要素，无法完成风险评定：${missingInfo.join('、')}`;
      this.context.thoughtChain.push('❓ 信息不足，需要补充材料');
      return;
    }

    // 高风险决策逻辑
    if (score >= 90) {
      this.context.decision = 'HALT';
      this.context.reason = this.generateHighRiskReason(matchedCases);
      this.context.thoughtChain.push('🛑 触发熔断规则: score >= 90');
      this.context.thoughtChain.push('决策: 立即拦截并人工复核');
    } else {
      this.context.decision = 'WARN';
      this.context.reason = this.generateMediumRiskReason(matchedCases);
      this.context.thoughtChain.push('⚠️ 触发警告规则: 60 <= score < 90');
      this.context.thoughtChain.push('决策: 强交互预警，需人工复核');
    }
  }

  /**
   * 节点3b: 大模型节点 - 中风险分析
   */
  private async llmNodeMediumRisk(): Promise<void> {
    this.context.thoughtChain.push('🟡 执行中风险分析');

    const matchedCases = fraudCaseDatabase.getCasesByIds(this.context.matchedCases);
    
    this.context.decision = 'WARN';
    this.context.reason = this.generateMediumRiskReason(matchedCases);
    this.context.thoughtChain.push('决策: 加强监控，建议人工抽查');
  }

  /**
   * 节点3c: 大模型节点 - 低风险分析
   */
  private async llmNodeLowRisk(): Promise<void> {
    this.context.thoughtChain.push('🟢 执行低风险分析');

    this.context.decision = 'ALLOW';
    this.context.reason = '未发现明显风险特征，交易正常';
    this.context.thoughtChain.push('决策: 允许交易');
  }

  /**
   * 节点4: 结束节点 - 生成审计报告
   */
  private endNode(): void {
    this.context.thoughtChain.push('📋 生成审计报告');
    this.context.thoughtChain.push(`最终风险评分: ${this.context.riskScore ?? '待评定'}/100`);
    this.context.thoughtChain.push(`最终决策: ${this.getDecisionText()}`);
  }

  /**
   * 检查缺失信息
   */
  private checkMissingInfo(): string[] {
    const input = this.context.input;
    const missing: string[] = [];

    // 检查是否包含基本交易信息
    const hasAmount = /\d+/.test(input) || /金额|多少|元|美元|dollar|万|千/i.test(input);
    const hasCountry = /国家|地区|境外|跨境|缅甸|柬埔寨|泰国|美国|欧洲|朋友|对方/i.test(input);
    const hasPurpose = /目的|用途|原因|为了|想要|需要|帮|给|做/i.test(input);

    // 如果是高风险关键词但缺少详细信息
    const hasCriticalKeywords = this.context.keywords.some(k => 
      KEYWORD_DATABASE.CRITICAL.includes(k)
    );

    // 只有在输入非常简短且包含高风险词时才要求补充信息
    const isVeryShort = input.length < 10;
    const hasEnoughContext = hasAmount || hasCountry || hasPurpose;

    if (hasCriticalKeywords && isVeryShort && !hasEnoughContext) {
      if (!hasAmount) missing.push('交易金额');
      if (!hasCountry) missing.push('收款国家/地区');
      if (!hasPurpose) missing.push('交易背景说明');
    }

    return missing;
  }

  /**
   * 生成高风险原因
   */
  private generateHighRiskReason(cases: any[]): string {
    const keywords = this.context.keywords.slice(0, 3).join('、');
    
    if (cases.length > 0) {
      const caseNames = cases.map(c => c.name).join('、');
      return `检测到严重的高风险特征：${keywords}。匹配知险库案例：${caseNames}`;
    }
    
    return `检测到多个高风险特征：${keywords}`;
  }

  /**
   * 生成中风险原因
   */
  private generateMediumRiskReason(cases: any[]): string {
    const keywords = this.context.keywords.slice(0, 3).join('、');
    
    if (cases.length > 0) {
      return `检测到潜在风险特征：${keywords}`;
    }
    
    return `交易存在一定风险特征：${keywords}`;
  }

  /**
   * 获取决策文本
   */
  private getDecisionText(): string {
    const map = {
      'ALLOW': '✅ ALLOW - 允许交易',
      'WARN': '⚠️ WARN - 警告，需人工复核',
      'HALT': '🚨 HALT - 立即拦截',
      'INFO_REQUIRED': '❓ INFO_REQUIRED - 需要更多材料'
    };
    return map[this.context.decision];
  }
}

/**
 * 工作流执行器 - 对外接口
 */
export async function executeWorkflow(input: string): Promise<{
  score: number | null;
  mode: 'NORMAL' | 'AUDIT';
  decision: 'ALLOW' | 'WARN' | 'HALT' | 'INFO_REQUIRED';
  reason: string;
  thought_chain: string[];
  ai_response: string;
}> {
  const engine = new WorkflowEngine(input);
  const result = await engine.execute();

  // 生成 AI 回复文本
  const aiResponse = generateAIResponse(result);

  return {
    score: result.riskScore,
    mode: result.mode,
    decision: result.decision,
    reason: result.reason,
    thought_chain: result.thoughtChain,
    ai_response: aiResponse
  };
}

/**
 * 生成 AI 回复文本
 */
function generateAIResponse(context: WorkflowContext): string {
  const { decision, riskScore, reason, keywords, matchedCases } = context;

  let response = '【审计结论】\n';

  if (decision === 'INFO_REQUIRED') {
    response += `- 风险分值：暂无法判定（信息不足）\n`;
    response += `- 最终决策：【需要更多材料】\n\n`;
    response += `【风险等级】\n`;
    response += `- 嫌疑等级：暂无法判定\n\n`;
    response += `【详细分析】\n`;
    response += `- ${reason}\n\n`;
    response += `【处置建议】\n`;
    response += `- 请补充完整的交易信息后重新提交审计申请\n`;
    return response;
  }

  response += `- 风险分值：${riskScore}/100\n`;
  response += `- 最终决策：${getDecisionEmoji(decision)} ${decision}\n\n`;

  response += `【风险特征】\n`;
  if (keywords.length > 0) {
    keywords.slice(0, 5).forEach((k, i) => {
      response += `${i + 1}. ${k}\n`;
    });
  } else {
    response += `- 未发现明显风险特征\n`;
  }

  if (matchedCases.length > 0) {
    response += `\n【匹配案例库】\n`;
    const cases = fraudCaseDatabase.getCasesByIds(matchedCases);
    cases.forEach(c => {
      response += `- ${c.name}（${c.id}）\n`;
    });
  }

  response += `\n【风险类型】\n`;
  response += getRiskTypes(keywords);

  if (decision === 'HALT') {
    response += `\n【法律风险】\n`;
    response += `根据《刑法》第287条、《反洗钱法》相关规定，参与此类活动可能构成：\n`;
    response += `- 帮助信息网络犯罪活动罪\n`;
    response += `- 洗钱罪\n`;
    response += `- 非法经营罪\n`;
  }

  response += `\n【处置建议】\n`;
  response += getDisposalAdvice(decision);

  return response;
}

function getDecisionEmoji(decision: string): string {
  const map: Record<string, string> = {
    'ALLOW': '✅',
    'WARN': '⚠️',
    'HALT': '🚨',
    'INFO_REQUIRED': '❓'
  };
  return map[decision] || '❓';
}

function getRiskTypes(keywords: string[]): string {
  const types: string[] = [];
  
  if (keywords.some(k => ['JD', '刷单', '返利', '佣金'].includes(k))) {
    types.push('- 诱导性任务诈骗');
  }
  if (keywords.some(k => ['换汇', '拆单', '洗钱'].includes(k))) {
    types.push('- 非法换汇/洗钱风险');
  }
  if (keywords.some(k => ['帮信', '黑钱', '诈骗'].includes(k))) {
    types.push('- 帮信罪风险');
  }
  if (keywords.some(k => ['套利', '对倒', '汇率'].includes(k))) {
    types.push('- 汇率套利风险');
  }
  
  return types.length > 0 ? types.join('\n') : '- 常规交易风险';
}

function getDisposalAdvice(decision: string): string {
  const map: Record<string, string> = {
    'HALT': '1. 立即拦截交易\n2. 冻结相关账户\n3. 提交人工复核\n4. 必要时报警处理',
    'WARN': '1. 要求用户提供更多交易细节\n2. 核实交易对手身份\n3. 人工复核交易合理性\n4. 加强后续监控',
    'ALLOW': '1. 允许交易正常进行\n2. 保留完整交易记录\n3. 定期抽查复核',
    'INFO_REQUIRED': '1. 要求用户补充完整信息\n2. 暂停交易处理\n3. 信息补充后重新审计'
  };
  return map[decision] || '请联系客服';
}
