import { SOUND_CATALOG, SCENARIO_PRESETS, FelineAudioEngine } from './audio-engine.js';

const DEFAULT_HIDING_SPOTS = [
  { id: 'spot-1', name: 'ใต้เตียงนอน (ลึกชิดหัวเตียง)', room: 'ห้องนอน / ใต้เตียง', checked: false },
  { id: 'spot-2', name: 'ในตู้เสื้อผ้า / ตะกร้าผ้าซัก', room: 'ในตู้เสื้อผ้า / ลิ้นชัก', checked: false },
  { id: 'spot-3', name: 'ใต้โซฟา หรือซอกเบาะพิงหลัง', room: 'ห้องนั่งเล่น / ใต้โซฟา', checked: false },
  { id: 'spot-4', name: 'ข้างหรือหลังตู้เย็น / ไมโครเวฟ (จุดอุ่น)', room: 'ห้องครัว / หลังตู้เย็น', checked: false },
  { id: 'spot-5', name: 'หลังเครื่องซักผ้า หรือใต้อ่างล้างหน้า', room: 'หลังเครื่องซักผ้า / ห้องน้ำ', checked: false },
  { id: 'spot-6', name: 'ในกล่องพัสดุ / ถุงกระดาษ / กระเป๋าเดินทาง', room: 'ห้องนั่งเล่น / ใต้โซฟา', checked: false },
  { id: 'spot-7', name: 'หลังผ้าม่านทึบ หรือขอบหน้าต่าง', room: 'ห้องนอน / ใต้เตียง', checked: false },
  { id: 'spot-8', name: 'ซอกกระถางต้นไม้ หรือใต้เก้าอี้ระเบียง', room: 'ระเบียง / หลังมุ้งลวด', checked: false }
];

const audioEngine = new FelineAudioEngine();

const state = {
  theme: localStorage.getItem('whererukitty_theme') || 'day',
  activePresetId: 'vocal-reply',
  activeCategory: 'all',
  selectedSoundId: 'mother-trill',
  currentlyPlayingSoundId: null,
  queue: ['mother-trill', 'kitten-mew', 'wet-can'],
  queueIndex: 0,
  workedSounds: JSON.parse(localStorage.getItem('whererukitty_worked') || '["mother-trill", "wet-can"]'),
  callSeconds: 3,
  listenSeconds: 4,
  volume: 85,
  pitch: 100,
  gentleMode: false,
  autoMic: false,
  micActive: false,

  // Cycle State Machine: 'idle' | 'calling' | 'listening'
  cycleRunning: false,
  cyclePhase: 'idle',
  phaseStartedAt: 0,
  singlePlayTimer: null,
  lastDetectionLoggedAt: 0,

  activeRoom: 'ห้องนอน / ใต้เตียง',
  detectionLog: JSON.parse(localStorage.getItem('whererukitty_detections') || '[]'),
  hidingSpots: JSON.parse(localStorage.getItem('whererukitty_spots') || JSON.stringify(DEFAULT_HIDING_SPOTS)),

  isRecordingVoice: false,
  mediaRecorder: null,
  hardwareTorchTrack: null
};

// DOM Elements
const docHtml = document.documentElement;
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeToggleLabel = document.getElementById('themeToggleLabel');
const openTorchBtn = document.getElementById('openTorchBtn');
const closeTorchBtn = document.getElementById('closeTorchBtn');
const torchDialog = document.getElementById('torchDialog');
const torchSurface = document.getElementById('torchSurface');
const torchCallBtn = document.getElementById('torchCallBtn');
const hardwareFlashBtn = document.getElementById('hardwareFlashBtn');
const hardwareFlashText = document.getElementById('hardwareFlashText');

const phaseBadge = document.getElementById('phaseBadge');
const activeSoundTitle = document.getElementById('activeSoundTitle');
const phaseTimerText = document.getElementById('phaseTimerText');
const cycleToggleBtn = document.getElementById('cycleToggleBtn');
const cyclePlayIcon = document.getElementById('cyclePlayIcon');
const cycleStopIcon = document.getElementById('cycleStopIcon');
const cycleBtnLabel = document.getElementById('cycleBtnLabel');
const singlePulseBtn = document.getElementById('singlePulseBtn');

const cycleProgressBar = document.getElementById('cycleProgressBar');
const callSecDisplay = document.getElementById('callSecDisplay');
const listenSecDisplay = document.getElementById('listenSecDisplay');
const callPhaseFill = document.getElementById('callPhaseFill');
const listenPhaseFill = document.getElementById('listenPhaseFill');
const liveDbReadout = document.getElementById('liveDbReadout');
const spectrumCanvas = document.getElementById('spectrumCanvas');
const spectrumCtx = spectrumCanvas.getContext('2d');

const queueCountText = document.getElementById('queueCountText');
const queueChipList = document.getElementById('queueChipList');
const presetList = document.getElementById('presetList');
const workedTabCount = document.getElementById('workedTabCount');
const soundPadGrid = document.getElementById('soundPadGrid');

