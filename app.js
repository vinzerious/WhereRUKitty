import {
  SOUND_CATALOG,
  SCENARIO_PRESETS,
  DOG_SOUND_CATALOG,
  DOG_SCENARIO_PRESETS,
  FelineAudioEngine
} from './audio-engine.js';
import {
  acquireHardwareTorch,
  releaseHardwareTorch
} from './torch-controller.js';
import {
  loadTuning,
  saveTuning,
  getPresetById,
  setSpeciesPreset,
  setSpeciesValue,
  setGlobalValue
} from './tuning-store.js';
import { createWakeLockController } from './wake-lock-controller.js';
import { buildFoundRecap } from './found-recap.js';

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

const DOG_DEFAULT_HIDING_SPOTS = [
  { id: 'dog-spot-1', name: 'ใต้โต๊ะทำงาน / ใต้โต๊ะกินข้าว', room: 'ห้องนั่งเล่น / ใต้โซฟา', checked: false },
  { id: 'dog-spot-2', name: 'ในห้องน้ำ / ข้างโถสุขภัณฑ์ (พื้นกระเบื้องเย็น)', room: 'หลังเครื่องซักผ้า / ห้องน้ำ', checked: false },
  { id: 'dog-spot-3', name: 'ใต้เตียงนอน หรือซอกข้างฟูก', room: 'ห้องนอน / ใต้เตียง', checked: false },
  { id: 'dog-spot-4', name: 'หลังโซฟา หรือมุมอับห้องนั่งเล่น', room: 'ห้องนั่งเล่น / ใต้โซฟา', checked: false },
  { id: 'dog-spot-5', name: 'ใต้บันได หรือในตู้เสื้อผ้าที่เปิดแง้มไว้', room: 'ในตู้เสื้อผ้า / ลิ้นชัก', checked: false },
  { id: 'dog-spot-6', name: 'ข้างตู้เย็น หรือใต้เคาน์เตอร์ครัว', room: 'ห้องครัว / หลังตู้เย็น', checked: false },
  { id: 'dog-spot-7', name: 'ซอกกระถางต้นไม้ / พุ่มไม้ริมระเบียง / โรงรถ', room: 'ระเบียง / หลังมุ้งลวด', checked: false },
  { id: 'dog-spot-8', name: 'ในกรง/เบาะนอนประจำ หรือกองผ้าห่ม', room: 'ห้องนอน / ใต้เตียง', checked: false }
];

const safeStorage = {
  getItem(key, fallback = null) {
    try {
      const val = localStorage.getItem(key);
      if (val !== null) return val;
      const legacyKey = key.replace(/^meowmeow_bokbok_/, 'whererukitty_');
      if (legacyKey !== key) {
        const legacyVal = localStorage.getItem(legacyKey);
        if (legacyVal !== null) {
          try {
            localStorage.setItem(key, legacyVal);
          } catch (_) {}
          return legacyVal;
        }
      }
      return fallback;
    } catch (_) {
      return fallback;
    }
  },
  setItem(key, val) {
    try {
      localStorage.setItem(key, String(val));
    } catch (_) {}
  },
  removeItem(key) {
    try {
      localStorage.removeItem(key);
      const legacyKey = key.replace(/^meowmeow_bokbok_/, 'whererukitty_');
      if (legacyKey !== key) {
        localStorage.removeItem(legacyKey);
      }
    } catch (_) {}
  }
};

// Tuning may not inherit the generic pre-rebrand alias: no
// `whererukitty_tuning` key existed before this feature, so read and write
// only the exact key.
const tuningStorage = {
  getItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (_) {
      return null;
    }
  },
  setItem(key, value) {
    try {
      localStorage.setItem(key, String(value));
    } catch (_) {}
  }
};

const audioEngine = new FelineAudioEngine();

let wakeLockController = null;

const initialTuning = loadTuning(tuningStorage, {
  cat: SCENARIO_PRESETS,
  dog: DOG_SCENARIO_PRESETS
});
const storedSpecies = safeStorage.getItem('meowmeow_bokbok_species', 'cat');
const initialSpecies = storedSpecies === 'dog' ? 'dog' : 'cat';
const initialPresets = initialSpecies === 'dog' ? DOG_SCENARIO_PRESETS : SCENARIO_PRESETS;
const initialRecord = initialTuning[initialSpecies];
const initialPreset = getPresetById(initialPresets, initialRecord.presetId);

