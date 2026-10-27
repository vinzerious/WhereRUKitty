import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  TUNING_STORAGE_KEY,
  TUNING_VERSION,
  loadTuning,
  saveTuning,
  normalizeTuning,
  getPresetById,
  setSpeciesPreset,
  setSpeciesValue,
  setGlobalValue
} from '../tuning-store.js';

const CAT_PRESETS = [
  {
    id: 'vocal-reply',
    sequence: ['mother-trill', 'kitten-mew', 'greeting-meow'],
    callSeconds: 3,
    listenSeconds: 4,
    gentleMode: false,
    pitch: 1.0
  },
  {
    id: 'timid-safe',
    sequence: ['purr-chirp', 'mother-trill', 'greeting-meow'],
    callSeconds: 3,
    listenSeconds: 5,
    gentleMode: true,
    pitch: 0.94
  },
  {
    id: 'hunter-peek',
    sequence: ['bird-chirp', 'foil-crinkle', 'ear-perk-sweep'],
    callSeconds: 3,
    listenSeconds: 4,
    gentleMode: false,
    pitch: 1.05
  }
];

const DOG_PRESETS = [
  {
    id: 'dog-squeak-lure',
    sequence: ['dog-squeaky-toy', 'dog-doorbell', 'dog-kiss-whistle'],
    callSeconds: 3,
    listenSeconds: 3,
    gentleMode: false,
    pitch: 1.0
  },
  {
    id: 'dog-thunder-calm',
    sequence: ['dog-heartbeat-calm', 'dog-kiss-whistle', 'dog-puppy-whine'],
    callSeconds: 3,
    listenSeconds: 5,
    gentleMode: true,
    pitch: 0.94
  }
];

const PRESETS = { cat: CAT_PRESETS, dog: DOG_PRESETS };

const DEFAULT_SNAPSHOT = {
  version: 1,
  volume: 85,
  autoMic: false,
  cat: {
    presetId: 'vocal-reply',
    pitch: 100,
    callSeconds: 3,
    listenSeconds: 4,
    gentleMode: false
  },
  dog: {
    presetId: 'dog-squeak-lure',
    pitch: 100,
    callSeconds: 3,
    listenSeconds: 3,
    gentleMode: false
  }
};

function createStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  const calls = [];

  return {
    data,
    calls,
    getItem(key) {
      calls.push(['get', key]);
      return data.has(key) ? data.get(key) : null;
    },
    setItem(key, value) {
      calls.push(['set', key, value]);
      data.set(key, value);
    }
  };
}

function defaultTuning() {
  return loadTuning(createStorage(), PRESETS);
}

function withRaw(overrides = {}) {
  return {
    version: 1,
    volume: 85,
    autoMic: false,
    cat: {},
    dog: {},
    ...overrides
  };
}

test('exposes the persistence contract constants', () => {
  assert.equal(TUNING_VERSION, 1);
  assert.equal(TUNING_STORAGE_KEY, 'meowmeow_bokbok_tuning');
});

test('loads first-run defaults when the key is absent', () => {
  const storage = createStorage();
  const tuning = loadTuning(storage, PRESETS);

  assert.deepEqual(tuning, DEFAULT_SNAPSHOT);
  assert.deepEqual(storage.calls, [['get', TUNING_STORAGE_KEY]]);
  assert.equal(
    storage.calls.some(([, key]) => key === 'whererukitty_tuning'),
    false
  );
});

test('saves the exact version-1 key and shape', () => {
  const storage = createStorage();
  const tuning = setSpeciesValue(
    setGlobalValue(defaultTuning(), 'volume', 55),
    'cat',
    'pitch',
    115
  );

  assert.equal(saveTuning(storage, tuning), true);

  const writes = storage.calls.filter(([op]) => op === 'set');
  assert.equal(writes.length, 1);
  assert.equal(writes[0][1], TUNING_STORAGE_KEY);
  assert.equal(writes[0][1] === 'whererukitty_tuning', false);

  assert.deepEqual(JSON.parse(storage.data.get(TUNING_STORAGE_KEY)), {
    version: 1,
    volume: 55,
    autoMic: false,
    cat: {
      presetId: 'vocal-reply',
      pitch: 115,
      callSeconds: 3,
      listenSeconds: 4,
      gentleMode: false
    },
    dog: {
      presetId: 'dog-squeak-lure',
      pitch: 100,
      callSeconds: 3,
      listenSeconds: 3,
      gentleMode: false
    }
  });
});