const volumeSlider = document.getElementById('volumeSlider');
const volumeValueText = document.getElementById('volumeValueText');
const pitchSlider = document.getElementById('pitchSlider');
const pitchValueText = document.getElementById('pitchValueText');
const callDurationSlider = document.getElementById('callDurationSlider');
const callDurationText = document.getElementById('callDurationText');
const listenDurationSlider = document.getElementById('listenDurationSlider');
const listenDurationText = document.getElementById('listenDurationText');
const gentleModeSwitch = document.getElementById('gentleModeSwitch');
const autoMicSwitch = document.getElementById('autoMicSwitch');

const radarAlertBanner = document.getElementById('radarAlertBanner');
const radarStatusTitle = document.getElementById('radarStatusTitle');
const radarStatusSub = document.getElementById('radarStatusSub');
const enableMicBtn = document.getElementById('enableMicBtn');
const enableMicBtnText = document.getElementById('enableMicBtnText');
const simulateReplyBtn = document.getElementById('simulateReplyBtn');
const detectionCount = document.getElementById('detectionCount');
const clearLogBtn = document.getElementById('clearLogBtn');
const detectionLogList = document.getElementById('detectionLogList');

const customVoiceBadge = document.getElementById('customVoiceBadge');
const recordTimerText = document.getElementById('recordTimerText');
const recordVoiceBtn = document.getElementById('recordVoiceBtn');
const recordVoiceBtnText = document.getElementById('recordVoiceBtnText');
const playCustomVoiceBtn = document.getElementById('playCustomVoiceBtn');
const queueCustomVoiceBtn = document.getElementById('queueCustomVoiceBtn');

const checklistProgressText = document.getElementById('checklistProgressText');
const activeRoomSelect = document.getElementById('activeRoomSelect');
const hidingSpotList = document.getElementById('hidingSpotList');
const addSpotForm = document.getElementById('addSpotForm');
const newSpotInput = document.getElementById('newSpotInput');
const foundCatBtn = document.getElementById('foundCatBtn');
const resetChecklistBtn = document.getElementById('resetChecklistBtn');

const mobileCycleBtn = document.getElementById('mobileCycleBtn');
const mobileCycleBtnText = document.getElementById('mobileCycleBtnText');
const mobileMotherCallBtn = document.getElementById('mobileMotherCallBtn');
const mobileWetCanBtn = document.getElementById('mobileWetCanBtn');
const mobileTorchBtn = document.getElementById('mobileTorchBtn');

/**
 * Helper: Lookup sound metadata by ID
 */
function getSoundMeta(soundId) {
  if (soundId === 'custom-voice') {
    return {
      id: 'custom-voice',
      category: 'sonic',
      categoryLabel: 'เสียงเจ้าของ',
      title: 'เสียงคุณเรียกชื่อแมว',
      subtitle: 'Custom Owner Call',
      freqBand: '300 – 3,400 Hz',
      durationSec: 2.8,
      purpose: 'เสียงคุณเรียกชื่อแมวหรือเขย่าขนมที่อัดไว้เอง'
    };
  }
  return SOUND_CATALOG.find((s) => s.id === soundId) || SOUND_CATALOG[0];
}

/**
 * 1. Modern Web Guidance: Sync Range Slider CSS Custom Properties (`--attr-min`, `--attr-max`, `--control-value`)
 */
function syncSliderCustomProps(slider) {
  slider.style.setProperty('--attr-min', slider.min || 0);
  slider.style.setProperty('--attr-max', slider.max || 100);
  slider.style.setProperty('--control-value', slider.value);
}

function initAllSliders() {
  const sliders = [volumeSlider, pitchSlider, callDurationSlider, listenDurationSlider];
  sliders.forEach((s) => {
    syncSliderCustomProps(s);
    s.addEventListener('input', () => syncSliderCustomProps(s));
  });
}

/**
 * 2. Modern Web Guidance: Switch progressive enhancement fallback
 */
function initSwitches() {
  const switches = document.querySelectorAll('input[type="checkbox"][switch]');
  const nativeSwitchSupported = 'switch' in HTMLInputElement.prototype;
  switches.forEach((sw) => {
    if (!nativeSwitchSupported) {
      sw.setAttribute('role', 'switch');
    }
    sw.setAttribute('aria-checked', String(sw.checked));
    sw.addEventListener('change', () => {
      sw.setAttribute('aria-checked', String(sw.checked));
    });
  });
}

/**
 * 3. Modern Web Guidance: Light-Dismiss Dialog (`closedby="any"` + mandatory backdrop click fallback)
 */
function initTorchDialog() {
  const openModal = () => {
    if (!torchDialog.open) {
      torchDialog.showModal();
    }
  };

  openTorchBtn.addEventListener('click', openModal);
  mobileTorchBtn.addEventListener('click', openModal);
  closeTorchBtn.addEventListener('click', () => torchDialog.close());

  // Fallback for browsers without closedby support
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    torchDialog.addEventListener('click', (event) => {
      if (event.target !== torchDialog) return;
      const rect = torchDialog.getBoundingClientRect();
      const isDialogContent =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width;
      if (isDialogContent) return;
      torchDialog.close();
    });
  }

  // Beam color selector inside Torch dialog
  const beamBtns = torchDialog.querySelectorAll('.beam-btn');
  beamBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const color = btn.dataset.beamColor;
      torchSurface.dataset.beam = color;
      beamBtns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('is-selected', active);
        b.setAttribute('aria-checked', String(active));
      });
    });
  });

  torchCallBtn.addEventListener('click', () => {
    triggerSingleSound('mother-trill');
  });

  hardwareFlashBtn.addEventListener('click', toggleHardwareFlash);
}

