/**
 * Hardware Camera Flash / Torch Controller
 * Resolves multi-lens rear cameras (Ultra-Wide/Macro vs Main Wide with LED flash),
 * iOS Safari live video pipeline warm-up, ImageCapture fillLightMode detection,
 * and direct applyConstraints fallback.
 */

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Score videoinput devices so main rear cameras with LED flash are probed before
 * ultra-wide, telephoto, macro, depth, or front cameras.
 */
export function rankRearCameraDevices(devices = [], alreadyTestedIds = new Set()) {
  const videoInputs = devices.filter(
    (d) => d && d.kind === 'videoinput' && d.deviceId && !alreadyTestedIds.has(d.deviceId)
  );

  const scoreDevice = (dev) => {
    const label = (dev.label || '').toLowerCase();
    let score = 0;

    // Deprioritize front-facing cameras
    if (/front|user|selfie|facetime|หน้า/.test(label)) {
      score -= 100;
    }

    // Prioritize rear/environment cameras
    if (/back|rear|environment|world|หลัง/.test(label)) {
      score += 40;
    }

    // Deprioritize secondary auxiliary lenses that rarely have LED flash wired
    if (/ultra[\s-]?wide|0\.5x|macro|depth|telephoto|tele|periscope|wide[\s-]?angle[\s-]?camera[\s-]?2/i.test(label)) {
      score -= 25;
    } else if (/main|wide|standard|camera2?\s*0|camera\s*1\b/i.test(label)) {
      score += 20;
    }

    // Primary rear camera on Android Camera2 API is almost always "camera2 0, facing back"
    if (/camera2?\s*0.*back|back.*0\b/i.test(label)) {
      score += 30;
    }

    return score;
  };

  return [...videoInputs].sort((a, b) => scoreDevice(b) - scoreDevice(a));
}

/**
 * Attach stream to a hidden muted playsInline video element so iOS Safari and Android
 * WebViews initialize the hardware camera capture pipeline before querying capabilities.
 */
async function warmUpVideoStream(stream, doc = typeof document !== 'undefined' ? document : null) {
  if (!doc || typeof doc.createElement !== 'function') {
    await delay(50);
    return null;
  }

  try {
    const videoEl = doc.createElement('video');
    videoEl.setAttribute('playsinline', '');
    videoEl.setAttribute('webkit-playsinline', '');
    videoEl.muted = true;
    videoEl.autoplay = true;
    videoEl.style.position = 'fixed';
    videoEl.style.top = '-9999px';
    videoEl.style.left = '-9999px';
    videoEl.style.width = '1px';
    videoEl.style.height = '1px';
    videoEl.style.opacity = '0';
    videoEl.style.pointerEvents = 'none';
    videoEl.srcObject = stream;

    if (doc.body) {
      doc.body.appendChild(videoEl);
    }

    const playPromise = videoEl.play?.();
    if (playPromise && typeof playPromise.catch === 'function') {
      await Promise.race([playPromise.catch(() => {}), delay(220)]);
    } else {
      await delay(60);
    }
    return videoEl;
  } catch (_) {
    return null;
  }
}

function cleanupVideoElement(videoEl) {
  if (!videoEl) return;
  try {
    videoEl.pause?.();
    videoEl.srcObject = null;
    videoEl.remove?.();
  } catch (_) {}
}

function stopStreamTracks(stream) {
  if (!stream) return;
  try {
    const tracks = stream.getTracks ? stream.getTracks() : stream.getVideoTracks ? stream.getVideoTracks() : [];
    tracks.forEach((t) => {
      try {
        t.stop();
      } catch (_) {}
    });
  } catch (_) {}
}

/**
 * Check if a MediaStreamTrack reports torch capability via getCapabilities() or ImageCapture.
 */
export async function probeTrackForTorch(track, ImageCaptureClass = typeof ImageCapture !== 'undefined' ? ImageCapture : null) {
  if (!track) return false;

  // Poll up to 3 times over ~120ms in case hardware capabilities populate asynchronously after stream start
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (typeof track.getCapabilities === 'function') {
        const caps = track.getCapabilities();
        if (caps && (caps.torch === true || (Array.isArray(caps.fillLightMode) && (caps.fillLightMode.includes('torch') || caps.fillLightMode.includes('flash'))))) {
          return true;
        }
      }
    } catch (_) {}

    if (ImageCaptureClass) {
      try {
        const ic = new ImageCaptureClass(track);
        if (typeof ic.getPhotoCapabilities === 'function') {
          const photoCaps = await ic.getPhotoCapabilities();
          if (
            photoCaps &&
            ((Array.isArray(photoCaps.fillLightMode) &&
              (photoCaps.fillLightMode.includes('torch') || photoCaps.fillLightMode.includes('flash'))) ||
              photoCaps.torch === true)
          ) {
            return true;
          }
        }
      } catch (_) {}
    }

    if (attempt < 2) {
      await delay(50);
    }
  }

  return false;
}

