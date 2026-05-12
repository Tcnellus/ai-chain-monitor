# Methodology

The AI Chain Monitor follows a lead-lag supply-chain framework. The goal is to identify where capital spending creates real orders, where bottlenecks appear, and where the market may not yet price future earnings power.

## The Five-Step Framework

### 1. Master Demand Signal

Track hyperscaler capex and capacity commentary.

Primary evidence:

- AI infrastructure capex guidance
- Cloud revenue growth
- Capacity constrained commentary
- Data center leasing or construction updates
- GPU cluster expansion plans

Representative tickers:

- `MSFT`
- `GOOGL`
- `AMZN`
- `META`
- `ORCL`
- `CRWV`

### 2. Current Bottleneck

Identify the supply area constraining the next unit of AI compute.

Common bottlenecks:

- HBM memory
- Advanced packaging
- Data center power
- Liquid cooling
- High-speed networking
- Grid interconnection

### 3. Lagging Supplier With Pricing Power

This is the main hunting ground. Look for suppliers where orders and backlog are improving before the market fully reprices earnings.

Positive signals:

- Backlog rising faster than revenue
- Orders growing faster than shipments
- Lead times extending
- Gross margin expanding
- Management raising guidance
- Customer prepayments or long-term contracts

Negative signals:

- Inventory rising faster than sales
- Backlog flattening
- Margin pressure despite strong revenue
- Customer concentration risk
- High valuation with slowing revisions

### 4. Cheap Versus Future Earnings

The strategy does not look for low multiples alone. It looks for valuation that is reasonable relative to forward estimate revisions.

Useful checks:

- Forward P/E
- EV/EBITDA
- Free cash flow yield
- EPS estimate revisions
- Revenue growth versus valuation
- Margin trajectory

### 5. Peak-Margin Trap Avoidance

A stock can have excellent current results while becoming risky as an equity.

Warning signs:

- Stock price rises faster than estimates
- Gross margin is at record highs
- Management talks about capacity digestion
- Customers delay new orders
- Inventory builds across the channel
- Analysts stop raising numbers

## Score Interpretation

Scores range from 1 to 5.

- 5: Very strong
- 4: Strong
- 3: Neutral
- 2: Weak
- 1: High risk or unattractive

The dashboard averages five scores:

- Demand signal
- Backlog/orders
- Estimate revision potential
- Valuation discipline
- Downside risk

For downside risk, a higher score means cleaner risk/reward. A lower score means greater downside risk.

## Confirmation Signals

The dashboard uses two signal layers.

Research defaults live in `data/signals.json`. These are updated when the research context changes, such as after earnings, capex guidance, or major backlog/order commentary.

Manual overrides are entered in the browser and stored with `localStorage`. They are useful for scenario testing or recording the user's own judgment. They are not pushed to GitHub unless they are later copied into the project data files or notes.

Stage-level confirmation signals:

- Demand / capex
- Orders / backlog
- Margins / pricing
- Guidance / revisions
- Valuation risk

Each field ranges from `-2` to `+2`.

- `+2`: strong positive confirmation
- `+1`: mild positive confirmation
- `0`: unchanged or unclear
- `-1`: mild weakness
- `-2`: clear weakness

Stage outcomes:

- `Early/accelerating`: strong positive average signal
- `Confirmed`: positive signal
- `Watch`: neutral signal
- `Weakening`: negative signal
- `Declining`: strong negative signal

Ticker-level confirmation signals:

- Company proof: whether the company-specific update confirms the thesis
- Entry quality: whether the current setup looks attractive, reasonable, crowded, or chase-risky

The adjusted ticker score combines the baseline research score with the manual stage signal and ticker signal. This is meant to prioritize research, not generate buy or sell instructions.