async function toggleHardwareFlash() {
  if (state.hardwareTorchTrack) {
    try {
      await state.hardwareTorchTrack.applyConstraints({ advanced: [{ torch: false }] });
      state.hardwareTorchTrack.stop();
    } catch (_) {}
    state.hardwareTorchTrack = null;
    hardwareFlashBtn.setAttribute('aria-pressed', 'false');
    hardwareFlashText.textContent = 'เปิดไฟแฟลชกล้องหลัง (ถ้าอุปกรณ์รองรับ)';
    return;
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    hardwareFlashText.textContent = 'อุปกรณ์นี้ใช้แสงสว่างจากหน้าจอแทนไฟแฟลช';
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    });
    const track = stream.getVideoTracks()[0];
    const capabilities = track.getCapabilities ? track.getCapabilities() : {};
    if (!capabilities.torch) {
      track.stop();
      hardwareFlashText.textContent = 'ใช้โหมดแสงหน้าจอ (อุปกรณ์ไม่มีแฟลชหลัง)';
      return;
    }
    await track.applyConstraints({ advanced: [{ torch: true }] });
    state.hardwareTorchTrack = track;
    hardwareFlashBtn.setAttribute('aria-pressed', 'true');
    hardwareFlashText.textContent = 'ปิดไฟแฟลชกล้องหลัง';
  } catch (_) {
    hardwareFlashText.textContent = 'ใช้แสงสว่างหน้าจอแทน (ไม่ได้เปิดสิทธิ์กล้อง)';
  }
}

/**
 * Theme Toggle (Day vs Dim-Room Inspection Mode)
 */
function applyTheme(theme) {
  state.theme = theme;
  docHtml.setAttribute('data-theme', theme);
  const isDim = theme === 'dim';
  themeToggleBtn.setAttribute('aria-pressed', String(isDim));
  themeToggleLabel.textContent = isDim ? 'โหมดกลางวัน' : 'โหมดที่มืด';
  localStorage.setItem('whererukitty_theme', theme);
}

themeToggleBtn.addEventListener('click', () => {
  applyTheme(state.theme === 'day' ? 'dim' : 'day');
});

/**
 * Render Scenario Quick Presets
 */
function renderPresets() {
  presetList.innerHTML = '';
  SCENARIO_PRESETS.forEach((preset) => {
    const isSelected = state.activePresetId === preset.id;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'preset-btn';
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', String(isSelected));
    btn.innerHTML = `
      <span class="preset-btn-title">${preset.title}</span>
      <span class="preset-btn-sub">${preset.subtitle}</span>
    `;
    btn.addEventListener('click', () => selectPreset(preset));
    presetList.appendChild(btn);
  });
}

function selectPreset(preset) {
  state.activePresetId = preset.id;
  state.queue = [...preset.sequence];
  state.queueIndex = 0;
  state.selectedSoundId = preset.sequence[0];
  state.callSeconds = preset.callSeconds;
  state.listenSeconds = preset.listenSeconds;
  state.gentleMode = preset.gentleMode;
  state.pitch = Math.round(preset.pitch * 100);

  callDurationSlider.value = String(state.callSeconds);
  listenDurationSlider.value = String(state.listenSeconds);
  pitchSlider.value = String(state.pitch);
  gentleModeSwitch.checked = state.gentleMode;
  gentleModeSwitch.setAttribute('aria-checked', String(state.gentleMode));

  syncSliderCustomProps(callDurationSlider);
  syncSliderCustomProps(listenDurationSlider);
  syncSliderCustomProps(pitchSlider);

  audioEngine.setPitch(state.pitch / 100);
  audioEngine.setGentleMode(state.gentleMode);

  updateTuningLabels();
  renderPresets();
  renderQueueStrip();
  renderSoundPads();
  updateTransportHeader();
}

/**
 * Render Active Sequence Queue Chips
 */
function renderQueueStrip() {
  queueCountText.textContent = String(state.queue.length);
  queueChipList.innerHTML = '';

  state.queue.forEach((soundId, idx) => {
    const meta = getSoundMeta(soundId);
    const chip = document.createElement('div');
    const isCurrent = state.cycleRunning && idx === state.queueIndex;
    chip.className = `queue-chip${isCurrent ? ' is-current' : ''}`;
    chip.setAttribute('role', 'listitem');

    const labelSpan = document.createElement('span');
    labelSpan.textContent = `${idx + 1}. ${meta.title}`;
    chip.appendChild(labelSpan);

    if (state.queue.length > 1) {
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'queue-chip-remove';
      removeBtn.setAttribute('aria-label', `ลบ ${meta.title} ออกจากคิว`);
      removeBtn.textContent = '×';
      removeBtn.addEventListener('click', () => {
        state.queue.splice(idx, 1);
        if (state.queueIndex >= state.queue.length) {
          state.queueIndex = 0;
        }
        renderQueueStrip();
        renderSoundPads();
      });
      chip.appendChild(removeBtn);
    }

    queueChipList.appendChild(chip);
  });
}

/**
 * Render 12 Sound Trigger Pads
 */
