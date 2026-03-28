/**
 * NODE AI 反欺诈案例库
 * 基于 src/dag/跨境支付典型反欺诈实战案例库2.md
 */

export interface FraudCase {
  id: string;
  name: string;
  attackMethod: string;
  keywords: string[];
  patterns: string[];
  baseScore: number;
  decision: 'HALT' | 'WARN' | 'PENDING' | 'LOCK';
  description: string;
}

/**
 * 案例库数据
 */
const FRAUD_CASES: FraudCase[] = [
  {
    id: 'FRAUD-2026-001',
    name: '拆单洗钱（Structuring / Smurfing）',
    attackMethod: '拆单洗钱',
    keywords: ['拆单', '连续', '小额', '多笔', '接近限额', '规避', '阈值'],
    patterns: [
      '新近注册的个人账户',
      '短时间内连续发起多笔交易',
      '金额刻意避开合规报备阈值',
      '单笔金额接近但不超过限额'
    ],
    baseScore: 92,
    decision: 'HALT',
    description: '在短时间内连续发起多笔小额交易，刻意规避单笔大额交易的合规报备要求，典型的洗钱行为。'
  },
  {
    id: 'FRAUD-2026-002',
    name: 'JD任务型电信诈骗劫持',
    attackMethod: 'JD任务型诈骗',
    keywords: ['JD', '任务', '众包', '刷单', '返利', '佣金', '测试资金', '换汇'],
    patterns: [
      '用户称在众包平台领取任务',
      '高佣金测试换汇任务',
      '向第三方私人账户汇款',
      '利用刷单逻辑诱导支付'
    ],
    baseScore: 92,
    decision: 'HALT',
    description: '利用众包平台（如JD）发布虚假高佣金任务，诱导用户进行测试汇款，实为电信诈骗。'
  },
  {
    id: 'FRAUD-2026-003',
    name: '汇率对冲与套利风险（FX Arbitrage）',
    attackMethod: '汇率套利',
    keywords: ['汇率', '套利', '对倒', '高频', '波动', '跨时区', '清算延迟'],
    patterns: [
      '全球汇率剧烈波动期间',
      '多个子账户高频循环对倒',
      '跨时区收付节点操作',
      '利用清算延迟套利'
    ],
    baseScore: 75,
    decision: 'PENDING',
    description: '在汇率波动期间，通过多账户跨时区高频对倒，利用系统清算延迟进行无风险套利。'
  },
  {
    id: 'FRAUD-2026-004',
    name: '账户接管与异常登录（ATO）',
    attackMethod: '账户接管',
    keywords: ['ATO', '异地登录', '设备变更', '虚拟机', '代理', '全额转账', '密保修改'],
    patterns: [
      'IP地址异常跳跃至高风险地区',
      '使用虚拟机或代理环境登录',
      '修改密保后立即清空余额',
      '设备指纹完全变更'
    ],
    baseScore: 98,
    decision: 'LOCK',
    description: '账户被恶意接管，攻击者修改密保后尝试清空账户余额，需立即锁定账户。'
  }
];

/**
 * 案例库管理类
 */
class FraudCaseDatabase {
  private cases: FraudCase[];

  constructor() {
    this.cases = FRAUD_CASES;
  }

  /**
   * 根据输入文本匹配案例
   */
  matchCases(input: string): FraudCase[] {
    const matched: Array<{ case: FraudCase; score: number }> = [];

    for (const fraudCase of this.cases) {
      let matchScore = 0;

      // 关键词匹配
      for (const keyword of fraudCase.keywords) {
        if (input.includes(keyword)) {
          matchScore += 10;
        }
      }

      // 模式匹配
      for (const pattern of fraudCase.patterns) {
        const patternKeywords = pattern.split(/[、，,]/);
        for (const pk of patternKeywords) {
          if (input.includes(pk.trim())) {
            matchScore += 5;
          }
        }
      }

      if (matchScore > 0) {
        matched.push({ case: fraudCase, score: matchScore });
      }
    }

    // 按匹配分数排序
    matched.sort((a, b) => b.score - a.score);

    return matched.map(m => m.case);
  }

  /**
   * 根据ID获取案例
   */
  getCasesByIds(ids: string[]): FraudCase[] {
    return this.cases.filter(c => ids.includes(c.id));
  }

  /**
   * 获取所有案例
   */
  getAllCases(): FraudCase[] {
    return this.cases;
  }

  /**
   * 根据决策类型获取案例
   */
  getCasesByDecision(decision: 'HALT' | 'WARN' | 'PENDING' | 'LOCK'): FraudCase[] {
    return this.cases.filter(c => c.decision === decision);
  }

  /**
   * 搜索案例
   */
  searchCases(query: string): FraudCase[] {
    const lowerQuery = query.toLowerCase();
    return this.cases.filter(c => 
      c.name.toLowerCase().includes(lowerQuery) ||
      c.attackMethod.toLowerCase().includes(lowerQuery) ||
      c.description.toLowerCase().includes(lowerQuery) ||
      c.keywords.some(k => k.toLowerCase().includes(lowerQuery))
    );
  }
}

// 导出单例
export const fraudCaseDatabase = new FraudCaseDatabase();