const state = {
  species: initialSpecies,
  tuning: initialTuning,
  theme: safeStorage.getItem('meowmeow_bokbok_theme', 'day'),
  activePresetId: initialPreset.id,
  activeCategory: 'all',
  selectedSoundId: initialPreset.sequence[0],
  currentlyPlayingSoundId: null,
  queue: [...initialPreset.sequence],
  queueIndex: 0,
  workedSounds: (() => {
    try {
      return JSON.parse(safeStorage.getItem('meowmeow_bokbok_worked', '["mother-trill", "wet-can"]'));
    } catch (_) {
      return ['mother-trill', 'wet-can'];
    }
  })(),
  callSeconds: initialRecord.callSeconds,
  listenSeconds: initialRecord.listenSeconds,
  volume: initialTuning.volume,
  pitch: initialRecord.pitch,
  gentleMode: initialRecord.gentleMode,
  autoMic: initialTuning.autoMic,
  micActive: false,

  // Cycle State Machine: 'idle' | 'calling' | 'listening'
  cycleRunning: false,
  cyclePhase: 'idle',
  phaseStartedAt: 0,
  singlePlayTimer: null,
  lastDetectionLoggedAt: 0,

  activeRoom: 'ห้องนอน / ใต้เตียง',
  detectionLog: (() => {
    try {
      return JSON.parse(safeStorage.getItem('meowmeow_bokbok_detections', '[]'));
    } catch (_) {
      return [];
    }
  })(),
  hidingSpots: (() => {
    try {
      return JSON.parse(safeStorage.getItem('meowmeow_bokbok_spots', JSON.stringify(DEFAULT_HIDING_SPOTS)));
    } catch (_) {
      return DEFAULT_HIDING_SPOTS;
    }
  })(),

  isRecordingVoice: false,
  mediaRecorder: null,
  hardwareTorchSession: null,
  preferredTorchDeviceId: safeStorage.getItem('meowmeow_bokbok_torch_device', null),
  rearCameraList: []
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
const torchLensRow = document.getElementById('torchLensRow');
const torchLensSelect = document.getElementById('torchLensSelect');
const torchStatusHint = document.getElementById('torchStatusHint');

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
const foundDialog = document.getElementById('foundDialog');
const foundDialogTitle = document.getElementById('foundDialogTitle');
const foundDialogMessage = document.getElementById('foundDialogMessage');
const foundDialogRoom = document.getElementById('foundDialogRoom');
const foundDialogTime = document.getElementById('foundDialogTime');
const foundDialogSound = document.getElementById('foundDialogSound');
const foundDialogProgress = document.getElementById('foundDialogProgress');
const foundDialogDetection = document.getElementById('foundDialogDetection');
const foundSearchAgainBtn = document.getElementById('foundSearchAgainBtn');
const closeFoundDialogBtn = document.getElementById('closeFoundDialogBtn');
const closeFoundDialogSecondaryBtn = document.getElementById('closeFoundDialogSecondaryBtn');

const mobileCycleBtn = document.getElementById('mobileCycleBtn');
const mobileCycleBtnText = document.getElementById('mobileCycleBtnText');
const mobileMotherCallBtn = document.getElementById('mobileMotherCallBtn');
const mobileWetCanBtn = document.getElementById('mobileWetCanBtn');
const mobileTorchBtn = document.getElementById('mobileTorchBtn');
const mobilePrimaryCallBtnText = document.getElementById('mobilePrimaryCallBtnText');
const mobileSecondaryCallBtnText = document.getElementById('mobileSecondaryCallBtnText');

const speciesCatBtn = document.getElementById('speciesCatBtn');
const speciesDogBtn = document.getElementById('speciesDogBtn');
const brandIconCat = document.getElementById('brandIconCat');
const brandIconDog = document.getElementById('brandIconDog');
const appTitleText = document.getElementById('appTitleText');
const appTitleEn = document.getElementById('appTitleEn');
const appSubtitleText = document.getElementById('appSubtitleText');
const openTorchBtnLabel = document.getElementById('openTorchBtnLabel');
const listenPhaseText = document.getElementById('listenPhaseText');
const spectrumRangeLabel = document.getElementById('spectrumRangeLabel');
const presetHeading = document.getElementById('presetHeading');
const soundDeckHeading = document.getElementById('soundDeckHeading');
const soundDeckDesc = document.getElementById('soundDeckDesc');
const tabVocalBtn = document.getElementById('tabVocalBtn');
const tabPreyBtn = document.getElementById('tabPreyBtn');
const gentleModeTitle = document.getElementById('gentleModeTitle');
const gentleModeDesc = document.getElementById('gentleModeDesc');
const autoMicDesc = document.getElementById('autoMicDesc');
const radarHeading = document.getElementById('radarHeading');
const radarDesc = document.getElementById('radarDesc');
const simulateReplyBtnText = document.getElementById('simulateReplyBtnText');
const voiceRecorderHeading = document.getElementById('voiceRecorderHeading');
const voiceRecorderDesc = document.getElementById('voiceRecorderDesc');
const foundPetBtnText = document.getElementById('foundPetBtnText');
const torchDialogTitle = document.getElementById('torchDialogTitle');
const torchInstructionsText = document.getElementById('torchInstructionsText');
const torchCallBtnText = document.getElementById('torchCallBtnText');

function getActiveCatalog() {
  return state.species === 'dog' ? DOG_SOUND_CATALOG : SOUND_CATALOG;
}

function getActivePresets() {
  return state.species === 'dog' ? DOG_SCENARIO_PRESETS : SCENARIO_PRESETS;
}

function persistTuning() {
  saveTuning(tuningStorage, state.tuning);
}

function getDefaultSpots() {
  return state.species === 'dog' ? DOG_DEFAULT_HIDING_SPOTS : DEFAULT_HIDING_SPOTS;
}

function getSpotsStorageKey() {
  return state.species === 'dog' ? 'meowmeow_bokbok_spots_dog' : 'meowmeow_bokbok_spots';
}

function getWorkedStorageKey() {
  return state.species === 'dog' ? 'meowmeow_bokbok_worked_dog' : 'meowmeow_bokbok_worked';
}

/**
 * Helper: Lookup sound metadata by ID
 */
function getSoundMeta(soundId) {
  const isDog = state.species === 'dog';
  if (soundId === 'custom-voice') {
    return {
      id: 'custom-voice',
      category: 'sonic',
      categoryLabel: 'เสียงเจ้าของ',
      title: isDog ? 'เสียงคุณเรียกชื่อสุนัข' : 'เสียงคุณเรียกชื่อแมว',
      subtitle: 'Custom Owner Call',
      freqBand: '300 – 3,400 Hz',
      durationSec: 2.8,
      purpose: isDog
        ? 'เสียงคุณเรียกชื่อสุนัขหรือชวนไปเดินเล่นที่อัดไว้เอง'
        : 'เสียงคุณเรียกชื่อแมวหรือเขย่าขนมที่อัดไว้เอง'
    };
  }
  const catalog = getActiveCatalog();
  return catalog.find((s) => s.id === soundId) || SOUND_CATALOG.find((s) => s.id === soundId) || catalog[0];
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
    try {
      if (!torchDialog.open) {
        torchDialog.showModal();
      }
    } catch (err) {
      console.warn('Could not open torch dialog:', err);
      return;
    }
    wakeLockController?.acquire('torch');
  };

  openTorchBtn.addEventListener('click', openModal);
  mobileTorchBtn.addEventListener('click', openModal);
  closeTorchBtn.addEventListener('click', () => torchDialog.close());
  torchDialog.addEventListener('close', async () => {
    wakeLockController?.release('torch');
    if (state.hardwareTorchSession) {
      await releaseHardwareTorch(state.hardwareTorchSession);
      state.hardwareTorchSession = null;
      hardwareFlashBtn.setAttribute('aria-pressed', 'false');
      hardwareFlashText.textContent = 'เปิดไฟแฟลชกล้องหลัง (ถ้าอุปกรณ์รองรับ)';
      setTorchStatusHint('');
    }
  });

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
    triggerSingleSound(state.species === 'dog' ? 'dog-squeaky-toy' : 'mother-trill');
  });

  hardwareFlashBtn.addEventListener('click', () => {
    toggleHardwareFlash();
  });

  if (torchLensSelect) {
    torchLensSelect.addEventListener('change', async () => {
      const chosenId = torchLensSelect.value || null;
      state.preferredTorchDeviceId = chosenId;
      if (chosenId) {
        safeStorage.setItem('meowmeow_bokbok_torch_device', chosenId);
      } else {
        safeStorage.removeItem('meowmeow_bokbok_torch_device');
      }
      // Re-acquire hardware torch on the newly selected lens immediately
      if (state.hardwareTorchSession) {
        await releaseHardwareTorch(state.hardwareTorchSession);
        state.hardwareTorchSession = null;
      }
      await toggleHardwareFlash(chosenId);
    });
  }
}

