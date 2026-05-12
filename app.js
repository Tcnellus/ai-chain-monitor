const STORAGE_KEY = 'ai-chain-monitor-signals-v1';

const state = {
  stages: [],
  tickers: [],
  step3Only: false,
  stageFilter: 'all',
  signals: {
    stages: {},
    tickers: {},
  },
};

const signalDefaults = {
  demand: 0,
  orders: 0,
  margins: 0,
  guidance: 0,
  valuation: 0,
  note: '',
  updatedAt: '',
};

const tickerDefaults = {
  proof: 0,
  entry: 0,
  note: '',
  updatedAt: '',
};

const escapeHtml = (value) => String(value || '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const average = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;

const scoreTickerBase = (ticker) => average([
  ticker.scores.demandSignal,
  ticker.scores.backlogOrders,
  ticker.scores.estimateRevisionPotential,
  ticker.scores.valuationDiscipline,
  ticker.scores.downsideRisk,
]);

const stageSignalScore = (stageId) => {
  const signal = { ...signalDefaults, ...(state.signals.stages[stageId] || {}) };
  return average([
    Number(signal.demand),
    Number(signal.orders),
    Number(signal.margins),
    Number(signal.guidance),
    Number(signal.valuation),
  ]);
};

const tickerSignalScore = (symbol) => {
  const signal = { ...tickerDefaults, ...(state.signals.tickers[symbol] || {}) };
  return average([Number(signal.proof), Number(signal.entry)]);
};

const adjustedTickerScore = (ticker) => {
  const base = scoreTickerBase(ticker);
  const stageAdjustment = stageSignalScore(ticker.stageId) * 0.45;
  const tickerAdjustment = tickerSignalScore(ticker.symbol) * 0.35;
  return Math.max(1, Math.min(5, base + stageAdjustment + tickerAdjustment));
};

const stageOutcome = (score) => {
  if (score >= 1.2) return { label: 'Early/accelerating', className: 'strong' };
  if (score >= 0.35) return { label: 'Confirmed', className: 'strong' };
  if (score > -0.35) return { label: 'Watch', className: 'neutral' };
  if (score > -1.2) return { label: 'Weakening', className: 'neutral' };
  return { label: 'Declining', className: 'weak' };
};

const formatScore = (score) => score.toFixed(1);

const formatSigned = (score) => {
  if (score > 0) return `+${score.toFixed(1)}`;
  return score.toFixed(1);
};

const saveSignals = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.signals));
};

const loadSignals = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (stored && typeof stored === 'object') {
      state.signals = {
        stages: stored.stages || {},
        tickers: stored.tickers || {},
      };
    }
  } catch {
    state.signals = { stages: {}, tickers: {} };
  }
};

const renderStages = () => {
  const stageGrid = document.querySelector('#stage-grid');
  const stageFilter = document.querySelector('#stage-filter');

  stageFilter.innerHTML = '<option value="all">All stages</option>';
  state.stages.forEach((stage) => {
    const option = document.createElement('option');
    option.value = stage.id;
    option.textContent = stage.name;
    stageFilter.appendChild(option);
  });
  stageFilter.value = state.stageFilter;

  const visibleStages = state.stageFilter === 'all'
    ? state.stages
    : state.stages.filter((stage) => stage.id === state.stageFilter);

  stageGrid.innerHTML = visibleStages.map((stage) => {
    const score = stageSignalScore(stage.id);
    const outcome = stageOutcome(score);
    const signal = state.signals.stages[stage.id];
    const note = signal?.note ? `<p class="stage-note">${escapeHtml(signal.note)}</p>` : '';

    return `
      <article class="stage-card">
        <h3>${escapeHtml(stage.name)}</h3>
        <p>${escapeHtml(stage.description)}</p>
        ${note}
        <div class="stage-meta">
          <span class="signal ${outcome.className}">${outcome.label}</span>
          <span>${escapeHtml(stage.cyclePosition)}</span>
        </div>
        <div class="stage-score">Manual signal: ${formatSigned(score)}</div>
      </article>
    `;
  }).join('');
};

const renderSelectors = () => {
  const stageSelect = document.querySelector('#signal-stage');
  const tickerSelect = document.querySelector('#signal-ticker');

  stageSelect.innerHTML = state.stages.map((stage) => `
    <option value="${stage.id}">${escapeHtml(stage.name)}</option>
  `).join('');

  tickerSelect.innerHTML = state.tickers.map((ticker) => `
    <option value="${ticker.symbol}">${escapeHtml(ticker.symbol)} - ${escapeHtml(ticker.company)}</option>
  `).join('');
};

