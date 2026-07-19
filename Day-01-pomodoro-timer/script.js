// DOM Elements
const timeDisplay = document.getElementById('center-time-display');
const startPauseBtn = document.getElementById('center-start-btn');
const resetBtn = document.getElementById('center-reset-btn');
const playIcon = document.getElementById('center-play-icon');
const pauseIcon = document.getElementById('center-pause-icon');
const timerStatus = document.getElementById('center-status-label');

const centerProgressFill = document.getElementById('center-progress-fill');
const centerPercentage = document.getElementById('center-percentage');

// Settings Modal & Customizer Elements
const openSettingsBtn = document.getElementById('open-settings-btn');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const settingsModal = document.getElementById('settings-modal');
const settingsForm = document.getElementById('settings-form');
const workDurationInput = document.getElementById('work-duration');
const breakDurationInput = document.getElementById('break-duration');
const themeOptionBtns = document.querySelectorAll('.theme-option-btn');

// Audio Mixer Elements
const rainPlayBtn = document.getElementById('rain-play-btn');
const rainVolumeSlider = document.getElementById('rain-volume');
const cafePlayBtn = document.getElementById('cafe-play-btn');
const cafeVolumeSlider = document.getElementById('cafe-volume');

// Top Notch Elements
const notchCollapsedTime = document.getElementById('notch-collapsed-time');
const notchExpandedTime = document.getElementById('notch-expanded-time');
const notchStatusLabel = document.getElementById('notch-status-label');
const notchProgressFill = document.getElementById('notch-progress-fill');
const notchPercentage = document.getElementById('notch-percentage');
const notchStartBtn = document.getElementById('notch-start-btn');
const notchResetBtn = document.getElementById('notch-reset-btn');

// Timer State Configuration
let WORK_TIME = 25 * 60; // 25 minutes in seconds
let BREAK_TIME = 5 * 60;  // 5 minutes in seconds

let currentMode = 'work'; // 'work' or 'break'
let timeTotal = WORK_TIME;
let timeLeft = WORK_TIME;
let isRunning = false;
let timerInterval = null;
let expectedEndTime = null;



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
  if (timeDisplay) timeDisplay.textContent = timeString;
  
  // Update browser tab title
  const modeLabel = currentMode === 'work' ? 'Work' : 'Break';
  document.title = `[${timeString}] - ${modeLabel} Timer`;

  const progressRatio = timeInSeconds / timeTotal;

  // Synchronize top notch clock elements
  if (notchCollapsedTime) notchCollapsedTime.textContent = timeString;
  if (notchExpandedTime) notchExpandedTime.textContent = timeString;

  // Calculate and synchronize notch progress indicators (elapsed time)
  const elapsedPercent = Math.min(100, Math.max(0, Math.round((1 - progressRatio) * 100)));
  if (notchPercentage) notchPercentage.textContent = `${elapsedPercent}%`;
  if (notchProgressFill) notchProgressFill.style.width = `${elapsedPercent}%`;

  // Calculate and synchronize center large progress indicators (elapsed time)
  if (centerPercentage) centerPercentage.textContent = `${elapsedPercent}%`;
  if (centerProgressFill) centerProgressFill.style.width = `${elapsedPercent}%`;
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
  if (playIcon) playIcon.classList.add('hidden');
  if (pauseIcon) pauseIcon.classList.remove('hidden');
  if (startPauseBtn) startPauseBtn.setAttribute('aria-label', 'Pause Timer');

  // Update notch control icon (show pause symbol)
  if (notchStartBtn) {
    notchStartBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
      </svg>`;
  }

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
  if (playIcon) playIcon.classList.remove('hidden');
  if (pauseIcon) pauseIcon.classList.add('hidden');
  if (startPauseBtn) startPauseBtn.setAttribute('aria-label', 'Start Timer');

  // Update notch control icon (show play symbol)
  if (notchStartBtn) {
    notchStartBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z" />
      </svg>`;
  }
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
    if (notchStatusLabel) notchStatusLabel.textContent = 'Work Session';
    
    // Set theme colors to Work mode (Coral/Red)
    document.documentElement.style.setProperty('--color-accent', '#f87171');
    document.documentElement.style.setProperty('--color-accent-glow', 'rgba(248, 113, 113, 0.25)');
    
    timeTotal = WORK_TIME;
  } else {
    workBtn.classList.remove('active');
    breakBtn.classList.add('active');
    timerStatus.textContent = 'Break Session';
    if (notchStatusLabel) notchStatusLabel.textContent = 'Break Session';
    
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

// Modal Settings Handlers
function openSettings() {
  workDurationInput.value = Math.floor(WORK_TIME / 60);
  breakDurationInput.value = Math.floor(BREAK_TIME / 60);
  settingsModal.classList.remove('hidden');
}

function closeSettings() {
  settingsModal.classList.add('hidden');
}

function saveSettings(e) {
  e.preventDefault();
  
  const newWorkMin = parseInt(workDurationInput.value, 10);
  const newBreakMin = parseInt(breakDurationInput.value, 10);
  
  if (isNaN(newWorkMin) || newWorkMin < 1 || isNaN(newBreakMin) || newBreakMin < 1) {
    alert('Please enter valid positive numbers for intervals.');
    return;
  }
  
  WORK_TIME = newWorkMin * 60;
  BREAK_TIME = newBreakMin * 60;
  
  // Recalculate based on current mode
  timeTotal = currentMode === 'work' ? WORK_TIME : BREAK_TIME;
  
  resetTimer();
  closeSettings();
}

// Background Theme Handler
function generateRain() {
  const container = document.getElementById('rain-container');
  if (!container) return;
  
  container.innerHTML = '';
  const dropCount = 80;
  
  for (let i = 0; i < dropCount; i++) {
    const drop = document.createElement('div');
    drop.classList.add('rain-drop');
    
    const left = Math.random() * 100;
    const duration = 0.5 + Math.random() * 0.7;
    const delay = Math.random() * 1.5;
    const opacity = 0.2 + Math.random() * 0.5;
    
    drop.style.left = `${left}%`;
    drop.style.animationDuration = `${duration}s`;
    drop.style.animationDelay = `${delay}s`;
    drop.style.opacity = opacity;
    
    container.appendChild(drop);
  }
}

function changeTheme(themeName) {
  // Update active button state
  themeOptionBtns.forEach(btn => {
    if (btn.getAttribute('data-theme') === themeName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Update body classes
  document.body.className = ''; // reset classes
  document.body.classList.add(`theme-${themeName}`);
  
  // Manage Rain Overlay
  const container = document.getElementById('rain-container');
  if (container) {
    container.innerHTML = '';
    if (themeName === 'rain') {
      generateRain();
    }
  }
}

// Event Listeners
startPauseBtn.addEventListener('click', handleStartPause);
resetBtn.addEventListener('click', resetTimer);
if (notchStartBtn) notchStartBtn.addEventListener('click', handleStartPause);
if (notchResetBtn) notchResetBtn.addEventListener('click', resetTimer);
workBtn.addEventListener('click', () => switchMode('work'));
breakBtn.addEventListener('click', () => switchMode('break'));

openSettingsBtn.addEventListener('click', openSettings);
closeSettingsBtn.addEventListener('click', closeSettings);
settingsForm.addEventListener('submit', saveSettings);

// Close modal when clicking outside of it
settingsModal.addEventListener('click', (e) => {
  if (e.target === settingsModal) {
    closeSettings();
  }
});

// Setup Themes
themeOptionBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const theme = btn.getAttribute('data-theme');
    changeTheme(theme);
  });
});

