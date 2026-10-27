import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { createWakeLockController } from '../wake-lock-controller.js';

function createSentinel() {
  const sentinel = new EventTarget();
  sentinel.released = false;
  sentinel.releaseCalls = 0;
  sentinel.release = async () => {
    sentinel.releaseCalls += 1;
    if (sentinel.released) return;
    sentinel.released = true;
    sentinel.dispatchEvent(new Event('release'));
  };
  return sentinel;
}

function createFakeWakeLock() {
  const state = {
    requests: [],
    sentinels: [],
    mode: 'resolve',
    resolvePending: null
  };

  return {
    get requests() {
      return state.requests;
    },
    get sentinels() {
      return state.sentinels;
    },
    setMode(mode) {
      state.mode = mode;
    },
    resolvePending() {
      if (!state.resolvePending) return;
      const resolve = state.resolvePending;
      state.resolvePending = null;
      resolve();
    },
    request(type) {
      state.requests.push(type);
      if (state.mode === 'reject') {
        return Promise.reject(new Error('wake lock denied'));
      }

      const sentinel = createSentinel();
      state.sentinels.push(sentinel);

      if (state.mode === 'defer') {
        return new Promise((resolve) => {
          state.resolvePending = () => resolve(sentinel);
        });
      }

      return Promise.resolve(sentinel);
    }
  };
}

function createEnvironment() {
  const documentRef = new EventTarget();
  documentRef.visibilityState = 'visible';
  documentRef.setVisibility = (value) => {
    documentRef.visibilityState = value;
    documentRef.dispatchEvent(new Event('visibilitychange'));
  };

  const windowRef = new EventTarget();
  windowRef.showPage = () => windowRef.dispatchEvent(new Event('pageshow'));

  return { documentRef, windowRef };
}

function createHarness(overrides = {}) {
  const fake = createFakeWakeLock();
  const env = createEnvironment();
  const errors = [];
  const controller = createWakeLockController({
    wakeLock: fake,
    documentRef: env.documentRef,
    windowRef: env.windowRef,
    onError: (error) => errors.push(error),
    ...overrides
  });

  return { controller, fake, env, errors };
}

function flush() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

test('first acquire requests one screen lock', async () => {
  const { controller, fake } = createHarness();

  await controller.acquire('cycle');
  assert.deepEqual(fake.requests, ['screen']);
  assert.equal(fake.sentinels.length, 1);

  await controller.release('cycle');
  assert.equal(fake.sentinels[0].released, true);
});

test('duplicate reasons do not request twice', async () => {
  const { controller, fake } = createHarness();

  await controller.acquire('cycle');
  await controller.acquire('cycle');
  assert.equal(fake.requests.length, 1);

  await controller.release('cycle');
  assert.equal(fake.sentinels[0].released, true);
});

test('two reasons share one sentinel and release only when both leave', async () => {
  const { controller, fake } = createHarness();

  await controller.acquire('cycle');
  await controller.acquire('torch');
  assert.equal(fake.requests.length, 1);

  await controller.release('cycle');
  assert.equal(fake.sentinels[0].released, false);

  await controller.release('torch');
  assert.equal(fake.sentinels[0].released, true);
});

test('hidden acquire defers until visible', async () => {
  const { controller, fake, env } = createHarness();

  env.documentRef.setVisibility('hidden');
  await controller.acquire('cycle');
  assert.equal(fake.requests.length, 0);

  env.documentRef.setVisibility('visible');
  await flush();
  assert.deepEqual(fake.requests, ['screen']);
  assert.equal(fake.sentinels.length, 1);

  await controller.release('cycle');
});

test('pageshow re-acquires when visible', async () => {
  const { controller, fake, env } = createHarness();

  await controller.acquire('cycle');
  const first = fake.sentinels[0];
  await first.release();
  await flush();
  assert.equal(fake.requests.length, 1);

  env.windowRef.showPage();
  await flush();
  assert.equal(fake.requests.length, 2);
  assert.equal(fake.sentinels[1].released, false);

  await controller.release('cycle');
});