function renderTorchLensSelector(rearCameras = [], activeDeviceId = null) {
  if (!torchLensRow || !torchLensSelect) return;
  state.rearCameraList = rearCameras;

  if (!Array.isArray(rearCameras) || rearCameras.length <= 1) {
    torchLensRow.hidden = true;
    return;
  }

  torchLensSelect.innerHTML = '';
  rearCameras.forEach((cam, idx) => {
    const opt = document.createElement('option');
    opt.value = cam.deviceId;
    const rawLabel = (cam.label || '').trim();
    opt.textContent = rawLabel ? `${idx + 1}. ${rawLabel}` : `เลนส์กล้องหลัง #${idx + 1}`;
    if (activeDeviceId && cam.deviceId === activeDeviceId) {
      opt.selected = true;
    }
    torchLensSelect.appendChild(opt);
  });
  torchLensRow.hidden = false;
}

function setTorchStatusHint(text) {
  if (!torchStatusHint) return;
  if (!text) {
    torchStatusHint.hidden = true;
    torchStatusHint.textContent = '';
  } else {
    torchStatusHint.textContent = text;
    torchStatusHint.hidden = false;
  }
}

async function toggleHardwareFlash(explicitDeviceId = undefined) {
  if (state.hardwareTorchSession && explicitDeviceId === undefined) {
    await releaseHardwareTorch(state.hardwareTorchSession);
    state.hardwareTorchSession = null;
    hardwareFlashBtn.setAttribute('aria-pressed', 'false');
    hardwareFlashText.textContent = 'เปิดไฟแฟลชกล้องหลัง (ถ้าอุปกรณ์รองรับ)';
    setTorchStatusHint('');
    return;
  }

  hardwareFlashBtn.disabled = true;
  hardwareFlashText.textContent = 'กำลังค้นหาเลนส์กล้องที่มีไฟแฟลช...';
  setTorchStatusHint('กำลังตรวจสอบเลนส์กล้องหลังหลักและเปิดวงจรไฟฉาย LED...');

  const preferredDeviceId =
    explicitDeviceId !== undefined ? explicitDeviceId : state.preferredTorchDeviceId;

  const res = await acquireHardwareTorch({ preferredDeviceId });
  hardwareFlashBtn.disabled = false;

  if (Array.isArray(res.rearCameras) && res.rearCameras.length > 0) {
    renderTorchLensSelector(res.rearCameras, res.deviceId || preferredDeviceId);
  }

  if (res.ok) {
    state.hardwareTorchSession = res;
    if (res.deviceId) {
      state.preferredTorchDeviceId = res.deviceId;
      safeStorage.setItem('meowmeow_bokbok_torch_device', res.deviceId);
    }
    hardwareFlashBtn.setAttribute('aria-pressed', 'true');
    const lensSuffix = res.label ? ` (${res.label})` : '';
    hardwareFlashText.textContent = 'ปิดไฟแฟลชกล้องหลัง';
    setTorchStatusHint(
      res.rearCameras && res.rearCameras.length > 1
        ? `เปิดไฟแฟลชสำเร็จ${lensSuffix} · หากไฟยังไม่ติดสามารถสลับเลนส์กล้องด้านบนได้`
        : `เปิดไฟแฟลชกล้องหลังสำเร็จ${lensSuffix}`
    );
  } else {
    state.hardwareTorchSession = null;
    hardwareFlashBtn.setAttribute('aria-pressed', 'false');
    hardwareFlashText.textContent = 'ลองเปิดไฟแฟลชกล้องหลังอีกครั้ง';
    setTorchStatusHint(res.message || 'ใช้โหมดแสงหน้าจอแทน (อุปกรณ์หรือเบราว์เซอร์ไม่เปิดสิทธิ์แฟลชหลัง)');
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
  safeStorage.setItem('meowmeow_bokbok_theme', theme);
}

themeToggleBtn.addEventListener('click', () => {
  applyTheme(state.theme === 'day' ? 'dim' : 'day');
});

/**
 * Species Mode Toggle (Cat Mode ↔ Dog Mode)
 */
function applySpeciesMode(species, { persist = false } = {}) {
  try {
    if (state.cycleRunning) {
      stopCallListenCycle();
    }
  } catch (_) {}

  state.species = species === 'dog' ? 'dog' : 'cat';
  const isDog = state.species === 'dog';

  try {
    docHtml.setAttribute('data-species', state.species);
  } catch (_) {}

  safeStorage.setItem('meowmeow_bokbok_species', state.species);

  if (speciesCatBtn) speciesCatBtn.setAttribute('aria-pressed', String(!isDog));
  if (speciesDogBtn) speciesDogBtn.setAttribute('aria-pressed', String(isDog));
  if (brandIconCat) brandIconCat.hidden = isDog;
  if (brandIconDog) brandIconDog.hidden = !isDog;

  // Update Header & Brand Copy
  if (appTitleText) appTitleText.textContent = 'MeowMeow-BokBok';
  if (appTitleEn) appTitleEn.textContent = isDog ? '· บ็อกบ็อก (โหมดสุนัข)' : '· เหมียวเหมียว (โหมดแมว)';
  if (appSubtitleText) {
    appSubtitleText.textContent = isDog
      ? 'เครื่องส่งเสียงเรียกสุนัข นกหวีดความถี่สูง และเรดาร์ฟังเสียงเห่า/ขานรับ'
      : 'เครื่องส่งเสียงเรียกแมวและเรดาร์ฟังเสียงขานรับสำหรับมือถือ/แท็บเล็ต';
  }
  document.title = isDog
    ? 'MeowMeow-BokBok — บ็อกบ็อก เรียกสุนัขออกจากที่ซ่อน'
    : 'MeowMeow-BokBok — เหมียวเหมียว เรียกแมวออกจากที่ซ่อน';
  if (openTorchBtnLabel) {
    openTorchBtnLabel.textContent = isDog ? 'ไฟฉายส่องหาใต้โต๊ะ' : 'ไฟฉายส่องใต้เตียง';
  }

  // Update Transport & Spectrum Copy
  if (listenPhaseText) {
    listenPhaseText.textContent = isDog ? '2. เงียบฟังเสียงเห่า/ขานรับ' : '2. เงียบฟังเสียงเหมียวตอบ';
  }
  if (spectrumRangeLabel) {
    spectrumRangeLabel.textContent = isDog
      ? 'ย่านความถี่หูสุนัข & นกหวีด 180 Hz – 14.0 kHz'
      : 'ย่านความถี่หูแมว 400 Hz – 6.0 kHz';
  }

  // Update Section Headings & Tabs
  if (presetHeading) {
    presetHeading.textContent = isDog
      ? 'เลือกโหมดตามนิสัยและอาการของสุนัข'
      : 'เลือกโหมดตามนิสัยและอาการของแมว';
  }
  if (soundDeckHeading) {
    soundDeckHeading.textContent = isDog
      ? 'คลังเสียงเรียกสุนัข นกหวีด และเสียงล่อ 12 ความถี่'
      : 'คลังเสียงเรียกแมวชีวภาพและเสียงล่อ 12 ความถี่';
  }
  if (soundDeckDesc) {
    soundDeckDesc.innerHTML = isDog
      ? 'แตะที่แถวเพื่อเล่นเสียงทันที · กดปุ่ม <strong>+ คิว</strong> เพื่อใส่ในรอบวนเรียก · กด <strong>หมาหัน</strong> เพื่อจำเสียงที่ได้ผล'
      : 'แตะที่แถวเพื่อเล่นเสียงทันที · กดปุ่ม <strong>+ คิว</strong> เพื่อใส่ในรอบวนเรียก · กด <strong>แมวหัน</strong> เพื่อจำเสียงที่ได้ผล';
  }
  if (tabVocalBtn) tabVocalBtn.textContent = isDog ? 'เรียกให้เห่าตอบ (4)' : 'เรียกให้ร้องตอบ (4)';
  if (tabPreyBtn) tabPreyBtn.textContent = isDog ? 'ของเล่น & กริ่งบ้าน (2)' : 'กระตุ้นนักล่า (2)';

  // Update Switches, Radar, Voice Recorder, Checklist & Torch Copy
  if (gentleModeTitle) {
    gentleModeTitle.textContent = isDog
      ? 'โหมดสุนัขกลัวฟ้าร้อง/ประทัด (Gentle Soft-Filter)'
      : 'โหมดแมวขี้กลัว (Gentle Soft-Filter)';
  }
  if (gentleModeDesc) {
    gentleModeDesc.textContent = isDog
      ? 'กรองความถี่แหลมออกและลดความตกใจ เหมาะกับสุนัขที่กำลังตื่นกลัวเสียงดังหรือหลบใต้โต๊ะ'
      : 'กรองความถี่แหลมเกิน 3.8 kHz ออกและลดความตกใจ เหมาะกับแมวตื่นกลัวหรือเพิ่งย้ายบ้าน';
  }
  if (autoMicDesc) {
    autoMicDesc.textContent = isDog
      ? 'วิเคราะห์เสียงเห่า เสียงครางหงิงๆ หรือเสียงขยับตัวเฉพาะตอนที่แอปหยุดส่งเสียง'
      : 'วิเคราะห์เสียงเหมียวหรือเสียงกุกกักเฉพาะตอนที่แอปหยุดส่งเสียง เพื่อไม่ให้เสียงลำโพงกวนกัน';
  }
  if (radarHeading) {
    radarHeading.textContent = isDog
      ? 'เรดาร์จับเสียงสุนัขเห่า/ขานรับช่วงเงียบ'
      : 'เรดาร์จับเสียงแมวขานรับช่วงเงียบ';
  }
  if (radarDesc) {
    radarDesc.textContent = isDog
      ? 'เมื่ออยู่ในช่วงเงียบฟังเสียง หากมีเสียงเห่า เสียงคราง หรือเสียงขยับตัว ระบบจะบันทึกเวลาและจุดที่ค้นหาทันที'
      : 'เมื่ออยู่ในช่วงเงียบฟังเสียง หากมีเสียงร้องเหมียวหรือเสียงขยับตัว ระบบจะบันทึกเวลาและห้องไว้ให้ทันที';
  }
  if (simulateReplyBtnText) {
    simulateReplyBtnText.textContent = isDog ? 'จำลองเสียงสุนัขเห่าตอบ' : 'จำลองเสียงแมวขานรับ';
  }
  if (voiceRecorderHeading) {
    voiceRecorderHeading.textContent = isDog
      ? 'เสียงคุณเรียกชื่อสุนัขตัวเอง'
      : 'เสียงคุณเรียกชื่อแมวตัวเอง';
  }
  if (voiceRecorderDesc) {
    voiceRecorderDesc.textContent = isDog
      ? 'สุนัขจำเสียงเจ้าของเรียกชื่อหรือคำว่า "กินหนม / ไปเที่ยว" ได้แม่นยำที่สุด อัดไว้เปิดวนในคิวได้ทันที'
      : 'แมวมักจำเสียงเจ้าของเรียกชื่อหรือเสียงเคาะกระปุกขนมประจำบ้านได้ดีที่สุด อัดไว้เปิดวนในคิวได้ทันที';
  }
  if (!state.isRecordingVoice && recordVoiceBtnText) {
    recordVoiceBtnText.textContent = isDog ? 'อัดเสียงเรียกชื่อสุนัข (3 วิ)' : 'อัดเสียงเรียกชื่อแมว (3 วิ)';
  }
  if (foundPetBtnText) {
    foundPetBtnText.textContent = isDog
      ? 'เจอตัวเจ้าตูบแล้ว! (หยุดเสียงและบันทึกจุดที่เจอ)'
      : 'เจอตัวเจ้าเหมียวแล้ว! (หยุดเสียงและบันทึกจุดที่เจอ)';
  }
  if (mobilePrimaryCallBtnText) {
    mobilePrimaryCallBtnText.textContent = isDog ? 'ตุ๊กตาบีบ' : 'เสียงแม่แมว';
  }
  if (mobileSecondaryCallBtnText) {
    mobileSecondaryCallBtnText.textContent = isDog ? 'เขย่าขนม' : 'เปิดกระป๋อง';
  }
  if (torchDialogTitle) {
    torchDialogTitle.textContent = isDog
      ? 'ไฟฉายส่องหาสุนัขใต้โต๊ะและมุมมืด'
      : 'ไฟฉายส่องหาแมวใต้เตียงและในตู้มืด';
  }
  if (torchInstructionsText) {
    torchInstructionsText.innerHTML = isDog
      ? 'ดันความสว่างหน้าจอขึ้นแล้วส่องเข้าไปใต้โต๊ะหรือมุมอับ สังเกต <strong>ประกายสะท้อนจากดวงตาสุนัข (Tapetum Lucidum)</strong> พร้อมกดปุ่มบีบตุ๊กตายางด้านล่างเพื่อเรียกให้หันมอง'
      : 'ดันความสว่างหน้าจอขึ้นแล้วส่องเข้าไปใต้เตียงหรือซอกตู้ สังเกต <strong>ประกายสะท้อนจากดวงตาแมว (Tapetum Lucidum)</strong> พร้อมกดปุ่มส่งเสียงเรียกด้านล่างเพื่อดูว่าแมวหันมามองหรือไม่';
  }
  if (torchCallBtnText) {
    torchCallBtnText.textContent = isDog
      ? 'บีบตุ๊กตายางเรียกขณะส่องไฟ'
      : 'ส่งเสียงเรียกแม่แมวขณะส่องไฟ';
  }

  // Load species-specific worked sounds & hiding spots safely
  const defaultWorked = isDog ? '["dog-squeaky-toy", "treat-shake"]' : '["mother-trill", "wet-can"]';
  try {
    state.workedSounds = JSON.parse(safeStorage.getItem(getWorkedStorageKey(), defaultWorked));
  } catch (_) {
    state.workedSounds = isDog ? ['dog-squeaky-toy', 'treat-shake'] : ['mother-trill', 'wet-can'];
  }

  try {
    state.hidingSpots = JSON.parse(
      safeStorage.getItem(getSpotsStorageKey(), JSON.stringify(getDefaultSpots()))
    );
  } catch (_) {
    state.hidingSpots = getDefaultSpots();
  }

  const record = state.tuning[state.species];
  const preset = getPresetById(getActivePresets(), record.presetId);

  state.activePresetId = preset.id;
  state.queue = [...preset.sequence];
  state.queueIndex = 0;
  state.selectedSoundId = preset.sequence[0];
  state.callSeconds = record.callSeconds;
  state.listenSeconds = record.listenSeconds;
  state.pitch = record.pitch;
  state.gentleMode = record.gentleMode;
  state.volume = state.tuning.volume;
  state.autoMic = state.tuning.autoMic;

  // Restore the controls programmatically. Never dispatch input/change here:
  // a synthetic change would enable the microphone or write storage on load.
  callDurationSlider.value = String(state.callSeconds);
  listenDurationSlider.value = String(state.listenSeconds);
  pitchSlider.value = String(state.pitch);
  volumeSlider.value = String(state.volume);
  gentleModeSwitch.checked = state.gentleMode;
  gentleModeSwitch.setAttribute('aria-checked', String(state.gentleMode));
  autoMicSwitch.checked = state.autoMic;
  autoMicSwitch.setAttribute('aria-checked', String(state.autoMic));

  syncSliderCustomProps(callDurationSlider);
  syncSliderCustomProps(listenDurationSlider);
  syncSliderCustomProps(pitchSlider);
  syncSliderCustomProps(volumeSlider);

  audioEngine.setVolume(state.volume / 100);
  audioEngine.setPitch(state.pitch / 100);
  audioEngine.setGentleMode(state.gentleMode);

  updateTuningLabels();
  renderPresets();
  renderQueueStrip();
  renderSoundPads();
  updateTransportHeader();

  if (persist) {
    persistTuning();
  }

  updateCycleButtons();
  updateRadarControls();
  renderDetectionLog();
  renderHidingSpots();
}

function handleSpeciesSwitch(targetSpecies) {
  if (!targetSpecies) return;
  if (targetSpecies !== state.species) {
    applySpeciesMode(targetSpecies, { persist: true });
  }
}

if (speciesCatBtn) {
  speciesCatBtn.addEventListener('click', (e) => {
    e.preventDefault();
    handleSpeciesSwitch('cat');
  });
}

if (speciesDogBtn) {
  speciesDogBtn.addEventListener('click', (e) => {
    e.preventDefault();
    handleSpeciesSwitch('dog');
  });
}

const speciesToggleGroup = document.querySelector('.species-toggle-group');
if (speciesToggleGroup) {
  speciesToggleGroup.addEventListener('click', (e) => {
    const btn = e.target.closest('.species-toggle-btn');
    if (btn && btn.dataset.species) {
      handleSpeciesSwitch(btn.dataset.species);
    }
  });
}

/**
 * Render Scenario Quick Presets
 */
function renderPresets() {
  presetList.innerHTML = '';
  getActivePresets().forEach((preset) => {
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
  state.tuning = setSpeciesPreset(state.tuning, state.species, preset);

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
  persistTuning();
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
  const isDog = state.species === 'dog';
  const workedLabel = isDog ? 'หมาหัน' : 'แมวหัน';
  const workedDoneLabel = isDog ? 'หมาหันแล้ว' : 'แมวหันแล้ว';
  workedTabCount.textContent = String(state.workedSounds.length);
  soundPadGrid.innerHTML = '';

  const filtered = getActiveCatalog().filter((item) => {
    if (state.activeCategory === 'all') return true;
    if (state.activeCategory === 'worked') return state.workedSounds.includes(item.id);
    return item.category === state.activeCategory;
  });

  if (filtered.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'detection-log-empty';
    empty.textContent = `ยังไม่มีเสียงที่ทำเครื่องหมายว่า "${workedLabel}" ลองกดปุ่ม "${workedLabel}" บนเสียงที่ได้ผล`;
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
    workedBtn.textContent = isWorked ? workedDoneLabel : workedLabel;
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
  safeStorage.setItem(getWorkedStorageKey(), JSON.stringify(state.workedSounds));
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
  wakeLockController?.acquire('cycle');

  try {
    if (state.autoMic && !state.micActive) {
      const res = await audioEngine.enableMicrophoneRadar();
      state.micActive = res.active;
      updateRadarControls();
    }

    state.cycleRunning = true;
    state.queueIndex = 0;
    enterCallingPhase();
    updateCycleButtons();
  } catch (err) {
    wakeLockController?.release('cycle');
    stopCallListenCycle();
    console.warn('Could not start call/listen cycle:', err);
  }
}

function stopCallListenCycle() {
  wakeLockController?.release('cycle');
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
  const isDog = state.species === 'dog';
  cycleToggleBtn.dataset.running = String(running);
  mobileCycleBtn.dataset.running = String(running);
  cyclePlayIcon.hidden = running;
  cycleStopIcon.hidden = !running;
  cycleBtnLabel.textContent = running
    ? isDog
      ? 'หยุดวนเรียกสุนัข'
      : 'หยุดวนเรียกแมว'
    : 'เริ่มวนเรียก + เงียบฟัง';
  mobileCycleBtnText.textContent = running
    ? 'หยุดวนเรียก'
    : isDog
    ? 'เริ่มวนเรียกหมา'
    : 'เริ่มวนเรียกแมว';
}

function updateTransportHeader() {
  const isDog = state.species === 'dog';
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
    phaseBadge.textContent = isDog ? 'พร้อมเรียกสุนัข' : 'พร้อมเรียกแมว';
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
  triggerSingleSound(state.species === 'dog' ? 'dog-squeaky-toy' : 'mother-trill');
});

mobileWetCanBtn.addEventListener('click', () => {
  triggerSingleSound(state.species === 'dog' ? 'treat-shake' : 'wet-can');
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
  state.tuning = setGlobalValue(state.tuning, 'volume', state.volume);
  audioEngine.setVolume(state.volume / 100);
  updateTuningLabels();
  persistTuning();
});

pitchSlider.addEventListener('input', () => {
  state.pitch = Number(pitchSlider.value);
  state.tuning = setSpeciesValue(state.tuning, state.species, 'pitch', state.pitch);
  audioEngine.setPitch(state.pitch / 100);
  updateTuningLabels();
  persistTuning();
});

callDurationSlider.addEventListener('input', () => {
  state.callSeconds = Number(callDurationSlider.value);
  state.tuning = setSpeciesValue(state.tuning, state.species, 'callSeconds', state.callSeconds);
  updateTuningLabels();
  persistTuning();
});

listenDurationSlider.addEventListener('input', () => {
  state.listenSeconds = Number(listenDurationSlider.value);
  state.tuning = setSpeciesValue(state.tuning, state.species, 'listenSeconds', state.listenSeconds);
  updateTuningLabels();
  persistTuning();
});

gentleModeSwitch.addEventListener('change', () => {
  state.gentleMode = gentleModeSwitch.checked;
  state.tuning = setSpeciesValue(state.tuning, state.species, 'gentleMode', state.gentleMode);
  audioEngine.setGentleMode(state.gentleMode);
  persistTuning();
});

autoMicSwitch.addEventListener('change', async () => {
  state.autoMic = autoMicSwitch.checked;
  state.tuning = setGlobalValue(state.tuning, 'autoMic', state.autoMic);
  persistTuning();
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
  const isDog = state.species === 'dog';
  audioEngine.triggerSimulatedCatReply(state.species);
  recordSoundDetection(
    isDog ? 'ตรวจพบเสียงสุนัขเห่าตอบรับ (จำลองทดสอบ)' : 'ตรวจพบเสียงเหมียวตอบรับ (จำลองทดสอบ)',
    76
  );
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
  safeStorage.setItem('meowmeow_bokbok_detections', JSON.stringify(state.detectionLog));

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
  safeStorage.setItem('meowmeow_bokbok_detections', '[]');
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
      safeStorage.setItem(getSpotsStorageKey(), JSON.stringify(state.hidingSpots));
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
  safeStorage.setItem(getSpotsStorageKey(), JSON.stringify(state.hidingSpots));
  renderHidingSpots();
});

let focusStartAfterFoundClose = false;

foundCatBtn.addEventListener('click', () => {
  stopCallListenCycle();

  const species = state.species;
  const petName = species === 'dog' ? 'สุนัข' : 'แมว';
  const room = state.activeRoom;
  const soundTitle = getSoundMeta(state.selectedSoundId).title;
  const checkedCount = state.hidingSpots.filter((spot) => spot.checked).length;
  const totalCount = state.hidingSpots.length;
  const priorDetectionCount = state.detectionLog.length;
  const timeLabel = new Intl.DateTimeFormat('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date());

  recordSoundDetection(`เจอตัว${petName}ที่ "${room}" แล้ว!`, 82);
  if (!state.workedSounds.includes(state.selectedSoundId) && state.selectedSoundId !== 'custom-voice') {
    state.workedSounds.push(state.selectedSoundId);
    safeStorage.setItem(getWorkedStorageKey(), JSON.stringify(state.workedSounds));
    renderSoundPads();
  }

  const recap = buildFoundRecap({
    species,
    room,
    timeLabel,
    soundTitle,
    checkedCount,
    totalCount,
    priorDetectionCount
  });

  foundDialogTitle.textContent = recap.title;
  foundDialogMessage.textContent = recap.message;
  foundDialogRoom.textContent = recap.roomValue;
  foundDialogTime.textContent = recap.timeValue;
  foundDialogSound.textContent = recap.soundValue;
  foundDialogProgress.textContent = recap.progressValue;
  foundDialogDetection.textContent = recap.detectionValue;
  foundSearchAgainBtn.textContent = recap.primaryAction;
  closeFoundDialogSecondaryBtn.textContent = recap.secondaryAction;

  try {
    if (!foundDialog.open) {
      foundDialog.showModal();
    }
  } catch (err) {
    console.warn('Could not open found dialog:', err);
  }
});

foundSearchAgainBtn.addEventListener('click', () => {
  state.hidingSpots = state.hidingSpots.map((spot) => ({ ...spot, checked: false }));
  safeStorage.setItem(getSpotsStorageKey(), JSON.stringify(state.hidingSpots));
  renderHidingSpots();
  focusStartAfterFoundClose = true;
  foundDialog.close();
});

closeFoundDialogBtn.addEventListener('click', () => foundDialog.close());
closeFoundDialogSecondaryBtn.addEventListener('click', () => foundDialog.close());

foundDialog.addEventListener('close', () => {
  if (!focusStartAfterFoundClose) return;
  focusStartAfterFoundClose = false;
  requestAnimationFrame(() => {
    cycleToggleBtn.focus();
  });
});

if (!('closedBy' in HTMLDialogElement.prototype)) {
  foundDialog.addEventListener('click', (event) => {
    if (event.target !== foundDialog) return;
    const rect = foundDialog.getBoundingClientRect();
    const isDialogContent =
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width;
    if (isDialogContent) return;
    foundDialog.close();
  });
}

resetChecklistBtn.addEventListener('click', () => {
  state.hidingSpots = getDefaultSpots().map((s) => ({ ...s, checked: false }));
  safeStorage.setItem(getSpotsStorageKey(), JSON.stringify(state.hidingSpots));
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
 * Register the app-shell service worker without blocking startup.
 */
function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || !window.isSecureContext) return;
  try {
    navigator.serviceWorker.register('./service-worker.js', {
      scope: './',
      updateViaCache: 'none'
    }).catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  } catch (err) {
    console.warn('Service worker registration failed:', err);
  }
}

/**
 * Initialize Application
 */
function init() {
  try {
    applyTheme(state.theme);
  } catch (err) {
    console.warn('Theme init warning:', err);
  }

  try {
    applySpeciesMode(state.species);
  } catch (err) {
    console.error('Species mode init error:', err);
  }

  try {
    initAllSliders();
  } catch (err) {
    console.warn('Sliders init warning:', err);
  }

  try {
    initSwitches();
  } catch (err) {
    console.warn('Switches init warning:', err);
  }

  try {
    wakeLockController = createWakeLockController({
      wakeLock: navigator.wakeLock,
      documentRef: document,
      windowRef: window,
      onError: (err) => console.warn('Screen wake lock unavailable:', err)
    });
  } catch (err) {
    console.warn('Screen wake lock init warning:', err);
  }

  try {
    initTorchDialog();
  } catch (err) {
    console.warn('Torch dialog init warning:', err);
  }

  try {
    updateTuningLabels();
  } catch (_) {}

  try {
    updateCustomVoiceUI();
  } catch (_) {}

  try {
    registerServiceWorker();
  } catch (err) {
    console.warn('Service worker init warning:', err);
  }

  try {
    requestAnimationFrame(renderLoopFrame);
  } catch (_) {}
}

init();
