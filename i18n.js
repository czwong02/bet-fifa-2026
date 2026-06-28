/** WC 2026 — EN / 中文 */
const I18N = {
  en: {
    pageTitle: 'WC 2026 Bet Calculator',
    guideBtn: 'Guide',
    guideTitle: 'User Manual',
    closeGuide: 'Close guide',
    openGuide: 'Open user guide',
    heroBadge: 'USA · CAN · MEX 2026',
    heroTitle: 'FIFA World Cup 2026<br>Bet Calculator',
    heroSub: 'Add multiple matches, enter stakes on each bet, and see combined profit with percentages.',
    yourMatches: 'Your Matches',
    addMatch: '+ Add match',
    toolbarDesc: 'Configure each match below. Use <strong>Calculate all</strong> to see per-match and combined totals.',
    calculateAll: 'Calculate all matches',
    resetAll: 'Reset all',
    combinedTotals: 'Combined Totals',
    thMatch: 'Match',
    thStaked: 'Staked',
    thStakePct: 'Stake %',
    thBestProfit: 'Best profit',
    thBestRoi: 'Best ROI',
    thWorstProfit: 'Worst profit',
    thWorstRoi: 'Worst ROI',
    footer: 'Educational tool only. Gamble responsibly. Odds are user-entered — verify with your bookmaker.',
    home: 'Home',
    away: 'Away',
    budget: 'Budget ($)',
    strategy: 'Strategy',
    odds: 'Odds',
    stake: 'Stake ($)',
    matchResult: 'Match Result (1X2)',
    correctScore: 'Correct Score',
    addScore: '+ Add score',
    remove: 'Remove',
    matchN: 'Match {n}:',
    homeWin: '{team} Win',
    awayWin: '{team} Win',
    draw: 'Draw',
    scoreLine: 'Score {home}–{away}',
    stratManual: 'Manual',
    stratDutch: 'Dutch',
    stratTarget: 'Target profit',
    stratCover: 'Full cover',
    stratArbitrage: 'Arbitrage',
    hintManual: 'Enter odds and stake ($) on each bet. Budget is a reference per match.',
    hintDutch: 'Auto-splits this match budget for equal return on selected outcomes.',
    hintTarget: 'Full budget on first checked 1X2 pick for this match.',
    hintCover: 'Auto-selects Win + Draw + Lose and splits budget across all three.',
    hintArbitrage: 'Auto-stakes all 1X2 outcomes; flags guaranteed profit if Σ(1/O) < 100%.',
    errKeepOne: 'Keep at least one match.',
    errValidScores: 'Enter valid scores.',
    errMinOdds: 'Odds must be at least 1.01.',
    errNeedStake: '{home} vs {away}: enter a stake on at least one bet.',
    errNeedBudget: '{home} vs {away}: enter a budget.',
    errNeed1x2Cover: '{home} vs {away}: check all three 1X2 outcomes for {strategy}.',
    errNeed1x2Target: '{home} vs {away}: pick at least one 1X2 outcome.',
    errNeedBet: '{home} vs {away}: select at least one bet.',
    staked: 'Staked',
    budgetLeft: 'Budget left',
    impliedSum: 'Implied Σ',
    scenarioPL: 'Scenario P/L',
    scenarioRoi: 'Scenario ROI',
    thSelection: 'Selection',
    thImplied: 'Implied %',
    thReturn: 'Return',
    thProfit: 'Profit',
    thProfitPct: 'Profit %',
    thRoi: 'ROI %',
    netPL: 'Net P/L:',
    matches: 'Matches',
    totalStaked: 'Total staked',
    combinedBudgets: 'Combined budgets',
    bestTotalProfit: 'Best total profit',
    worstTotalProfit: 'Worst total profit',
    allMatches: 'All matches',
    groupPool: 'Group Pool',
    matchReference: 'Match Reference',
    refDesc: 'Fixtures and standings refresh once daily on the server. Click a match to fill teams in the calculator.',
    refUpdated: 'Last updated: {time}',
    refLoading: 'Loading reference data…',
    refError: 'Reference data unavailable. Try again after deploy or cron sync.',
    refNoFixtures: 'No fixtures loaded.',
    refNoStandings: 'No standings loaded.',
    refApplyTeams: 'Use teams in calculator',
    refTeam: 'Team',
    refPlayed: 'P',
    refPoints: 'Pts',
    refShow: 'Show reference',
    refHide: 'Hide reference',
    refLeagues: 'League',
    refFixtures: 'Fixtures',
    refStandings: 'Standings',
    groupDesc: 'Add people who share the bet. Stakes and profits are split by each member\'s contribution.',
    addMember: '+ Add member',
    addMemberBtn: 'Add',
    memberName: 'Name',
    contribution: 'Contribution ($)',
    groupSplit: 'Group Split',
    shareOfStake: 'Share of stake',
    profitEarned: 'Profit (best / worst)',
    thProfitRoi: 'ROI (best / worst)',
    totalPayout: 'Payout (best / worst)',
    bestProfitShare: 'Best profit',
    worstProfitShare: 'Worst profit',
    memberEarns: '{name} earns',
    bestCase: 'Best case',
    worstCase: 'Worst case',
    receives: 'Receives',
    profitLabel: 'Profit',
    totalPool: 'Total pool',
    members: 'Members',
    poolAllocPct: 'Pool allocation %',
    budgetFromPool: 'Budget (from pool)',
    poolAllocHint: 'Budget = total pool × allocation %. All matches must sum to 100%.',
    allocatedTotal: 'Pool allocated',
    errAllocNot100: 'Allocations sum to {sum}% — must equal 100%.',
    errMemberName: 'Enter a member name.',
    errMemberContrib: 'Contribution must be greater than 0.',
    errPoolShort: 'Total staked {staked} exceeds group pool {pool} by {shortfall}.',
    noMembers: 'No members yet — add people to split the bet.',
    removeMember: 'Remove member',
    guideHtml: `<section><h3>Quick start</h3><ol>
      <li>Add <strong>Group Pool</strong> members with name and contribution (optional).</li>
      <li>Use <strong>Match Reference</strong> for fixtures and standings (server sync once daily).</li>
      <li>Pick <strong>Home</strong> and <strong>Away</strong> teams for each match.</li>
      <li>Check outcomes (Win, Draw, Lose, or Correct Score).</li>
      <li>Enter <strong>Odds</strong> and <strong>Stake ($)</strong> on each line.</li>
      <li>Click <strong>Calculate all matches</strong> to see profits and group split.</li>
    </ol></section>
    <section><h3>Group pool</h3>
      <p>Add friends who chip in together. Each person's <strong>share %</strong> = contribution ÷ total pool.</p>
      <p>Set each match's <strong>pool allocation %</strong>. Match budget = total pool × that %. All matches must sum to 100%.</p>
      <p>After calculating, <strong>Group Split</strong> shows each member's portion of stake and profit.</p>
    </section>
    <section><h3>Multiple matches</h3>
      <p>Click <strong>+ Add match</strong> for several games. <strong>Combined Totals</strong> sums stakes and profit.</p>
      <p>Click a match header to <strong>expand or collapse</strong> betting options.</p>
    </section>
    <section><h3>Strategies (per match)</h3><ul>
      <li><strong>Manual</strong> — enter every stake yourself.</li>
      <li><strong>Dutch</strong> — equal return on selected outcomes.</li>
      <li><strong>Target profit</strong> — full budget on first 1X2 pick.</li>
      <li><strong>Full cover</strong> — auto-stakes Win + Draw + Lose.</li>
      <li><strong>Arbitrage</strong> — guaranteed profit if implied total &lt; 100%.</li>
    </ul></section>
    <section><h3>Percentages</h3><ul>
      <li><strong>Implied %</strong> — bookmaker probability (1 ÷ odds).</li>
      <li><strong>Stake %</strong> — share of match total stake.</li>
      <li><strong>Profit %</strong> — gain vs that bet's stake.</li>
      <li><strong>ROI %</strong> — profit vs total match stake.</li>
    </ul></section>
    <section><h3>Correct score</h3>
      <p>Enter goals, odds, stake, then <strong>+ Add score</strong>. Multiple lines per match.</p>
    </section>
    <section><h3>Tips</h3><ul>
      <li>Verify odds with your bookmaker before betting.</li>
      <li>Ensure group pool covers total stakes before placing bets.</li>
      <li>Budget is a reference in Manual mode.</li>
    </ul></section>`,
  },
  zh: {
    pageTitle: '2026 世界杯投注计算器',
    guideBtn: '使用指南',
    guideTitle: '用户手册',
    closeGuide: '关闭指南',
    openGuide: '打开用户手册',
    heroBadge: '美国 · 加拿大 · 墨西哥 2026',
    heroTitle: '2026 FIFA 世界杯<br>投注计算器',
    heroSub: '添加多场比赛，为每个选项输入投注金额，查看合并收益与百分比。',
    yourMatches: '您的比赛',
    addMatch: '+ 添加比赛',
    toolbarDesc: '在下方配置每场比赛。点击<strong>计算全部</strong>查看单场与合并总计。',
    calculateAll: '计算全部比赛',
    resetAll: '全部重置',
    combinedTotals: '合并总计',
    thMatch: '比赛',
    thStaked: '投注额',
    thStakePct: '投注占比',
    thBestProfit: '最佳盈利',
    thBestRoi: '最佳 ROI',
    thWorstProfit: '最差盈利',
    thWorstRoi: '最差 ROI',
    footer: '仅供学习参考。请理性投注。赔率由用户自行输入，请以博彩公司为准。',
    home: '主队',
    away: '客队',
    budget: '预算 ($)',
    strategy: '策略',
    odds: '赔率',
    stake: '投注 ($)',
    matchResult: '赛果 (1X2)',
    correctScore: '波胆 / 正确比分',
    addScore: '+ 添加比分',
    remove: '删除',
    matchN: '比赛 {n}：',
    homeWin: '{team} 胜',
    awayWin: '{team} 胜',
    draw: '平局',
    scoreLine: '比分 {home}–{away}',
    stratManual: '手动',
    stratDutch: '荷兰式',
    stratTarget: '目标盈利',
    stratCover: '全覆盖',
    stratArbitrage: '套利',
    hintManual: '自行输入每个选项的赔率与投注。预算仅供参考。',
    hintDutch: '按预算自动分配，使所选结果回报相等。',
    hintTarget: '将全部预算投注于第一个勾选的 1X2 选项。',
    hintCover: '自动勾选胜/平/负，并按预算分配三项投注。',
    hintArbitrage: '自动投注三项 1X2；若隐含概率总和 < 100% 则锁定盈利。',
    errKeepOne: '至少保留一场比赛。',
    errValidScores: '请输入有效比分。',
    errMinOdds: '赔率至少为 1.01。',
    errNeedStake: '{home} vs {away}：请至少在一个选项输入投注金额。',
    errNeedBudget: '{home} vs {away}：请输入预算。',
    errNeed1x2Cover: '{home} vs {away}：{strategy} 需勾选全部三个 1X2 选项。',
    errNeed1x2Target: '{home} vs {away}：请至少勾选一个 1X2 选项。',
    errNeedBet: '{home} vs {away}：请至少选择一个投注项。',
    staked: '已投注',
    budgetLeft: '预算剩余',
    impliedSum: '隐含概率 Σ',
    scenarioPL: '情景盈亏',
    scenarioRoi: '情景 ROI',
    thSelection: '选项',
    thImplied: '隐含 %',
    thReturn: '回报',
    thProfit: '盈利',
    thProfitPct: '盈利率 %',
    thRoi: 'ROI %',
    netPL: '净盈亏：',
    matches: '比赛场次',
    totalStaked: '总投注',
    combinedBudgets: '合并预算',
    bestTotalProfit: '最佳总盈利',
    worstTotalProfit: '最差总盈利',
    allMatches: '全部比赛',
    groupPool: '合买群组',
    matchReference: '赛事参考',
    refDesc: '赛程与积分榜每天在服务器自动更新。点击比赛可填入计算器球队。',
    refUpdated: '最后更新：{time}',
    refLoading: '加载参考数据…',
    refError: '无法加载参考数据，请部署后或等待定时同步。',
    refNoFixtures: '暂无赛程。',
    refNoStandings: '暂无积分榜。',
    refApplyTeams: '填入计算器球队',
    refTeam: '球队',
    refPlayed: '场',
    refPoints: '分',
    refShow: '显示参考',
    refHide: '隐藏参考',
    refLeagues: '联赛',
    refFixtures: '赛程',
    refStandings: '积分榜',
    groupDesc: '添加一起投注的成员。按各自出资比例分摊投注与盈亏。',
    addMember: '+ 添加成员',
    addMemberBtn: '添加',
    memberName: '姓名',
    contribution: '出资 ($)',
    groupSplit: '合买分摊',
    shareOfStake: '分摊投注',
    profitEarned: '盈利（最佳/最差）',
    thProfitRoi: 'ROI（最佳/最差）',
    totalPayout: '到手（最佳/最差）',
    bestProfitShare: '最佳盈利',
    worstProfitShare: '最差盈利',
    memberEarns: '{name} 收益',
    bestCase: '最佳情况',
    worstCase: '最差情况',
    receives: '到手',
    profitLabel: '盈利',
    totalPool: '总资金池',
    members: '成员',
    poolAllocPct: '资金池分配 %',
    budgetFromPool: '预算（来自资金池）',
    poolAllocHint: '预算 = 总资金池 × 分配 %。所有比赛分配须合计 100%。',
    allocatedTotal: '已分配',
    errAllocNot100: '分配合计 {sum}%，须等于 100%。',
    errMemberName: '请输入成员姓名。',
    errMemberContrib: '出资金额须大于 0。',
    errPoolShort: '总投注 {staked} 超出资金池 {pool}，差额 {shortfall}。',
    noMembers: '暂无成员 — 添加成员以分摊投注。',
    removeMember: '删除成员',
    guideHtml: `<section><h3>快速入门</h3><ol>
      <li>在<strong>合买群组</strong>添加成员姓名与出资（可选）。</li>
      <li>使用<strong>赛事参考</strong>查看赛程与积分榜（服务器每天同步）。</li>
      <li>为每场比赛选择<strong>主队</strong>与<strong>客队</strong>。</li>
      <li>勾选投注项（胜、平、负或波胆）。</li>
      <li>输入<strong>赔率</strong>与<strong>投注 ($)</strong>。</li>
      <li>点击<strong>计算全部比赛</strong>查看盈利与合买分摊。</li>
    </ol></section>
    <section><h3>合买群组</h3>
      <p>多人凑资一起投注。每人<strong>占比</strong> = 出资 ÷ 总资金池。</p>
      <p>为每场比赛设置<strong>资金池分配 %</strong>。比赛预算 = 总资金池 × 该比例。所有比赛须合计 100%。</p>
      <p>计算后<strong>合买分摊</strong>显示每人承担的投注与盈亏份额。</p>
    </section>
    <section><h3>多场比赛</h3>
      <p>点击<strong>+ 添加比赛</strong>同时投注多场。<strong>合并总计</strong>汇总全部投注与盈利。</p>
      <p>点击比赛标题可<strong>展开或折叠</strong>投注选项。</p>
    </section>
    <section><h3>策略（每场独立）</h3><ul>
      <li><strong>手动</strong> — 自行输入每项投注。</li>
      <li><strong>荷兰式</strong> — 所选结果回报相等。</li>
      <li><strong>目标盈利</strong> — 预算全投第一个 1X2 选项。</li>
      <li><strong>全覆盖</strong> — 自动投注胜/平/负。</li>
      <li><strong>套利</strong> — 隐含概率 &lt; 100% 时锁定盈利。</li>
    </ul></section>
    <section><h3>百分比说明</h3><ul>
      <li><strong>隐含 %</strong> — 博彩公司概率 (1 ÷ 赔率)。</li>
      <li><strong>投注占比</strong> — 占该场总投注的比例。</li>
      <li><strong>盈利率 %</strong> — 相对该笔投注的盈利。</li>
      <li><strong>ROI %</strong> — 相对该场总投注的回报率。</li>
    </ul></section>
    <section><h3>波胆</h3>
      <p>输入主客队进球、赔率、投注，点击<strong>+ 添加比分</strong>。每场可添加多条。</p>
    </section>
    <section><h3>提示</h3><ul>
      <li>下注前请与博彩公司核对赔率。</li>
      <li>确保合买资金池覆盖总投注额。</li>
      <li>手动模式下预算仅供参考，超出会有提示。</li>
    </ul></section>`,
  },
};

let currentLang = localStorage.getItem('wc-lang') || 'en';

function t(key, params = {}) {
  let str = I18N[currentLang]?.[key] ?? I18N.en[key] ?? key;
  for (const [k, v] of Object.entries(params)) str = str.replaceAll(`{${k}}`, v);
  return str;
}

function strategyHint(key) {
  return t(`hint${key.charAt(0).toUpperCase()}${key.slice(1)}`);
}

function setLang(lang) {
  if (!I18N[lang]) return;
  currentLang = lang;
  localStorage.setItem('wc-lang', lang);
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  applyStaticI18n();
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  if (typeof window.onLangChange === 'function') window.onLangChange();
  if (typeof window.onWidgetLangChange === 'function') window.onWidgetLangChange();
}

function applyStaticI18n() {
  document.title = t('pageTitle');
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    const [attr, key] = el.dataset.i18nAttr.split(':');
    el.setAttribute(attr, t(key));
  });
  const guideBody = document.getElementById('guideBody');
  if (guideBody) guideBody.innerHTML = t('guideHtml');
}

applyStaticI18n();