const renderTickerRows = () => {
  const rows = document.querySelector('#ticker-table');
  const count = document.querySelector('#ticker-count');

  const filtered = state.tickers
    .filter((ticker) => !state.step3Only || ticker.strategyStep === 3)
    .filter((ticker) => state.stageFilter === 'all' || ticker.stageId === state.stageFilter)
    .map((ticker) => {
      const stageScore = stageSignalScore(ticker.stageId);
      const tickerScore = tickerSignalScore(ticker.symbol);
      const score = adjustedTickerScore(ticker);
      return {
        ...ticker,
        score,
        stageOutcome: stageOutcome(stageScore),
        tickerSignal: state.signals.tickers[ticker.symbol],
        manualDelta: stageScore * 0.45 + tickerScore * 0.35,
      };
    })
    .sort((a, b) => b.score - a.score);

  count.textContent = filtered.length;

  rows.innerHTML = filtered.map((ticker, index) => {
    const note = ticker.tickerSignal?.note
      ? `<div class="ticker-note">${escapeHtml(ticker.tickerSignal.note)}</div>`
      : '';

    return `
      <tr>
        <td>${index + 1}</td>
        <td><span class="ticker">${escapeHtml(ticker.symbol)}</span><br>${escapeHtml(ticker.company)}</td>
        <td>${escapeHtml(ticker.stageName)}</td>
        <td><span class="signal ${ticker.signal.toLowerCase()}">${escapeHtml(ticker.signal)}</span></td>
        <td>
          <span class="score">${formatScore(ticker.score)}</span>
          <div class="score-delta">${formatSigned(ticker.manualDelta)} manual</div>
        </td>
        <td><span class="signal ${ticker.stageOutcome.className}">${ticker.stageOutcome.label}</span></td>
        <td>${escapeHtml(ticker.thesis)}${note}</td>
        <td>${escapeHtml(ticker.downsideTrigger)}</td>
      </tr>
    `;
  }).join('');
};

const populateStageForm = () => {
  const stageId = document.querySelector('#signal-stage').value;
  const signal = { ...signalDefaults, ...(state.signals.stages[stageId] || {}) };

  document.querySelector('#signal-demand').value = signal.demand;
  document.querySelector('#signal-orders').value = signal.orders;
  document.querySelector('#signal-margins').value = signal.margins;
  document.querySelector('#signal-guidance').value = signal.guidance;
  document.querySelector('#signal-valuation').value = signal.valuation;
  document.querySelector('#signal-note').value = signal.note;
};

const populateTickerForm = () => {
  const symbol = document.querySelector('#signal-ticker').value;
  const signal = { ...tickerDefaults, ...(state.signals.tickers[symbol] || {}) };

  document.querySelector('#ticker-proof').value = signal.proof;
  document.querySelector('#ticker-entry').value = signal.entry;
  document.querySelector('#ticker-note').value = signal.note;
};

const render = () => {
  renderStages();
  renderTickerRows();
  document.querySelector('#show-step3').classList.toggle('active', state.step3Only);
  document.querySelector('#show-all').classList.toggle('active', !state.step3Only);
};

const loadData = async () => {
  loadSignals();
  const [stagesResponse, tickersResponse] = await Promise.all([
    fetch('data/chain-stages.json'),
    fetch('data/tickers.json'),
  ]);

  state.stages = await stagesResponse.json();
  state.tickers = await tickersResponse.json();
  renderSelectors();
  populateStageForm();
  populateTickerForm();
  render();
};

document.querySelector('#stage-filter').addEventListener('change', (event) => {
  state.stageFilter = event.target.value;
  render();
});

document.querySelector('#show-step3').addEventListener('click', () => {
  state.step3Only = true;
  render();
});

document.querySelector('#show-all').addEventListener('click', () => {
  state.step3Only = false;
  render();
});

document.querySelector('#signal-stage').addEventListener('change', populateStageForm);
document.querySelector('#signal-ticker').addEventListener('change', populateTickerForm);

document.querySelector('#stage-signal-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const stageId = document.querySelector('#signal-stage').value;
  state.signals.stages[stageId] = {
    demand: Number(document.querySelector('#signal-demand').value),
    orders: Number(document.querySelector('#signal-orders').value),
    margins: Number(document.querySelector('#signal-margins').value),
    guidance: Number(document.querySelector('#signal-guidance').value),
    valuation: Number(document.querySelector('#signal-valuation').value),
    note: document.querySelector('#signal-note').value.trim(),
    updatedAt: new Date().toISOString(),
  };
  saveSignals();
  render();
});

document.querySelector('#ticker-signal-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const symbol = document.querySelector('#signal-ticker').value;
  state.signals.tickers[symbol] = {
    proof: Number(document.querySelector('#ticker-proof').value),
    entry: Number(document.querySelector('#ticker-entry').value),
    note: document.querySelector('#ticker-note').value.trim(),
    updatedAt: new Date().toISOString(),
  };
  saveSignals();
  render();
});

document.querySelector('#reset-signals').addEventListener('click', () => {
  if (!window.confirm('Reset all manual confirmation signals in this browser?')) return;
  state.signals = { stages: {}, tickers: {} };
  saveSignals();
  populateStageForm();
  populateTickerForm();
  render();
});

loadData().catch((error) => {
  const message = window.location.protocol === 'file:'
    ? 'Dashboard data cannot load from a direct file open. Run node server.js and open http://localhost:8080.'
    : `Unable to load dashboard data: ${escapeHtml(error.message)}`;

  document.querySelector('#stage-grid').innerHTML = `
    <article class="stage-card error-card">
      <h3>Data did not load</h3>
      <p>${message}</p>
    </article>
  `;

  document.querySelector('#ticker-table').innerHTML = `
    <tr>
      <td colspan="8">${message}</td>
    </tr>
  `;
});
