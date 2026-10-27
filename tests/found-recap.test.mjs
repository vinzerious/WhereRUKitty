import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buildFoundRecap } from '../found-recap.js';

const CAT_ARGS = {
  species: 'cat',
  room: 'ห้องนอน / ใต้เตียง',
  timeLabel: '22:45',
  soundTitle: 'แม่แมวเรียกหาลูก',
  checkedCount: 2,
  totalCount: 8,
  priorDetectionCount: 1
};

const CAT_EXPECTED = {
  title: 'เจอตัวเจ้าเหมียวแล้ว!',
  message: 'เก่งมาก! ปิดเสียงเรียกและบันทึกการค้นหาไว้แล้ว',
  roomValue: 'ห้องนอน / ใต้เตียง',
  timeValue: '22:45',
  soundValue: 'แม่แมวเรียกหาลูก',
  progressValue: '2/8 จุด',
  detectionValue: '1 ครั้ง',
  primaryAction: 'ค้นหาอีกครั้ง',
  secondaryAction: 'ปิด'
};

test('builds the cat recap values and copy', () => {
  assert.deepEqual(buildFoundRecap(CAT_ARGS), CAT_EXPECTED);
});

test('uses the dog title while keeping the shared message', () => {
  const recap = buildFoundRecap({ ...CAT_ARGS, species: 'dog' });
  assert.equal(recap.title, 'เจอตัวเจ้าตูบแล้ว!');
  assert.equal(recap.message, CAT_EXPECTED.message);
  assert.equal(recap.progressValue, '2/8 จุด');
});

test('formats counts, allows zero, and clamps checked to total', () => {
  const empty = buildFoundRecap({
    ...CAT_ARGS,
    checkedCount: 0,
    totalCount: 8,
    priorDetectionCount: 0
  });
  assert.equal(empty.progressValue, '0/8 จุด');
  assert.equal(empty.detectionValue, '0 ครั้ง');

  const oversized = buildFoundRecap({
    ...CAT_ARGS,
    checkedCount: 99,
    totalCount: 8,
    priorDetectionCount: 12
  });
  assert.equal(oversized.progressValue, '8/8 จุด');
  assert.equal(oversized.detectionValue, '12 ครั้ง');
});

test('truncates decimals and clamps negatives', () => {
  const recap = buildFoundRecap({
    ...CAT_ARGS,
    checkedCount: 3.9,
    totalCount: 8.9,
    priorDetectionCount: 2.7
  });
  assert.equal(recap.progressValue, '3/8 จุด');
  assert.equal(recap.detectionValue, '2 ครั้ง');

  const negative = buildFoundRecap({
    ...CAT_ARGS,
    checkedCount: -4,
    totalCount: -8,
    priorDetectionCount: -1
  });
  assert.equal(negative.progressValue, '0/0 จุด');
  assert.equal(negative.detectionValue, '0 ครั้ง');
});

test('falls back to an em dash for empty or missing text', () => {
  const recap = buildFoundRecap({
    species: 'cat',
    room: '   ',
    timeLabel: '',
    soundTitle: null,
    checkedCount: 0,
    totalCount: 0,
    priorDetectionCount: 0
  });
  assert.equal(recap.roomValue, '—');
  assert.equal(recap.timeValue, '—');
  assert.equal(recap.soundValue, '—');
  assert.equal(recap.progressValue, '0/0 จุด');
  assert.equal(recap.detectionValue, '0 ครั้ง');
});

test('unknown species falls back to the cat copy', () => {
  const recap = buildFoundRecap({ ...CAT_ARGS, species: 'bird' });
  assert.equal(recap.title, CAT_EXPECTED.title);
  assert.equal(recap.message, CAT_EXPECTED.message);
});

test('returns the fixed action labels', () => {
  const recap = buildFoundRecap(CAT_ARGS);
  assert.equal(recap.primaryAction, 'ค้นหาอีกครั้ง');
  assert.equal(recap.secondaryAction, 'ปิด');
});
