# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-05

### Features
- FHS v4 formula with P1-P10 patches fully implemented
- Portfolio dashboard with 95 bots across all batches
- Bot drill-down with radar chart, component breakdown, and data source transparency
- ORIS evaluator integration (9 eval keys, 15-day window)
- CIE conversational intelligence integration (6 metrics from BigQuery view)
- Flowbuilder session metrics (latency P5, error-free, recovery, fallback)
- Flowbuilder Errors integration (P7: error load score, 9 categories, severity levels)
- Custom Agents integration (P10: 9 CA-specific eval keys with per-key negative value polarity)
- CA blending rules for components A, B, C, D, E when CA data coexists with ORIS/CIE
- Account Features integration (34 modules, complexity tiers, module chips in drill-down)
- Data Gaps detection section (cross-references expected vs actual data sources)
- Error distribution dashboard widget (global error breakdown by category)
- Bot error drill-down with severity, diagnosis, and recommended actions
- Complexity benchmarking (Basic/Medium/High tiers)
- Trilingual support (ES/EN/PT)
- Google OAuth authentication restricted to @yalo.com and @yalocontractor.com
- Security: Helmet headers, rate limiting, input validation, secure sessions
- Dark mode support

### Data source windows
- ORIS and Custom Agents: 15-day lookback
- Flowbuilder healthy metrics: 7-day rolling window
- CIE: most recent analysis_date per bot
- Flowbuilder Errors: latest ETL snapshot