/**
 * Attempt to turn on the hardware torch on a video track using all standard and browser-specific constraint shapes.
 */
export async function enableTorchOnTrack(track, { hasReportedCap = false, allowBlindConstraint = false } = {}) {
  if (!track || typeof track.applyConstraints !== 'function') {
    return false;
  }

  const trackHasGetCapabilities = typeof track.getCapabilities === 'function';

  // If the browser implements getCapabilities() AND reported no torch capability for this lens,
  // we only attempt blind constraint application when allowBlindConstraint is true (i.e. after
  // checking all candidate rear cameras for explicit torch capability) OR if getSettings().torch
  // explicitly flips to true.
  const constraintShapes = hasReportedCap
    ? [
        { advanced: [{ torch: true }] },
        { torch: true },
        { advanced: [{ fillLightMode: 'torch' }] },
        { advanced: [{ fillLightMode: 'flash' }] }
      ]
    : [
        { advanced: [{ torch: true }] },
        { torch: true }
      ];

  for (const constraints of constraintShapes) {
    try {
      await track.applyConstraints(constraints);
      if (typeof track.getSettings === 'function') {
        const settings = track.getSettings() || {};
        if (settings.torch === true || settings.fillLightMode === 'torch') {
          return true;
        }
        if (settings.torch === false) {
          continue;
        }
      }
      if (hasReportedCap || !trackHasGetCapabilities || allowBlindConstraint) {
        return true;
      }
    } catch (_) {
      // Try next constraint shape
    }
  }

  return false;
}

/**
 * Try opening a stream, warming it up, checking capabilities, and enabling the torch.
 */
async function tryStreamForTorch(stream, { doc, ImageCaptureClass, allowBlindConstraint = false } = {}) {
  const tracks = stream?.getVideoTracks ? stream.getVideoTracks() : [];
  const track = tracks[0];
  if (!track) {
    stopStreamTracks(stream);
    return null;
  }

  const videoEl = await warmUpVideoStream(stream, doc);

  const hasReportedCap = await probeTrackForTorch(track, ImageCaptureClass);
  const enabled = await enableTorchOnTrack(track, { hasReportedCap, allowBlindConstraint });

  if (enabled) {
    return {
      ok: true,
      track,
      stream,
      videoEl,
      deviceId: (typeof track.getSettings === 'function' && track.getSettings()?.deviceId) || track.id || null,
      label: track.label || '',
      hasReportedCap
    };
  }

  cleanupVideoElement(videoEl);
  stopStreamTracks(stream);
  return null;
}

/**
 * Helper to list ranked rear cameras from enumerateDevices().
 */
async function getRankedRearCameras(mediaDevices) {
  if (!mediaDevices || typeof mediaDevices.enumerateDevices !== 'function') {
    return [];
  }
  try {
    const allDevices = await mediaDevices.enumerateDevices();
    return rankRearCameraDevices(allDevices, new Set()).filter((candidate) => {
      const lowerLabel = (candidate.label || '').toLowerCase();
      return !/front|user|selfie|facetime|หน้า/.test(lowerLabel);
    });
  } catch (_) {
    return [];
  }
}

/**
 * Main entry point to find and activate the mobile camera LED flash/torch.
 * 1. Requests rear camera stream (or preferredDeviceId first if provided).
 * 2. Tests the initial stream if it reports torch capability (or if no other rear cameras exist).
 * 3. If the initial lens has no reported flash (e.g. Android picked Ultra-Wide or Macro lens),
 *    enumerates all videoinput devices, ranks rear cameras, and tests each candidate for
 *    explicit torch capability first, then falls back to direct constraint application.
 */
