# Day 2: TrackFi — AI-Powered Expense Tracker App

> **10 Projects in 10 Days Challenge — Day 2**

TrackFi is a high-performance, ultra-premium web application and landing page designed for automated personal expense tracking. Inspired by modern fintech interfaces, TrackFi combines an AI receipt scanner simulation, voice entry prompt parser, interactive SVG category charts, monthly budget caps, filterable transaction ledgers, and CSV export capabilities.

---

## ✨ Features

- **Hero & Landing Page Showcase**:
  - High-resolution dark obsidian design system (`#08090d`) with vibrant neon lime accents (`#c0ef28`).
  - Simulated phone mockup frame with live glassmorphic floating statistics.
  - Download badges for Apple App Store and Google Play.

- **AI Capabilities Suite**:
  - **Scan Your Receipts (OCR Engine)**: Instant receipt parameter extraction simulation parsing merchant, line items, and total cost in <200ms.
  - **Smart Categorization**: Auto-tagging into Dining, Groceries, Transport, Electronics, Utilities, and Income.
  - **Voice Expense Entry WITH AI**: Natural language prompt parsing (extracting amount, category, and vendor notes).

- **Live Financial Dashboard Suite**:
  - **Key Metrics Overview**: Real-time Net Balance, Total Income, Total Outflow Expenses, and Savings Target Meter.
  - **SVG Donut Chart**: Dynamic category spending distribution rendering with interactive legends.
  - **Budget Goal Meters**: Category spend progress bars with visual overflow warnings (>90%).
  - **Filterable Transaction Ledger**: Full-text search, category dropdown filter, type toggle filter, item deletion, and `localStorage` persistence.
  - **Data Export**: Export your entire ledger to a downloadable `.csv` file.

---

## 🛠️ Technology Stack

- **HTML5**: Semantic tags, accessibility attributes, custom SVG charts.
- **CSS3**: Vanilla CSS variables, glassmorphism (`backdrop-filter`), CSS grid/flexbox, custom laser scan keyframes.
- **JavaScript (ES6+)**: Delta calculations, DOM event delegation, regex prompt parsers, CSV Blob generator, local storage state synchronization.

---

## 📁 File Structure

```
Day-02-expense-tracker/
├── index.html    # Full landing page & interactive live dashboard
├── style.css     # TrackFi dark design system & animations
├── script.js    # AI OCR engine simulation, chart rendering & ledger logic
└── README.md     # Project documentation
```

---

## 🚀 Getting Started

Simply open `index.html` in any web browser or serve it locally using a HTTP server:

```bash
cd Day-02-expense-tracker
python3 -m http.server 8000
```

Visit `http://localhost:8000/Day-02-expense-tracker/` in your browser.