function renderSoundPads() {
  workedTabCount.textContent = String(state.workedSounds.length);
  soundPadGrid.innerHTML = '';

  const filtered = SOUND_CATALOG.filter((item) => {
    if (state.activeCategory === 'all') return true;
    if (state.activeCategory === 'worked') return state.workedSounds.includes(item.id);
    return item.category === state.activeCategory;
  });

  if (filtered.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'detection-log-empty';
    empty.textContent = 'ยังไม่มีเสียงที่ทำเครื่องหมายว่า "แมวหัน" ลองกดปุ่ม "แมวหัน" บนเสียงที่เจ้าเหมียวตอบสนอง';
    soundPadGrid.appendChild(empty);
    return;
  }

  filtered.forEach((sound) => {
    const isPlaying = state.currentlyPlayingSoundId === sound.id;
    const inQueue = state.queue.includes(sound.id);
    const isWorked = state.workedSounds.includes(sound.id);

    const card = document.createElement('div');
    card.className = `sound-pad-item${isPlaying ? ' is-playing' : ''}`;
    card.setAttribute('role', 'listitem');

    const mainBtn = document.createElement('button');
    mainBtn.type = 'button';
    mainBtn.className = 'sound-pad-main-btn';
    mainBtn.setAttribute('aria-label', `เล่นเสียง ${sound.title} (${sound.subtitle})`);
    mainBtn.innerHTML = `
      <div class="sound-pad-copy">
        <div class="sound-pad-title-row">
          <span class="sound-pad-title">${sound.title}</span>
          <span class="sound-pad-cat-tag">${sound.categoryLabel}</span>
        </div>
        <span class="sound-pad-sub">${sound.subtitle}</span>
        <span class="sound-pad-purpose">${sound.purpose}</span>
      </div>
      <span class="sound-play-pill" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          ${
            isPlaying
              ? '<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>'
              : '<polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/>'
          }
        </svg>
      </span>
    `;
    mainBtn.addEventListener('click', () => {
      state.selectedSoundId = sound.id;
      triggerSingleSound(sound.id);
    });

    const footer = document.createElement('div');
    footer.className = 'sound-pad-footer';

    const freqSpan = document.createElement('span');
    freqSpan.className = 'sound-freq-label';
    freqSpan.textContent = `ความถี่ ${sound.freqBand}`;

    const actions = document.createElement('div');
    actions.className = 'sound-pad-actions';

    const queueBtn = document.createElement('button');
    queueBtn.type = 'button';
    queueBtn.className = 'mini-action-btn';
    queueBtn.setAttribute('aria-pressed', String(inQueue));
    queueBtn.textContent = inQueue ? 'ในคิวแล้ว' : '+ คิว';
    queueBtn.addEventListener('click', () => toggleSoundInQueue(sound.id));

    const workedBtn = document.createElement('button');
    workedBtn.type = 'button';
    workedBtn.className = 'mini-action-btn worked-btn';
    workedBtn.setAttribute('aria-pressed', String(isWorked));
    workedBtn.textContent = isWorked ? 'แมวหันแล้ว' : 'แมวหัน';
    workedBtn.addEventListener('click', () => toggleWorkedSound(sound.id));

    actions.appendChild(queueBtn);
    actions.appendChild(workedBtn);
    footer.appendChild(freqSpan);
    footer.appendChild(actions);

    card.appendChild(mainBtn);
    card.appendChild(footer);
    soundPadGrid.appendChild(card);
  });
}

function toggleSoundInQueue(soundId) {
  const idx = state.queue.indexOf(soundId);
  if (idx !== -1) {
    if (state.queue.length > 1) {
      state.queue.splice(idx, 1);
    }
  } else {
    if (state.queue.length >= 3) {
      state.queue.shift();
    }
    state.queue.push(soundId);
  }
  if (state.queueIndex >= state.queue.length) {
    state.queueIndex = 0;
  }
  renderQueueStrip();
  renderSoundPads();
}

function toggleWorkedSound(soundId) {
  const idx = state.workedSounds.indexOf(soundId);
  if (idx !== -1) {
    state.workedSounds.splice(idx, 1);
  } else {
    state.workedSounds.push(soundId);
  }
  localStorage.setItem('whererukitty_worked', JSON.stringify(state.workedSounds));
  renderSoundPads();
}

/**
 * Category Filter Tabs
 */
document.querySelectorAll('.cat-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    state.activeCategory = tab.dataset.category;
    document.querySelectorAll('.cat-tab').forEach((t) => {
      const active = t === tab;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', String(active));
    });
    renderSoundPads();
  });
});

/**
 * Play a Single Sound Immediately
 */
function triggerSingleSound(soundId) {
  if (state.cycleRunning) {
    stopCallListenCycle();
  }
  clearTimeout(state.singlePlayTimer);

  const meta = getSoundMeta(soundId);
  state.selectedSoundId = soundId;
  state.currentlyPlayingSoundId = soundId;
  state.cyclePhase = 'calling';
  state.phaseStartedAt = performance.now();

  audioEngine.playSound(soundId);
  updateTransportHeader();
  renderSoundPads();

  state.singlePlayTimer = setTimeout(() => {
    if (!state.cycleRunning) {
      state.currentlyPlayingSoundId = null;
      state.cyclePhase = 'idle';
      callPhaseFill.style.inlineSize = '0%';
      listenPhaseFill.style.inlineSize = '0%';
      updateTransportHeader();
      renderSoundPads();
    }
  }, Math.round(meta.durationSec * 1000));
}