test('round-trips a normalized snapshot through storage', () => {
  const storage = createStorage();
  const tuning = normalizeTuning(
    withRaw({
      volume: 40,
      autoMic: true,
      cat: {
        presetId: 'timid-safe',
        pitch: 115,
        callSeconds: 5,
        listenSeconds: 6,
        gentleMode: true
      },
      dog: {
        presetId: 'dog-thunder-calm',
        pitch: 90,
        callSeconds: 2,
        listenSeconds: 8,
        gentleMode: true
      }
    }),
    PRESETS
  );

  assert.equal(saveTuning(storage, tuning), true);
  assert.deepEqual(loadTuning(storage, PRESETS), tuning);
});

test('keeps cat and dog records independent while sharing globals', () => {
  const tuning = normalizeTuning(
    withRaw({
      volume: 40,
      autoMic: true,
      cat: { presetId: 'timid-safe', pitch: 115 },
      dog: { presetId: 'dog-thunder-calm', pitch: 90 }
    }),
    PRESETS
  );

  assert.equal(tuning.volume, 40);
  assert.equal(tuning.autoMic, true);
  assert.equal(tuning.cat.pitch, 115);
  assert.equal(tuning.dog.pitch, 90);

  const next = setSpeciesValue(tuning, 'cat', 'listenSeconds', 7);
  assert.equal(next.cat.listenSeconds, 7);
  assert.equal(next.cat.pitch, 115);
  assert.equal(next.dog.listenSeconds, 5);
  assert.equal(next.volume, 40);
  assert.equal(next.autoMic, true);

  assert.equal(tuning.cat.listenSeconds, 5);
});

test('clamps and snaps volume to 5-point steps', () => {
  const cases = [
    [9, 10],
    [101, 100],
    [87, 85],
    [88, 90],
    [87.5, 90],
    ['55', 85],
    [null, 85]
  ];

  for (const [value, expected] of cases) {
    const tuning = normalizeTuning(withRaw({ volume: value }), PRESETS);
    assert.equal(tuning.volume, expected, `volume ${String(value)}`);
  }
});

test('clamps pitch without snapping authored off-step values', () => {
  const cases = [
    [74, 75],
    [126, 125],
    [94.4, 94],
    [94, 94],
    [105, 105],
    ['95', 100],
    [null, 100]
  ];

  for (const [value, expected] of cases) {
    const tuning = normalizeTuning(
      withRaw({ cat: { presetId: 'vocal-reply', pitch: value } }),
      PRESETS
    );
    assert.equal(tuning.cat.pitch, expected, `pitch ${String(value)}`);
  }

  const timid = normalizeTuning(
    withRaw({ cat: { presetId: 'timid-safe' } }),
    PRESETS
  );
  assert.equal(timid.cat.pitch, 94);

  const hunter = normalizeTuning(
    withRaw({ cat: { presetId: 'hunter-peek', pitch: 105 } }),
    PRESETS
  );
  assert.equal(hunter.cat.pitch, 105);
});

test('rounds and clamps call and listen durations', () => {
  const callCases = [
    [1, 2],
    [9, 6],
    [3.5, 4],
    [1.4, 2],
    [6.4, 6],
    ['5', 3],
    [null, 3]
  ];

  for (const [value, expected] of callCases) {
    const tuning = normalizeTuning(
      withRaw({ cat: { presetId: 'vocal-reply', callSeconds: value } }),
      PRESETS
    );
    assert.equal(tuning.cat.callSeconds, expected, `call ${String(value)}`);
  }

  const listenCases = [
    [1, 2],
    [9, 8],
    [7.5, 8],
    [1.4, 2],
    [8.4, 8],
    ['5', 4],
    [null, 4]
  ];

  for (const [value, expected] of listenCases) {
    const tuning = normalizeTuning(
      withRaw({ cat: { presetId: 'vocal-reply', listenSeconds: value } }),
      PRESETS
    );
    assert.equal(tuning.cat.listenSeconds, expected, `listen ${String(value)}`);
  }
});

