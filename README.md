# AI Chain Monitor

A lightweight dashboard for tracking the AI infrastructure supply chain from hyperscaler capex through chips, memory, packaging, power, cooling, networking, and AI software ROI.

The project is built to support a lead-lag investment workflow:

1. Identify the master demand signal.
2. Locate the current bottleneck.
3. Watch lagging suppliers with pricing power.
4. Compare valuation against forward earnings potential.
5. Avoid peak-margin traps.

> This project is for research and education only. It is not financial advice, investment advice, or a recommendation to buy or sell securities.

## Quick Start

This first version is a static site with no build step.

On Windows, double-click:

```text
start-dashboard.bat
```

Or run it manually:

```powershell
cd ai-chain-monitor
node server.js
```

Then open:

```text
http://localhost:8080
```

You can also deploy the repository directly with GitHub Pages.

## Project Structure

```text
ai-chain-monitor/
  index.html
  styles.css
  app.js
  data/
    chain-stages.json
    tickers.json
  docs/
    methodology.md
    review-cadence.md
  notes/
    earnings-watch.md
    thesis-log.md
  .github/
    workflows/
      pages.yml
```

## Current Focus

V1 emphasizes Step 3 candidates: suppliers that may benefit after hyperscaler capex and GPU demand kick off the next chain link.

Representative watch areas:

- Grid and electrical infrastructure
- Data center power and cooling
- Advanced packaging and semiconductor test
- Networking, optics, and high-speed connectivity

## How To Use

1. Update `data/tickers.json` after each earnings report.
2. Add notes to `notes/earnings-watch.md`.
3. Adjust scores when backlog, guidance, valuation, or downside risk changes.
4. Review rankings on the dashboard.

The dashboard also supports manual confirmation signals. Use the Confirmation Signals panel to score fresh evidence for a stage or individual ticker. These manual entries are saved in your browser, so they are useful for quick review without changing repository files.

## Scoring Model

Each ticker receives a simple 1-5 score across:

- Demand signal
- Backlog/orders
- Estimate revision potential
- Valuation discipline
- Downside risk

The dashboard averages those fields into a research score. The score is only a prioritization tool, not a trading signal.

## Roadmap

- Add SEC filing/transcript checklist
- Add earnings calendar
- Add price and valuation data source
- Add historical score snapshots
- Add chain-stage heat map
- Add GitHub Actions data refresh job