/**
 * Dual-Phase Call & Listen Cycle State Machine
 */
async function startCallListenCycle() {
  clearTimeout(state.singlePlayTimer);
  if (state.autoMic && !state.micActive) {
    const res = await audioEngine.enableMicrophoneRadar();
    state.micActive = res.active;
    updateRadarControls();
  }

  state.cycleRunning = true;
  state.queueIndex = 0;
  enterCallingPhase();
  updateCycleButtons();
}

function stopCallListenCycle() {
  state.cycleRunning = false;
  state.cyclePhase = 'idle';
  state.currentlyPlayingSoundId = null;
  audioEngine.stopAllSounds();
  callPhaseFill.style.inlineSize = '0%';
  listenPhaseFill.style.inlineSize = '0%';
  cycleProgressBar.setAttribute('aria-valuenow', '0');
  updateCycleButtons();
  updateTransportHeader();
  renderQueueStrip();
  renderSoundPads();
}

function enterCallingPhase() {
  if (!state.cycleRunning) return;
  const soundId = state.queue[state.queueIndex % state.queue.length] || 'mother-trill';
  state.selectedSoundId = soundId;
  state.currentlyPlayingSoundId = soundId;
  state.cyclePhase = 'calling';
  state.phaseStartedAt = performance.now();

  audioEngine.playSound(soundId);
  updateTransportHeader();
  renderQueueStrip();
  renderSoundPads();
}

function enterListeningPhase() {
  if (!state.cycleRunning) return;
  audioEngine.stopAllSounds();
  state.currentlyPlayingSoundId = null;
  state.cyclePhase = 'listening';
  state.phaseStartedAt = performance.now();

  updateTransportHeader();
  renderSoundPads();
}

function updateCycleButtons() {
  const running = state.cycleRunning;
  cycleToggleBtn.dataset.running = String(running);
  mobileCycleBtn.dataset.running = String(running);
  cyclePlayIcon.hidden = running;
  cycleStopIcon.hidden = !running;
  cycleBtnLabel.textContent = running ? 'หยุดวนเรียกแมว' : 'เริ่มวนเรียก + เงียบฟัง';
  mobileCycleBtnText.textContent = running ? 'หยุดวนเรียก' : 'เริ่มวนเรียกแมว';
}

function updateTransportHeader() {
  const meta = getSoundMeta(state.selectedSoundId);
  activeSoundTitle.textContent = `${meta.title} (${meta.subtitle})`;
  callSecDisplay.textContent = String(state.callSeconds);
  listenSecDisplay.textContent = String(state.listenSeconds);

  if (state.cyclePhase === 'calling') {
    phaseBadge.dataset.phase = 'calling';
    phaseBadge.textContent = 'กำลังส่งเสียงเรียก';
  } else if (state.cyclePhase === 'listening') {
    phaseBadge.dataset.phase = 'listening';
    phaseBadge.textContent = 'ช่วงเงียบฟังเสียงขานรับ';
  } else {
    phaseBadge.dataset.phase = 'idle';
    phaseBadge.textContent = 'พร้อมเรียกแมว';
    phaseTimerText.textContent = `รอบอัตโนมัติ: ส่งเสียง ${state.callSeconds} วิ · เงียบฟัง ${state.listenSeconds} วิ`;
  }
}

cycleToggleBtn.addEventListener('click', () => {
  if (state.cycleRunning) {
    stopCallListenCycle();
  } else {
    startCallListenCycle();
  }
});

mobileCycleBtn.addEventListener('click', () => {
  if (state.cycleRunning) {
    stopCallListenCycle();
  } else {
    startCallListenCycle();
  }
});

singlePulseBtn.addEventListener('click', () => {
  triggerSingleSound(state.selectedSoundId);
});

mobileMotherCallBtn.addEventListener('click', () => {
  triggerSingleSound('mother-trill');
});

mobileWetCanBtn.addEventListener('click', () => {
  triggerSingleSound('wet-can');
});

/**
 * Tuning Sliders & Switches Event Listeners
 */
function updateTuningLabels() {
  volumeValueText.textContent = `${state.volume}%`;
  volumeSlider.setAttribute('aria-valuetext', `ความดัง ${state.volume} เปอร์เซ็นต์`);

  const pitchRatio = (state.pitch / 100).toFixed(2);
  const pitchDesc =
    state.pitch === 100
      ? `ปกติ (${pitchRatio}x)`
      : state.pitch > 100
      ? `เสียงสูงขึ้น (${pitchRatio}x)`
      : `เสียงทุ้มนุ่ม (${pitchRatio}x)`;
  pitchValueText.textContent = pitchDesc;
  pitchSlider.setAttribute('aria-valuetext', pitchDesc);

  callDurationText.textContent = `${state.callSeconds} วินาที`;
  callDurationSlider.setAttribute('aria-valuetext', `ส่งเสียงนาน ${state.callSeconds} วินาที`);

  listenDurationText.textContent = `${state.listenSeconds} วินาที`;
  listenDurationSlider.setAttribute('aria-valuetext', `เงียบฟังเสียงขานรับนาน ${state.listenSeconds} วินาที`);

  callSecDisplay.textContent = String(state.callSeconds);
  listenSecDisplay.textContent = String(state.listenSeconds);
  if (state.cyclePhase === 'idle') {
    phaseTimerText.textContent = `รอบอัตโนมัติ: ส่งเสียง ${state.callSeconds} วิ · เงียบฟัง ${state.listenSeconds} วิ`;
  }
}

