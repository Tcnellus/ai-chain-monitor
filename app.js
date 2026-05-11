const state = {
  stages: [],
  tickers: [],
  step3Only: false,
  stageFilter: 'all',
};

const scoreTicker = (ticker) => {
  const values = [
    ticker.scores.demandSignal,
    ticker.scores.backlogOrders,
    ticker.scores.estimateRevisionPotential,
    ticker.scores.valuationDiscipline,
    ticker.scores.downsideRisk,
  ];
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const formatScore = (score) => score.toFixed(1);

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

  stageGrid.innerHTML = visibleStages.map((stage) => `
    <article class="stage-card">
      <h3>${stage.name}</h3>
      <p>${stage.description}</p>
      <div class="stage-meta">
        <span>${stage.currentSignal}</span>
        <span>${stage.cyclePosition}</span>
      </div>
    </article>
  `).join('');
};

const renderTickers = () => {
  const rows = document.querySelector('#ticker-table');
  const count = document.querySelector('#ticker-count');

  const filtered = state.tickers
    .filter((ticker) => !state.step3Only || ticker.strategyStep === 3)
    .filter((ticker) => state.stageFilter === 'all' || ticker.stageId === state.stageFilter)
    .map((ticker) => ({ ...ticker, score: scoreTicker(ticker) }))
    .sort((a, b) => b.score - a.score);

  count.textContent = filtered.length;

  rows.innerHTML = filtered.map((ticker, index) => `
    <tr>
      <td>${index + 1}</td>
      <td><span class="ticker">${ticker.symbol}</span><br>${ticker.company}</td>
      <td>${ticker.stageName}</td>
      <td><span class="signal ${ticker.signal.toLowerCase()}">${ticker.signal}</span></td>
      <td><span class="score">${formatScore(ticker.score)}</span></td>
      <td>${ticker.thesis}</td>
      <td>${ticker.downsideTrigger}</td>
    </tr>
  `).join('');
};

const render = () => {
  renderStages();
  renderTickers();
  document.querySelector('#show-step3').classList.toggle('active', state.step3Only);
  document.querySelector('#show-all').classList.toggle('active', !state.step3Only);
};

const loadData = async () => {
  const [stagesResponse, tickersResponse] = await Promise.all([
    fetch('data/chain-stages.json'),
    fetch('data/tickers.json'),
  ]);

  state.stages = await stagesResponse.json();
  state.tickers = await tickersResponse.json();
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

loadData().catch((error) => {
  document.querySelector('#ticker-table').innerHTML = `
    <tr>
      <td colspan="7">Unable to load dashboard data: ${error.message}</td>
    </tr>
  `;
});

