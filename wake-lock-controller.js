/**
 * Screen Wake Lock controller for the call/listen cycle and torch dialog.
 *
 * The controller owns one `screen` sentinel across a set of named reasons.
 * It never touches browser globals directly: callers pass `navigator.wakeLock`,
 * `document`, and `window`, which keeps every rule testable under node:test.
 */

function report(onError, error) {
  if (typeof onError !== 'function') return;
  try {
    onError(error);
  } catch (_) {}
}

export function createWakeLockController({
  wakeLock,
  documentRef,
  windowRef,
  onError
} = {}) {
  const reasons = new Set();
  let sentinel = null;
  let pending = null;
  let destroyed = false;

  function isVisible() {
    return documentRef?.visibilityState !== 'hidden';
  }

  function releaseSentinel(target) {
    if (!target) return Promise.resolve();
    try {
      if (target.released || typeof target.release !== 'function') {
        return Promise.resolve();
      }
      return Promise.resolve(target.release()).catch((error) => {
        report(onError, error);
      });
    } catch (error) {
      report(onError, error);
      return Promise.resolve();
    }
  }

  function requestIfNeeded() {
    if (destroyed || reasons.size === 0) return Promise.resolve();
    if (!isVisible()) return Promise.resolve();

    if (!wakeLock || typeof wakeLock.request !== 'function') {
      report(onError, new Error('Screen Wake Lock API unavailable'));
      return Promise.resolve();
    }

    if (sentinel) {
      if (!sentinel.released) return Promise.resolve();
      sentinel = null;
    }

    if (pending) return pending;

    let request;
    try {
      request = wakeLock.request('screen');
    } catch (error) {
      report(onError, error);
      return Promise.resolve();
    }

    pending = Promise.resolve(request)
      .then((nextSentinel) => {
        pending = null;
        if (!nextSentinel) return undefined;

        if (destroyed || reasons.size === 0) {
          return releaseSentinel(nextSentinel);
        }

        if (nextSentinel.released) return undefined;

        sentinel = nextSentinel;
        try {
          nextSentinel.addEventListener('release', () => {
            if (sentinel === nextSentinel) sentinel = null;
          });
        } catch (_) {}
        return undefined;
      })
      .catch((error) => {
        pending = null;
        report(onError, error);
      });

    return pending;
  }

  function acquire(reason) {
    if (destroyed) return Promise.resolve();
    reasons.add(reason);
    return requestIfNeeded();
  }

  function release(reason) {
    reasons.delete(reason);
    if (reasons.size > 0) return Promise.resolve();

    const held = sentinel;
    sentinel = null;
    if (held) return releaseSentinel(held);
    return pending ? pending.then(() => undefined) : Promise.resolve();
  }

  function handleVisibilityChange() {
    if (destroyed || !isVisible()) return;
    requestIfNeeded();
  }

  function handlePageShow() {
    if (destroyed || !isVisible()) return;
    requestIfNeeded();
  }

  try {
    documentRef?.addEventListener?.('visibilitychange', handleVisibilityChange);
  } catch (_) {}

  try {
    windowRef?.addEventListener?.('pageshow', handlePageShow);
  } catch (_) {}

  function destroy() {
    if (destroyed) return Promise.resolve();
    destroyed = true;
    reasons.clear();

    try {
      documentRef?.removeEventListener?.('visibilitychange', handleVisibilityChange);
    } catch (_) {}

    try {
      windowRef?.removeEventListener?.('pageshow', handlePageShow);
    } catch (_) {}

    const held = sentinel;
    sentinel = null;
    if (held) return releaseSentinel(held);
    return pending ? pending.then(() => undefined) : Promise.resolve();
  }

  return { acquire, release, destroy };
}