volumeSlider.addEventListener('input', () => {
  state.volume = Number(volumeSlider.value);
  audioEngine.setVolume(state.volume / 100);
  updateTuningLabels();
});

pitchSlider.addEventListener('input', () => {
  state.pitch = Number(pitchSlider.value);
  audioEngine.setPitch(state.pitch / 100);
  updateTuningLabels();
});

callDurationSlider.addEventListener('input', () => {
  state.callSeconds = Number(callDurationSlider.value);
  updateTuningLabels();
});

listenDurationSlider.addEventListener('input', () => {
  state.listenSeconds = Number(listenDurationSlider.value);
  updateTuningLabels();
});

gentleModeSwitch.addEventListener('change', () => {
  state.gentleMode = gentleModeSwitch.checked;
  audioEngine.setGentleMode(state.gentleMode);
});

autoMicSwitch.addEventListener('change', async () => {
  state.autoMic = autoMicSwitch.checked;
  if (state.autoMic && !state.micActive) {
    const res = await audioEngine.enableMicrophoneRadar();
    state.micActive = res.active;
    updateRadarControls(res.reason);
  }
});

/**
 * Live Ear-Perk Radar & Detection Log
 */
function updateRadarControls(customReason = '') {
  enableMicBtn.setAttribute('aria-pressed', String(state.micActive));
  enableMicBtnText.textContent = state.micActive ? 'เปิดไมค์เรดาร์อยู่' : 'เปิดไมค์ช่วยฟังเสียง';
  if (state.micActive) {
    radarStatusTitle.textContent = 'สถานะเรดาร์: เปิดไมโครโฟนพร้อมดักฟังเสียงเหมียว';
    radarStatusSub.textContent = `กำลังเฝ้าฟังย่านเสียงร้องแมวบริเวณ "${state.activeRoom}"`;
  } else if (customReason) {
    radarStatusTitle.textContent = 'สถานะเรดาร์: โหมดจำลองสัญญาณเรดาร์';
    radarStatusSub.textContent = customReason;
  }
}

enableMicBtn.addEventListener('click', async () => {
  if (state.micActive) {
    audioEngine.disableMicrophoneRadar();
    state.micActive = false;
    radarAlertBanner.dataset.detected = 'false';
    radarStatusTitle.textContent = 'สถานะเรดาร์: ปิดไมโครโฟนชั่วคราว';
    radarStatusSub.textContent = 'สามารถกดเปิดไมค์ช่วยฟัง หรือกดปุ่มจำลองเสียงขานรับเพื่อทดสอบ';
    updateRadarControls();
  } else {
    const res = await audioEngine.enableMicrophoneRadar();
    state.micActive = res.active;
    updateRadarControls(res.reason);
  }
});

simulateReplyBtn.addEventListener('click', () => {
  audioEngine.triggerSimulatedCatReply();
  recordSoundDetection('ตรวจพบเสียงเหมียวตอบรับ (จำลองทดสอบ)', 76);
});

function recordSoundDetection(label, levelDb) {
  const now = Date.now();
  if (now - state.lastDetectionLoggedAt < 1300) return;
  state.lastDetectionLoggedAt = now;

  const timeStr = new Intl.DateTimeFormat('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(now));

  const soundMeta = getSoundMeta(state.selectedSoundId);
  const entry = {
    id: `det-${now}`,
    time: timeStr,
    room: state.activeRoom,
    triggerSound: soundMeta.title,
    label,
    level: levelDb
  };

  state.detectionLog.unshift(entry);
  if (state.detectionLog.length > 12) {
    state.detectionLog.pop();
  }
  localStorage.setItem('whererukitty_detections', JSON.stringify(state.detectionLog));

  radarAlertBanner.dataset.detected = 'true';
  phaseBadge.dataset.phase = 'detected';
  phaseBadge.textContent = 'ได้ยินเสียงตอบรับ!';
  radarStatusTitle.textContent = `พบเสียงขานรับบริเวณ "${state.activeRoom}" (${timeStr})`;
  radarStatusSub.textContent = `ตอบสนองต่อเสียง "${soundMeta.title}" · ความเข้มสัญญาณ ${levelDb} dB`;

  renderDetectionLog();
}

function renderDetectionLog() {
  detectionCount.textContent = String(state.detectionLog.length);
  detectionLogList.innerHTML = '';

  if (state.detectionLog.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'detection-log-empty';
    empty.textContent = 'ยังไม่มีประวัติเสียงขานรับ · เริ่มวนเรียกแมวเพื่อให้ระบบช่วยฟังช่วงเงียบ';
    detectionLogList.appendChild(empty);
    return;
  }

  state.detectionLog.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'detection-log-item';
    li.innerHTML = `
      <div>
        <strong>${item.room}</strong> · <span>หลังเปิด "${item.triggerSound}"</span>
      </div>
      <span>${item.time} (${item.level} dB)</span>
    `;
    detectionLogList.appendChild(li);
  });
}

