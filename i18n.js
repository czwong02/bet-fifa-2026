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
    doubleChance: 'Double Chance',
    correctScore: 'Correct Score',
    addScore: '+ Add score',
    remove: 'Remove',
    matchN: 'Match {n}:',
    homeWin: '{team} Win',
    awayWin: '{team} Win',
    draw: 'Draw',
    winOrDraw: '{home} Win or Draw',
    winOrLose: '{home} Win or {away} Win',
    drawOrAway: 'Draw or {away} Win',
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
    guideHtml: `<section><h3>Quick start</h3><ol>
      <li>Pick <strong>Home</strong> and <strong>Away</strong> teams for each match.</li>
      <li>Check outcomes (Win, Draw, Lose, Double Chance, or Correct Score).</li>
      <li>Enter <strong>Odds</strong> and <strong>Stake ($)</strong> on each line.</li>
      <li>Click <strong>Calculate all matches</strong> to see profits and percentages.</li>
    </ol></section>
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
      <li>Overlapping picks can pay more when multiple bets win.</li>
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
    doubleChance: '双重机会',
    correctScore: '波胆 / 正确比分',
    addScore: '+ 添加比分',
    remove: '删除',
    matchN: '比赛 {n}：',
    homeWin: '{team} 胜',
    awayWin: '{team} 胜',
    draw: '平局',
    winOrDraw: '{home} 胜或平',
    winOrLose: '{home} 或 {away} 胜',
    drawOrAway: '平或 {away} 胜',
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
    guideHtml: `<section><h3>快速入门</h3><ol>
      <li>为每场比赛选择<strong>主队</strong>与<strong>客队</strong>。</li>
      <li>勾选投注项（胜、平、负、双重机会或波胆）。</li>
      <li>输入<strong>赔率</strong>与<strong>投注 ($)</strong>。</li>
      <li>点击<strong>计算全部比赛</strong>查看盈利与百分比。</li>
    </ol></section>
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
      <li>重叠选项（如主胜 + 胜/平）可能同时中奖，回报更高。</li>
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
