/**
 * Pure view-model builder for the found-pet recap.
 *
 * Keeps the species-aware copy, count formatting, and fallbacks out of the DOM
 * so they can be tested with node:test and reused by the dialog wiring.
 */

const COPY = {
  cat: {
    title: 'เจอตัวเจ้าเหมียวแล้ว!',
    message: 'เก่งมาก! ปิดเสียงเรียกและบันทึกการค้นหาไว้แล้ว'
  },
  dog: {
    title: 'เจอตัวเจ้าตูบแล้ว!',
    message: 'เก่งมาก! ปิดเสียงเรียกและบันทึกการค้นหาไว้แล้ว'
  }
};

const PRIMARY_ACTION = 'ค้นหาอีกครั้ง';
const SECONDARY_ACTION = 'ปิด';
const EMPTY_VALUE = '—';

function safeText(value) {
  if (typeof value !== 'string') return EMPTY_VALUE;
  const trimmed = value.trim();
  return trimmed || EMPTY_VALUE;
}

function safeCount(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.trunc(number));
}

export function buildFoundRecap({
  species,
  room,
  timeLabel,
  soundTitle,
  checkedCount,
  totalCount,
  priorDetectionCount
} = {}) {
  const copy = species === 'dog' ? COPY.dog : COPY.cat;
  const total = safeCount(totalCount);
  const checked = Math.min(total, safeCount(checkedCount));
  const detections = safeCount(priorDetectionCount);

  return {
    title: copy.title,
    message: copy.message,
    roomValue: safeText(room),
    timeValue: safeText(timeLabel),
    soundValue: safeText(soundTitle),
    progressValue: `${checked}/${total} จุด`,
    detectionValue: `${detections} ครั้ง`,
    primaryAction: PRIMARY_ACTION,
    secondaryAction: SECONDARY_ACTION
  };
}