clearLogBtn.addEventListener('click', () => {
  state.detectionLog = [];
  localStorage.setItem('whererukitty_detections', '[]');
  radarAlertBanner.dataset.detected = 'false';
  radarStatusTitle.textContent = 'สถานะเรดาร์: รอฟังเสียงในจังหวะเงียบ';
  radarStatusSub.textContent = 'ล้างประวัติเรียบร้อยแล้ว พร้อมเริ่มรอบฟังเสียงใหม่';
  renderDetectionLog();
});

/**
 * Custom Owner Voice Recorder (3-second sampler)
 */
function updateCustomVoiceUI() {
  const hasSaved = Boolean(audioEngine.customAudioDataUrl);
  customVoiceBadge.dataset.recorded = String(hasSaved);
  customVoiceBadge.textContent = hasSaved
    ? 'บันทึกเสียงเรียกของคุณไว้แล้ว'
    : 'ใช้เสียงเรียกจำลองมาตรฐาน';
}

recordVoiceBtn.addEventListener('click', async () => {
  if (state.isRecordingVoice) return;

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof MediaRecorder === 'undefined') {
    recordTimerText.textContent = 'ใช้เสียงจำลองแทน';
    audioEngine.playSound('custom-voice');
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const chunks = [];
    const recorder = new MediaRecorder(stream);
    state.isRecordingVoice = true;
    recordVoiceBtn.dataset.recording = 'true';
    recordVoiceBtnText.textContent = 'กำลังอัดเสียงเรียกชื่อแมว...';

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      state.isRecordingVoice = false;
      recordVoiceBtn.dataset.recording = 'false';
      recordVoiceBtnText.textContent = 'อัดเสียงใหม่ (3 วิ)';
      recordTimerText.textContent = 'บันทึกสำเร็จ (3.0 วิ)';

      const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          audioEngine.saveCustomVoiceDataUrl(reader.result);
          updateCustomVoiceUI();
        }
      };
      reader.readAsDataURL(blob);
    };

    recorder.start();
    let remaining = 3.0;
    const interval = setInterval(() => {
      remaining = Math.max(0, remaining - 0.2);
      recordTimerText.textContent = `${remaining.toFixed(1)} วินาที`;
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      if (recorder.state !== 'inactive') {
        recorder.stop();
      }
    }, 3000);
  } catch (_) {
    state.isRecordingVoice = false;
    recordVoiceBtn.dataset.recording = 'false';
    recordTimerText.textContent = 'โหมดเสียงจำลองพร้อมใช้';
    triggerSingleSound('custom-voice');
  }
});

playCustomVoiceBtn.addEventListener('click', () => {
  triggerSingleSound('custom-voice');
});

queueCustomVoiceBtn.addEventListener('click', () => {
  toggleSoundInQueue('custom-voice');
});

/**
 * Hiding Spot Checklist
 */
activeRoomSelect.addEventListener('change', () => {
  state.activeRoom = activeRoomSelect.value;
});

function renderHidingSpots() {
  const checkedCount = state.hidingSpots.filter((s) => s.checked).length;
  checklistProgressText.textContent = `ตรวจแล้ว ${checkedCount}/${state.hidingSpots.length} จุด`;
  hidingSpotList.innerHTML = '';

  state.hidingSpots.forEach((spot) => {
    const li = document.createElement('li');
    li.className = 'hiding-spot-item';

    const label = document.createElement('label');
    label.className = 'hiding-spot-label';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = spot.checked;
    checkbox.addEventListener('change', () => {
      spot.checked = checkbox.checked;
      if (spot.checked) {
        state.activeRoom = spot.room;
        activeRoomSelect.value = spot.room;
      }
      localStorage.setItem('whererukitty_spots', JSON.stringify(state.hidingSpots));
      renderHidingSpots();
    });

    const nameSpan = document.createElement('span');
    nameSpan.className = 'spot-name-text';
    nameSpan.textContent = spot.name;

    const roomBadge = document.createElement('span');
    roomBadge.className = 'spot-room-badge';
    roomBadge.textContent = spot.room;

    label.appendChild(checkbox);
    label.appendChild(nameSpan);
    li.appendChild(label);
    li.appendChild(roomBadge);
    hidingSpotList.appendChild(li);
  });
}

addSpotForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const val = newSpotInput.value.trim();
  if (val.length < 2) return;
  state.hidingSpots.push({
    id: `spot-${Date.now()}`,
    name: val,
    room: state.activeRoom,
    checked: false
  });
  newSpotInput.value = '';
  localStorage.setItem('whererukitty_spots', JSON.stringify(state.hidingSpots));
  renderHidingSpots();
});

foundCatBtn.addEventListener('click', () => {
  stopCallListenCycle();
  recordSoundDetection(`เจอตัวแมวที่ "${state.activeRoom}" แล้ว!`, 82);
  if (!state.workedSounds.includes(state.selectedSoundId) && state.selectedSoundId !== 'custom-voice') {
    state.workedSounds.push(state.selectedSoundId);
    localStorage.setItem('whererukitty_worked', JSON.stringify(state.workedSounds));
    renderSoundPads();
  }
});