test('a browser release clears the sentinel without a retry loop', async () => {
  const { controller, fake, env } = createHarness();

  await controller.acquire('cycle');
  await fake.sentinels[0].release();
  await flush();
  assert.equal(fake.requests.length, 1);

  env.documentRef.setVisibility('visible');
  await flush();
  assert.equal(fake.requests.length, 2);

  await controller.release('cycle');
});

test('a pending request is released when the last reason is released', async () => {
  const { controller, fake } = createHarness();

  fake.setMode('defer');
  const acquisition = controller.acquire('cycle');
  assert.deepEqual(fake.requests, ['screen']);

  const release = controller.release('cycle');
  fake.resolvePending();
  await Promise.all([acquisition, release]);

  assert.equal(fake.sentinels[0].released, true);
  assert.equal(fake.requests.length, 1);
});

test('rejection reports and a later acquire retries', async () => {
  const { controller, fake, errors } = createHarness();

  fake.setMode('reject');
  await controller.acquire('cycle');
  assert.equal(errors.length, 1);
  assert.equal(fake.requests.length, 1);
  assert.equal(fake.sentinels.length, 0);

  fake.setMode('resolve');
  await controller.acquire('cycle');
  assert.equal(fake.requests.length, 2);
  assert.equal(fake.sentinels.length, 1);

  await controller.release('cycle');
});

test('missing API and missing DOM dependencies are safe', async () => {
  const errors = [];
  const noApi = createWakeLockController({
    documentRef: undefined,
    windowRef: undefined,
    onError: (error) => errors.push(error)
  });

  await noApi.acquire('cycle');
  assert.equal(errors.length, 1);
  assert.match(errors[0].message, /unavailable/i);
  await noApi.release('cycle');
  await noApi.destroy();

  const fake = createFakeWakeLock();
  const noDom = createWakeLockController({
    wakeLock: fake,
    onError: (error) => errors.push(error)
  });

  await noDom.acquire('cycle');
  assert.deepEqual(fake.requests, ['screen']);
  await noDom.release('cycle');
  await noDom.destroy();
  assert.equal(errors.length, 1);
});

test('destroy releases the lock and removes listeners', async () => {
  const { controller, fake, env, errors } = createHarness();

  await controller.acquire('cycle');
  const held = fake.sentinels[0];
  await controller.destroy();
  assert.equal(held.released, true);

  env.documentRef.setVisibility('hidden');
  env.documentRef.setVisibility('visible');
  env.windowRef.showPage();
  await flush();
  assert.equal(fake.requests.length, 1);

  await controller.acquire('cycle');
  assert.equal(fake.requests.length, 1);
  await controller.release('cycle');
  assert.equal(fake.requests.length, 1);
  assert.equal(errors.length, 0);
});

test('construction with no dependencies is safe', async () => {
  const controller = createWakeLockController();

  await controller.acquire('cycle');
  await controller.release('cycle');
  await controller.destroy();
});

test('app wires the cycle and torch reasons', () => {
  const app = fs.readFileSync(fileURLToPath(new URL('../app.js', import.meta.url)), 'utf8');

  assert.match(app, /from\s+['"]\.\/wake-lock-controller\.js['"]/);
  assert.match(app, /createWakeLockController\s*\(/);
  assert.match(app, /wakeLock:\s*navigator\.wakeLock/);
  assert.match(app, /documentRef:\s*document/);
  assert.match(app, /windowRef:\s*window/);
  assert.match(app, /wakeLockController\?\.acquire\(['"]cycle['"]\)/);
  assert.match(app, /wakeLockController\?\.release\(['"]cycle['"]\)/);
  assert.match(app, /wakeLockController\?\.acquire\(['"]torch['"]\)/);
  assert.match(app, /wakeLockController\?\.release\(['"]torch['"]\)/);
});
