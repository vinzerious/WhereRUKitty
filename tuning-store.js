/**
 * Pure tuning persistence for MeowMeow-BokBok.
 *
 * The store owns the version-1 tuning shape, validation, clamping, and the
 * localStorage envelope. It never touches window, document, navigator, or the
 * real localStorage; callers pass a storage-like object and the preset
 * catalogs. That keeps every rule testable under node:test without a browser.
 */

export const TUNING_STORAGE_KEY = 'meowmeow_bokbok_tuning';
export const TUNING_VERSION = 1;

export const DEFAULT_VOLUME = 85;
export const DEFAULT_AUTO_MIC = false;

const VOLUME_MIN = 10;
const VOLUME_MAX = 100;
const VOLUME_STEP = 5;
const PITCH_MIN = 75;
const PITCH_MAX = 125;
const CALL_MIN = 2;
const CALL_MAX = 6;
const LISTEN_MIN = 2;
const LISTEN_MAX = 8;

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeVolume(value) {
  if (!isFiniteNumber(value)) return null;
  const clamped = clamp(value, VOLUME_MIN, VOLUME_MAX);
  return clamp(Math.round(clamped / VOLUME_STEP) * VOLUME_STEP, VOLUME_MIN, VOLUME_MAX);
}

function normalizePitch(value) {
  if (!isFiniteNumber(value)) return null;
  return clamp(Math.round(value), PITCH_MIN, PITCH_MAX);
}

function normalizeCallSeconds(value) {
  if (!isFiniteNumber(value)) return null;
  return clamp(Math.round(value), CALL_MIN, CALL_MAX);
}

function normalizeListenSeconds(value) {
  if (!isFiniteNumber(value)) return null;
  return clamp(Math.round(value), LISTEN_MIN, LISTEN_MAX);
}

export function getPresetById(presets, presetId) {
  return presets.find((preset) => preset.id === presetId) || presets[0];
}

export function getDefaultSpeciesRecord(presets) {
  const preset = presets[0];
  return {
    presetId: preset.id,
    pitch: Math.round(preset.pitch * 100),
    callSeconds: preset.callSeconds,
    listenSeconds: preset.listenSeconds,
    gentleMode: Boolean(preset.gentleMode)
  };
}

function normalizeSpeciesRecord(rawRecord, presets) {
  const preset =
    isPlainObject(rawRecord) && typeof rawRecord.presetId === 'string'
      ? getPresetById(presets, rawRecord.presetId)
      : presets[0];

  const presetPitch = Math.round(preset.pitch * 100);
  const pitch = normalizePitch(rawRecord?.pitch);
  const callSeconds = normalizeCallSeconds(rawRecord?.callSeconds);
  const listenSeconds = normalizeListenSeconds(rawRecord?.listenSeconds);
  const gentleMode =
    typeof rawRecord?.gentleMode === 'boolean' ? rawRecord.gentleMode : Boolean(preset.gentleMode);

  return {
    presetId: preset.id,
    pitch: pitch === null ? presetPitch : pitch,
    callSeconds: callSeconds === null ? preset.callSeconds : callSeconds,
    listenSeconds: listenSeconds === null ? preset.listenSeconds : listenSeconds,
    gentleMode
  };
}

export function normalizeTuning(raw, presetsBySpecies) {
  const defaults = {
    version: TUNING_VERSION,
    volume: DEFAULT_VOLUME,
    autoMic: DEFAULT_AUTO_MIC,
    cat: getDefaultSpeciesRecord(presetsBySpecies.cat),
    dog: getDefaultSpeciesRecord(presetsBySpecies.dog)
  };

  if (!isPlainObject(raw) || raw.version !== TUNING_VERSION) {
    return defaults;
  }

  const volume = normalizeVolume(raw.volume);
  const autoMic = typeof raw.autoMic === 'boolean' ? raw.autoMic : DEFAULT_AUTO_MIC;

  return {
    version: TUNING_VERSION,
    volume: volume === null ? DEFAULT_VOLUME : volume,
    autoMic,
    cat: normalizeSpeciesRecord(raw.cat, presetsBySpecies.cat),
    dog: normalizeSpeciesRecord(raw.dog, presetsBySpecies.dog)
  };
}

export function loadTuning(storage, presetsBySpecies) {
  let raw = null;
  try {
    const value = storage?.getItem(TUNING_STORAGE_KEY);
    if (typeof value === 'string' && value.length > 0) {
      raw = JSON.parse(value);
    }
  } catch (_) {
    raw = null;
  }
  return normalizeTuning(raw, presetsBySpecies);
}

export function saveTuning(storage, tuning) {
  if (!storage || typeof storage.setItem !== 'function') return false;
  if (!isPlainObject(tuning) || !isPlainObject(tuning.cat) || !isPlainObject(tuning.dog)) {
    return false;
  }

  const payload = {
    version: TUNING_VERSION,
    volume: tuning.volume,
    autoMic: tuning.autoMic,
    cat: {
      presetId: tuning.cat.presetId,
      pitch: tuning.cat.pitch,
      callSeconds: tuning.cat.callSeconds,
      listenSeconds: tuning.cat.listenSeconds,
      gentleMode: tuning.cat.gentleMode
    },
    dog: {
      presetId: tuning.dog.presetId,
      pitch: tuning.dog.pitch,
      callSeconds: tuning.dog.callSeconds,
      listenSeconds: tuning.dog.listenSeconds,
      gentleMode: tuning.dog.gentleMode
    }
  };

  try {
    storage.setItem(TUNING_STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (_) {
    return false;
  }
}

export function setSpeciesPreset(tuning, species, preset) {
  return {
    ...tuning,
    [species]: {
      presetId: preset.id,
      pitch: Math.round(preset.pitch * 100),
      callSeconds: preset.callSeconds,
      listenSeconds: preset.listenSeconds,
      gentleMode: Boolean(preset.gentleMode)
    }
  };
}

export function setSpeciesValue(tuning, species, key, value) {
  return {
    ...tuning,
    [species]: {
      ...tuning[species],
      [key]: value
    }
  };
}

export function setGlobalValue(tuning, key, value) {
  return {
    ...tuning,
    [key]: value
  };
}