resetChecklistBtn.addEventListener('click', () => {
  state.hidingSpots = DEFAULT_HIDING_SPOTS.map((s) => ({ ...s, checked: false }));
  localStorage.setItem('whererukitty_spots', JSON.stringify(state.hidingSpots));
  renderHidingSpots();
});

/**
 * Real-time Animation Loop: Dual-Phase Progress + 24-Band Spectrum Strip
 */
function renderLoopFrame(nowMs) {
  if (state.cycleRunning) {
    const elapsedSec = (nowMs - state.phaseStartedAt) / 1000;
    const totalCycleSec = state.callSeconds + state.listenSeconds;

    if (state.cyclePhase === 'calling') {
      const pct = Math.min(100, (elapsedSec / state.callSeconds) * 100);
      callPhaseFill.style.inlineSize = `${pct.toFixed(1)}%`;
      listenPhaseFill.style.inlineSize = '0%';
      const overallPct = Math.round((elapsedSec / totalCycleSec) * 100);
      cycleProgressBar.setAttribute('aria-valuenow', String(overallPct));

      const remain = Math.max(0, state.callSeconds - elapsedSec).toFixed(1);
      phaseTimerText.textContent = `กำลังส่งเสียงเรียก... เหลือ ${remain} วิ ก่อนเงียบฟัง`;

      if (elapsedSec >= state.callSeconds) {
        enterListeningPhase();
      }
    } else if (state.cyclePhase === 'listening') {
      callPhaseFill.style.inlineSize = '100%';
      const pct = Math.min(100, (elapsedSec / state.listenSeconds) * 100);
      listenPhaseFill.style.inlineSize = `${pct.toFixed(1)}%`;
      const overallPct = Math.round(((state.callSeconds + elapsedSec) / totalCycleSec) * 100);
      cycleProgressBar.setAttribute('aria-valuenow', String(overallPct));

      const remain = Math.max(0, state.listenSeconds - elapsedSec).toFixed(1);
      phaseTimerText.textContent = `กำลังเงียบฟังเสียงแมวขานรับ... เหลือ ${remain} วิ`;

      if (elapsedSec >= state.listenSeconds) {
        state.queueIndex = (state.queueIndex + 1) % state.queue.length;
        enterCallingPhase();
      }
    }
  } else if (state.cyclePhase === 'calling') {
    const meta = getSoundMeta(state.selectedSoundId);
    const elapsedSec = (nowMs - state.phaseStartedAt) / 1000;
    const pct = Math.min(100, (elapsedSec / meta.durationSec) * 100);
    callPhaseFill.style.inlineSize = `${pct.toFixed(1)}%`;
  }

  // Draw 24-bar Feline Ear-Perk Spectrum Canvas
  const frame = audioEngine.sampleSpectrumFrame(state.cyclePhase);
  if (frame.detectedMeow) {
    recordSoundDetection('ตรวจพบคลื่นความถี่เสียงร้องช่วงเงียบ', Math.max(58, frame.level));
  }

  if (state.cyclePhase === 'calling') {
    liveDbReadout.textContent = `กำลังปล่อยคลื่นเสียง: ${Math.max(42, frame.level)} dB`;
  } else if (state.cyclePhase === 'listening') {
    liveDbReadout.textContent = frame.detectedMeow
      ? `พบเสียงขานรับ! (${frame.level} dB)`
      : `กำลังเงียบฟังเสียงเหมียว (${frame.level} dB)`;
  } else {
    liveDbReadout.textContent = frame.detectedMeow
      ? `พบเสียงขานรับ! (${frame.level} dB)`
      : 'ระดับสัญญาณ: รอส่งเสียง';
  }

  drawSpectrumCanvas(frame.bars, state.cyclePhase, frame.detectedMeow);
  requestAnimationFrame(renderLoopFrame);
}

function drawSpectrumCanvas(bars, phase, detected) {
  const w = spectrumCanvas.width;
  const h = spectrumCanvas.height;
  spectrumCtx.clearRect(0, 0, w, h);

  const count = bars.length;
  const gap = 5;
  const barWidth = (w - gap * (count - 1)) / count;

  for (let i = 0; i < count; i++) {
    const val = bars[i];
    const barH = Math.max(4, (val / 100) * (h - 6));
    const x = i * (barWidth + gap);
    const y = h - barH;

    if (detected) {
      spectrumCtx.fillStyle = '#2CC990';
    } else if (phase === 'calling') {
      spectrumCtx.fillStyle = i % 3 === 0 ? '#F48F86' : '#E05245';
    } else if (phase === 'listening') {
      spectrumCtx.fillStyle = '#F5B156';
    } else {
      spectrumCtx.fillStyle = '#4B6794';
    }

    spectrumCtx.beginPath();
    spectrumCtx.roundRect(x, y, barWidth, barH, 3);
    spectrumCtx.fill();
  }
}

/**
 * Initialize Application
 */
function init() {
  applyTheme(state.theme);
  initAllSliders();
  initSwitches();
  initTorchDialog();
  updateTuningLabels();
  updateCustomVoiceUI();
  renderPresets();
  renderQueueStrip();
  renderSoundPads();
  renderDetectionLog();
  renderHidingSpots();
  updateTransportHeader();
  requestAnimationFrame(renderLoopFrame);
}

init();
