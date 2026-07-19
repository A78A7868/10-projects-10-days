# Day 01: Pomodoro Timer

A premium, responsive, dark-themed Pomodoro countdown timer built using modern semantic HTML5, clean CSS3 custom properties, and vanilla ES6+ JavaScript.

This is **Project 01** of the "10 Projects in 10 Days" challenge.

---

## Live Demo & Preview
To open the project, simply open the `index.html` file in any modern web browser.

---

## Core Features
- **Accurate Countdown**: Prevents timer drift by calculating interval differences using `Date.now()` timestamp differences.
- **Background Syncing**: Keeps counting correctly even when the browser tab is backgrounded or suspended.
- **Dynamic Tab Title**: Displays the current countdown time directly in the browser tab title (e.g., `[25:00] - Work Timer`).
- **Dynamic Theme Swapping**: Transition theme styles dynamically between Work mode (Coral/Red) and Break mode (Emerald/Green).
- **Responsive Circular Progress**: SVG-based ring that matches the exact remaining timer ratio and scales smoothly on mobile viewports.
- **Synthesized Audio Alert**: Generates a pleasant dual-tone alarm beep using the Web Audio API, eliminating the need to fetch external media files.

---

## File Structure
```text
Day-01-pomodoro-timer/
├── index.html   # Main layout structure & SVG ring
├── style.css    # UI custom variable styling & responsiveness
├── script.js    # Timer logic & Audio synthesis
└── README.md    # Documentation
```

---

## Technical Details

### 1. Circle Progress Calculation
The progress ring uses the SVG circle property `stroke-dashoffset`.
- **Radius**: `135px`
- **Circumference**: \(2 \times \pi \times 135 \approx 848.23\)
- **Formula**:
  ```javascript
  const progressRatio = timeInSeconds / timeTotal;
  const offset = CIRCUMFERENCE - (progressRatio * CIRCUMFERENCE);
  progressCircle.style.strokeDashoffset = offset;
  ```

### 2. Audio Synthesis
Instead of downloading external `.mp3` files, the timer synthesizes beeps on-the-fly:
```javascript
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const osc = audioCtx.createOscillator();
osc.type = 'sine';
osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
// exponential decay for pleasant fade-out...
```