export async function acquireHardwareTorch({
  mediaDevices = typeof navigator !== 'undefined' ? navigator.mediaDevices : null,
  doc = typeof document !== 'undefined' ? document : null,
  ImageCaptureClass = typeof ImageCapture !== 'undefined' ? ImageCapture : null,
  preferredDeviceId = null
} = {}) {
  if (!mediaDevices || typeof mediaDevices.getUserMedia !== 'function') {
    return {
      ok: false,
      reason: 'unsupported-context',
      rearCameras: [],
      message: 'เบราว์เซอร์นี้ไม่รองรับการเข้าถึงแฟลชกล้อง (ต้องเปิดผ่าน HTTPS หรือใช้โหมดแสงหน้าจอแทน)'
    };
  }

  const testedDeviceIds = new Set();
  let lastError = null;

  // Step 1: Request initial rear camera stream to unlock permissions and device labels
  const initialConstraintCandidates = [];
  if (preferredDeviceId) {
    initialConstraintCandidates.push({
      video: { deviceId: { exact: preferredDeviceId } }
    });
  }
  initialConstraintCandidates.push(
    { video: { facingMode: { ideal: 'environment' } } },
    { video: { facingMode: 'environment' } },
    { video: true }
  );

  for (const constraints of initialConstraintCandidates) {
    try {
      const stream = await mediaDevices.getUserMedia(constraints);
      const firstTrack = stream.getVideoTracks?.()[0];
      const firstDeviceId =
        (firstTrack && typeof firstTrack.getSettings === 'function' && firstTrack.getSettings()?.deviceId) ||
        firstTrack?.id ||
        null;

      // First try strict capability check on the initial stream
      const session = await tryStreamForTorch(stream, {
        doc,
        ImageCaptureClass,
        allowBlindConstraint: false
      });
      if (session) {
        session.rearCameras = await getRankedRearCameras(mediaDevices);
        return session;
      }

      if (firstDeviceId) {
        testedDeviceIds.add(firstDeviceId);
      }
      break;
    } catch (err) {
      lastError = err;
      if (err && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
        return {
          ok: false,
          reason: 'permission-denied',
          rearCameras: [],
          message: 'ไม่ได้รับสิทธิ์เข้าถึงกล้อง กรุณาอนุญาตสิทธิ์กล้องเพื่อเปิดไฟแฟลชหลัง'
        };
      }
    }
  }

  const rearCameras = await getRankedRearCameras(mediaDevices);

  // Step 2: Enumerate all camera lenses and probe remaining rear cameras for explicit torch capability
  for (const candidate of rearCameras) {
    if (testedDeviceIds.has(candidate.deviceId)) continue;
    try {
      const stream = await mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: candidate.deviceId }
        }
      });
      testedDeviceIds.add(candidate.deviceId);

      const session = await tryStreamForTorch(stream, {
        doc,
        ImageCaptureClass,
        allowBlindConstraint: false
      });
      if (session) {
        session.rearCameras = rearCameras;
        return session;
      }
    } catch (err) {
      lastError = err;
    }
  }

  // Step 3: Fallback pass with allowBlindConstraint = true for devices/browsers where
  // getCapabilities() omits `torch` even though applyConstraints({ advanced: [{ torch: true }] }) works.
  // Prioritize preferredDeviceId first if specified, then ranked rear cameras.
  const blindDeviceIds = [];
  if (preferredDeviceId) {
    blindDeviceIds.push(preferredDeviceId);
  }
  for (const dev of rearCameras) {
    if (dev.deviceId && !blindDeviceIds.includes(dev.deviceId)) {
      blindDeviceIds.push(dev.deviceId);
    }
  }

  if (blindDeviceIds.length === 0) {
    try {
      const stream = await mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } } });
      const session = await tryStreamForTorch(stream, {
        doc,
        ImageCaptureClass,
        allowBlindConstraint: true
      });
      if (session) {
        session.rearCameras = rearCameras;
        return session;
      }
    } catch (_) {}
  } else {
    for (const devId of blindDeviceIds) {
      try {
        const stream = await mediaDevices.getUserMedia({
          video: { deviceId: { exact: devId } }
        });
        const session = await tryStreamForTorch(stream, {
          doc,
          ImageCaptureClass,
          allowBlindConstraint: true
        });
        if (session) {
          session.rearCameras = rearCameras;
          return session;
        }
      } catch (_) {}
    }
  }

  if (lastError && (lastError.name === 'NotReadableError' || lastError.name === 'TrackStartError')) {
    return {
      ok: false,
      reason: 'camera-busy',
      rearCameras,
      message: 'กล้องถูกใช้งานโดยแอปอื่นอยู่ กรุณาปิดแอปกล้องอื่นแล้วลองอีกครั้ง'
    };
  }

  return {
    ok: false,
    reason: 'no-torch-found',
    rearCameras,
    message: 'ใช้โหมดแสงสว่างหน้าจอแทน (เบราว์เซอร์หรือเลนส์กล้องของอุปกรณ์ไม่เปิดสิทธิ์ไฟฉาย LED)'
  };
}

/**
 * Cleanly turn off hardware torch and release camera stream + hidden video element.
 */
export async function releaseHardwareTorch(session) {
  if (!session) return;
  const track = session.track || session;

  try {
    if (track && typeof track.applyConstraints === 'function') {
      await track.applyConstraints({ advanced: [{ torch: false }] }).catch(() => {});
    }
  } catch (_) {}

  cleanupVideoElement(session.videoEl);
  stopStreamTracks(session.stream);

  try {
    if (track && typeof track.stop === 'function') {
      track.stop();
    }
  } catch (_) {}
}