// Ambient Audio Mixer State & Logic
let rainAudio = null;
let cafeAudio = null;

function toggleRain() {
  if (!rainAudio) {
    rainAudio = new Audio('https://raw.githubusercontent.com/bradtraversy/ambient-sound-mixer/main/audio/rain.mp3');
    rainAudio.loop = true;
    rainAudio.volume = parseFloat(rainVolumeSlider.value);
  }
  
  if (rainAudio.paused) {
    rainAudio.play().catch(err => console.warn('Audio play block:', err));
    rainPlayBtn.textContent = 'Pause';
    rainPlayBtn.classList.add('playing');
    rainVolumeSlider.removeAttribute('disabled');
  } else {
    rainAudio.pause();
    rainPlayBtn.textContent = 'Play';
    rainPlayBtn.classList.remove('playing');
    rainVolumeSlider.setAttribute('disabled', 'true');
  }
}

function toggleCafe() {
  if (!cafeAudio) {
    cafeAudio = new Audio('https://raw.githubusercontent.com/bradtraversy/ambient-sound-mixer/main/audio/cafe.mp3');
    cafeAudio.loop = true;
    cafeAudio.volume = parseFloat(cafeVolumeSlider.value);
  }
  
  if (cafeAudio.paused) {
    cafeAudio.play().catch(err => console.warn('Audio play block:', err));
    cafePlayBtn.textContent = 'Pause';
    cafePlayBtn.classList.add('playing');
    cafeVolumeSlider.removeAttribute('disabled');
  } else {
    cafeAudio.pause();
    cafePlayBtn.textContent = 'Play';
    cafePlayBtn.classList.remove('playing');
    cafeVolumeSlider.setAttribute('disabled', 'true');
  }
}

// Audio volume event bindings
rainVolumeSlider.addEventListener('input', (e) => {
  if (rainAudio) rainAudio.volume = parseFloat(e.target.value);
});

cafeVolumeSlider.addEventListener('input', (e) => {
  if (cafeAudio) cafeAudio.volume = parseFloat(e.target.value);
});

// Bind audio buttons
rainPlayBtn.addEventListener('click', toggleRain);
cafePlayBtn.addEventListener('click', toggleCafe);

// Live Header Clock
function updateHeaderClock() {
  const timeEl = document.getElementById('header-time');
  const dateEl = document.getElementById('header-date');
  if (!timeEl || !dateEl) return;
  
  const now = new Date();
  
  // Format Time (e.g., "12:34 PM")
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  timeEl.textContent = `${hours}:${minutes} ${ampm}`;
  
  // Format Date (e.g., "Mon, Jul 20")
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  dateEl.textContent = now.toLocaleDateString('en-US', options);
}

// Initial Load UI Setup
document.body.classList.add('theme-space'); // Default theme
updateDisplay(timeLeft);
updateHeaderClock();
setInterval(updateHeaderClock, 1000);
