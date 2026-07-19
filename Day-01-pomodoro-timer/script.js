// DOM Elements
const timeDisplay = document.getElementById('time-display');
const startPauseBtn = document.getElementById('start-pause-btn');
const resetBtn = document.getElementById('reset-btn');
const progressCircle = document.getElementById('progress-circle');
const playIcon = document.getElementById('play-icon');
const pauseIcon = document.getElementById('pause-icon');
const startPauseLabel = document.getElementById('start-pause-label');
const timerStatus = document.getElementById('timer-status');
const workBtn = document.getElementById('work-btn');
const breakBtn = document.getElementById('break-btn');

// Timer State Configuration
const WORK_TIME = 25 * 60; // 25 minutes in seconds
const BREAK_TIME = 5 * 60;  // 5 minutes in seconds

let currentMode = 'work'; // 'work' or 'break'
let timeTotal = WORK_TIME;
let timeLeft = WORK_TIME;
let isRunning = false;
let timerInterval = null;
let expectedEndTime = null;

// Progress Ring Configuration
// Circumference = 2 * pi * r = 2 * 3.14159 * 135 = 848.23
const CIRCUMFERENCE = 848.23;

// Initialize circle properties
progressCircle.style.strokeDasharray = CIRCUMFERENCE;
progressCircle.style.strokeDashoffset = 0;

/**
 * Format time in seconds to MM:SS string
 * @param {number} timeInSeconds 
 * @returns {string}
 */
function formatTime(timeInSeconds) {
  const mins = Math.floor(timeInSeconds / 60);
  const secs = timeInSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Update UI timer display, page title, and SVG circular progress
 * @param {number} timeInSeconds 
 */
function updateDisplay(timeInSeconds) {
  // Update time text
  const timeString = formatTime(timeInSeconds);
  timeDisplay.textContent = timeString;
  
  // Update browser tab title
  const modeLabel = currentMode === 'work' ? 'Work' : 'Break';
  document.title = `[${timeString}] - ${modeLabel} Timer`;

  // Calculate and update circle progress offset
  const progressRatio = timeInSeconds / timeTotal;
  const offset = CIRCUMFERENCE - (progressRatio * CIRCUMFERENCE);
  progressCircle.style.strokeDashoffset = offset;
}

/**
 * Main countdown tick handler
 * Uses delta timestamp math to prevent drift when browser tabs are backgrounded
 */
function tick() {
  const now = Date.now();
  const remaining = Math.max(0, Math.round((expectedEndTime - now) / 1000));
  
  timeLeft = remaining;
  updateDisplay(timeLeft);
  
  if (timeLeft <= 0) {
    handleSessionComplete();
  }
}

/**
 * Start the countdown timer
 */
function startTimer() {
  if (isRunning) return;
  
  isRunning = true;
  expectedEndTime = Date.now() + timeLeft * 1000;
  
  // Update UI controls state
  playIcon.classList.add('hidden');
  pauseIcon.classList.remove('hidden');
  startPauseLabel.textContent = 'Pause';
  startPauseBtn.setAttribute('aria-label', 'Pause Timer');

  // Trigger tick immediately, then set interval
  tick();
  timerInterval = setInterval(tick, 200); // Poll frequently to ensure UI sync
}

/**
 * Pause the countdown timer
 */
function pauseTimer() {
  if (!isRunning) return;
  
  isRunning = false;
  clearInterval(timerInterval);
  timerInterval = null;
  
  // Update UI controls state
  playIcon.classList.remove('hidden');
  pauseIcon.classList.add('hidden');
  startPauseLabel.textContent = 'Start';
  startPauseBtn.setAttribute('aria-label', 'Start Timer');
}

/**
 * Reset timer to default total time for current mode
 */
function resetTimer() {
  pauseTimer();
  timeLeft = timeTotal;
  updateDisplay(timeLeft);
}

/**
 * Handle Start/Pause Toggle
 */
function handleStartPause() {
  if (isRunning) {
    pauseTimer();
  } else {
    startTimer();
  }
}

/**
 * Switch between Work and Break modes
 * @param {string} mode - 'work' or 'break'
 */
function switchMode(mode) {
  if (mode === currentMode) return;
  
  currentMode = mode;
  
  // Update button active state
  if (currentMode === 'work') {
    workBtn.classList.add('active');
    breakBtn.classList.remove('active');
    timerStatus.textContent = 'Work Session';
    
    // Set theme colors to Work mode (Coral/Red)
    document.documentElement.style.setProperty('--color-accent', '#f87171');
    document.documentElement.style.setProperty('--color-accent-glow', 'rgba(248, 113, 113, 0.25)');
    
    timeTotal = WORK_TIME;
  } else {
    workBtn.classList.remove('active');
    breakBtn.classList.add('active');
    timerStatus.textContent = 'Break Session';
    
    // Set theme colors to Break mode (Emerald/Green)
    document.documentElement.style.setProperty('--color-accent', '#34d399');
    document.documentElement.style.setProperty('--color-accent-glow', 'rgba(52, 211, 153, 0.25)');
    
    timeTotal = BREAK_TIME;
  }
  
  resetTimer();
}

/**
 * Play a synthesized dual-tone alert sound using the Web Audio API
 */
function playAlertSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Tone 1
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, audioCtx.currentTime);
    gain1.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
    osc1.start(audioCtx.currentTime);
    osc1.stop(audioCtx.currentTime + 0.4);
    
    // Tone 2
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.4);
    gain2.gain.setValueAtTime(0.15, audioCtx.currentTime + 0.4);
    gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.75);
    osc2.start(audioCtx.currentTime + 0.4);
    osc2.stop(audioCtx.currentTime + 0.8);
  } catch (err) {
    console.warn('Audio Context error:', err);
  }
}

/**
 * Handle Session Completion
 */
function handleSessionComplete() {
  pauseTimer();
  playAlertSound();
  
  // Switch to the other mode automatically
  const nextMode = currentMode === 'work' ? 'break' : 'work';
  switchMode(nextMode);
}

// Event Listeners
startPauseBtn.addEventListener('click', handleStartPause);
resetBtn.addEventListener('click', resetTimer);
workBtn.addEventListener('click', () => switchMode('work'));
breakBtn.addEventListener('click', () => switchMode('break'));

// Initial Load UI Setup
updateDisplay(timeLeft);