test('accepts only real booleans for switches', () => {
  const invalid = [1, 0, 'true', 'false', null, undefined];

  for (const value of invalid) {
    const tuning = normalizeTuning(
      withRaw({
        autoMic: value,
        cat: { presetId: 'timid-safe', gentleMode: value },
        dog: { presetId: 'dog-squeak-lure', gentleMode: value }
      }),
      PRESETS
    );
    assert.equal(tuning.autoMic, false, `autoMic ${String(value)}`);
    assert.equal(tuning.cat.gentleMode, true, `cat gentle ${String(value)}`);
    assert.equal(tuning.dog.gentleMode, false, `dog gentle ${String(value)}`);
  }

  const tuning = normalizeTuning(
    withRaw({
      autoMic: true,
      cat: { presetId: 'vocal-reply', gentleMode: true },
      dog: { presetId: 'dog-thunder-calm', gentleMode: false }
    }),
    PRESETS
  );
  assert.equal(tuning.autoMic, true);
  assert.equal(tuning.cat.gentleMode, true);
  assert.equal(tuning.dog.gentleMode, false);
});

test('repairs partial records from the restored preset', () => {
  const tuning = normalizeTuning(
    withRaw({
      cat: { presetId: 'timid-safe', pitch: 110 },
      dog: { presetId: 'dog-thunder-calm', pitch: 90 }
    }),
    PRESETS
  );

  assert.deepEqual(tuning.cat, {
    presetId: 'timid-safe',
    pitch: 110,
    callSeconds: 3,
    listenSeconds: 5,
    gentleMode: true
  });
  assert.deepEqual(tuning.dog, {
    presetId: 'dog-thunder-calm',
    pitch: 90,
    callSeconds: 3,
    listenSeconds: 5,
    gentleMode: true
  });
});

test('falls back to the species first preset for unknown or missing ids', () => {
  const tuning = normalizeTuning(
    withRaw({
      cat: { presetId: 'does-not-exist', pitch: 110 },
      dog: {}
    }),
    PRESETS
  );

  assert.deepEqual(tuning.cat, {
    presetId: 'vocal-reply',
    pitch: 110,
    callSeconds: 3,
    listenSeconds: 4,
    gentleMode: false
  });
  assert.deepEqual(tuning.dog, DEFAULT_SNAPSHOT.dog);

  const missing = normalizeTuning(
    withRaw({ cat: undefined, dog: undefined }),
    PRESETS
  );
  assert.deepEqual(missing.cat, DEFAULT_SNAPSHOT.cat);
  assert.deepEqual(missing.dog, DEFAULT_SNAPSHOT.dog);
});

test('treats non-object species records as missing', () => {
  for (const cat of [null, [], 'x', 1]) {
    const tuning = normalizeTuning(withRaw({ cat, dog: {} }), PRESETS);
    assert.deepEqual(tuning.cat, DEFAULT_SNAPSHOT.cat, `cat ${String(cat)}`);
  }
});

test('keeps valid globals when species records are missing', () => {
  const tuning = normalizeTuning(
    { version: 1, volume: 40, autoMic: true },
    PRESETS
  );

  assert.equal(tuning.volume, 40);
  assert.equal(tuning.autoMic, true);
  assert.equal(tuning.cat.presetId, 'vocal-reply');
  assert.equal(tuning.dog.presetId, 'dog-squeak-lure');
});

test('falls back to defaults for malformed, non-object, and wrong-version data', () => {
  const defaults = defaultTuning();
  const raws = [
    '{not json',
    'null',
    '[]',
    '"x"',
    '1',
    JSON.stringify({ version: 2, volume: 10, autoMic: true }),
    JSON.stringify({ version: '1', volume: 10, autoMic: true })
  ];

  for (const raw of raws) {
    const tuning = loadTuning(
      createStorage({ [TUNING_STORAGE_KEY]: raw }),
      PRESETS
    );
    assert.deepEqual(tuning, defaults, `raw ${raw}`);
  }
});

test('never throws when storage is blocked or absent', () => {
  const throwing = {
    getItem() {
      throw new Error('blocked');
    },
    setItem() {
      throw new Error('blocked');
    }
  };

  const defaults = defaultTuning();
  assert.deepEqual(loadTuning(throwing, PRESETS), defaults);
  assert.equal(saveTuning(throwing, defaults), false);
  assert.deepEqual(loadTuning(null, PRESETS), defaults);
  assert.equal(saveTuning(null, defaults), false);
});

test('saveTuning rejects an unusable snapshot', () => {
  const storage = createStorage();

  assert.equal(saveTuning(storage, null), false);
  assert.equal(saveTuning(storage, { version: 1, cat: {}, dog: null }), false);
  assert.deepEqual(storage.calls, []);
});

test('saveTuning writes only the contract fields', () => {
  const storage = createStorage();
  const tuning = defaultTuning();
  const noisy = {
    ...tuning,
    extra: true,
    cat: { ...tuning.cat, extra: true }
  };

  assert.equal(saveTuning(storage, noisy), true);

  const parsed = JSON.parse(storage.data.get(TUNING_STORAGE_KEY));
  assert.deepEqual(parsed, tuning);
  assert.equal('extra' in parsed, false);
  assert.equal('extra' in parsed.cat, false);
  assert.equal('extra' in parsed.dog, false);
});

test('normalizes a valid payload and ignores extra fields', () => {
  const tuning = normalizeTuning(
    withRaw({
      volume: 55,
      autoMic: true,
      extra: 'x',
      cat: {
        presetId: 'hunter-peek',
        pitch: 105,
        callSeconds: 4,
        listenSeconds: 6,
        gentleMode: false,
        extra: true
      },
      dog: {
        presetId: 'dog-thunder-calm',
        pitch: 90,
        callSeconds: 2,
        listenSeconds: 8,
        gentleMode: true
      }
    }),
    PRESETS
  );

  assert.deepEqual(tuning, {
    version: 1,
    volume: 55,
    autoMic: true,
    cat: {
      presetId: 'hunter-peek',
      pitch: 105,
      callSeconds: 4,
      listenSeconds: 6,
      gentleMode: false
    },
    dog: {
      presetId: 'dog-thunder-calm',
      pitch: 90,
      callSeconds: 2,
      listenSeconds: 8,
      gentleMode: true
    }
  });
});

test('getPresetById falls back to the first preset', () => {
  assert.equal(getPresetById(CAT_PRESETS, 'timid-safe').id, 'timid-safe');
  assert.equal(getPresetById(CAT_PRESETS, 'missing').id, 'vocal-reply');
  assert.equal(getPresetById(CAT_PRESETS, undefined).id, 'vocal-reply');
});

test('setSpeciesPreset replaces only the target species', () => {
  const tuning = defaultTuning();
  const next = setSpeciesPreset(tuning, 'cat', CAT_PRESETS[1]);

  assert.deepEqual(next.cat, {
    presetId: 'timid-safe',
    pitch: 94,
    callSeconds: 3,
    listenSeconds: 5,
    gentleMode: true
  });
  assert.deepEqual(next.dog, tuning.dog);
  assert.equal(next.volume, tuning.volume);
  assert.equal(next.autoMic, tuning.autoMic);
  assert.equal(tuning.cat.presetId, 'vocal-reply');
  assert.notEqual(next, tuning);
});

test('setSpeciesValue and setGlobalValue return new snapshots', () => {
  const tuning = defaultTuning();

  const species = setSpeciesValue(tuning, 'dog', 'callSeconds', 5);
  assert.equal(species.dog.callSeconds, 5);
  assert.equal(species.cat.callSeconds, 3);
  assert.equal(species.volume, tuning.volume);
  assert.equal(tuning.dog.callSeconds, 3);
  assert.notEqual(species, tuning);

  const global = setGlobalValue(tuning, 'autoMic', true);
  assert.equal(global.autoMic, true);
  assert.equal(global.volume, 85);
  assert.deepEqual(global.cat, tuning.cat);
  assert.deepEqual(global.dog, tuning.dog);
  assert.equal(tuning.autoMic, false);
  assert.notEqual(global, tuning);
});

test('reads and writes only the exact tuning key', () => {
  const storage = createStorage({
    whererukitty_tuning: JSON.stringify({
      version: 1,
      volume: 55,
      autoMic: true
    })
  });

  const tuning = loadTuning(storage, PRESETS);
  assert.equal(tuning.volume, 85);

  saveTuning(storage, tuning);

  assert.deepEqual(
    storage.calls.map(([op, key]) => [op, key]),
    [
      ['get', TUNING_STORAGE_KEY],
      ['set', TUNING_STORAGE_KEY]
    ]
  );
});
