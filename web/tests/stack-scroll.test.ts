import assert from 'node:assert/strict';
import test from 'node:test';
import { nextColumnScroll, peekColumnWidth, stackScrollState } from '../src/lib/stack-scroll.ts';

test('scroll guidance hides when columns fit, including fractional rounding', () => {
  assert.deepEqual(stackScrollState(0, 400, 500), { overflows: false, atStart: true, atEnd: true, maxScroll: 0 });
  assert.equal(stackScrollState(0, 500.5, 500).overflows, false);
  assert.equal(stackScrollState(0, 502, 500).overflows, true);
});

test('arrow boundaries follow scroll position and clamp native overscroll', () => {
  assert.deepEqual(stackScrollState(-25, 1400, 500), { overflows: true, atStart: true, atEnd: false, maxScroll: 900 });
  assert.deepEqual(stackScrollState(901, 1400, 500), { overflows: true, atStart: false, atEnd: true, maxScroll: 900 });
  assert.equal(stackScrollState(899.5, 1400, 500).atEnd, true);
  assert.equal(stackScrollState(198, 1400, 500).atStart, false);
});

test('arrows advance one column in either direction and stop at the last partial page', () => {
  const offsets = [0, 196, 392, 588, 784, 980];
  assert.equal(nextColumnScroll(0, 900, offsets, 1), 196);
  assert.equal(nextColumnScroll(196, 900, offsets, 1), 392);
  assert.equal(nextColumnScroll(392, 900, offsets, -1), 196);
  assert.equal(nextColumnScroll(784, 900, offsets, 1), 900);
  assert.equal(nextColumnScroll(900, 900, offsets, -1), 784);
  assert.equal(nextColumnScroll(900, 900, offsets, 1), 900);
  assert.equal(nextColumnScroll(0, 900, offsets, -1), 0);
});

test('manual swipes and fractional positions resume at the adjacent column', () => {
  assert.equal(nextColumnScroll(250, 900, [0, 196, 392, 588], 1), 392);
  assert.equal(nextColumnScroll(250, 900, [0, 196, 392, 588], -1), 196);
  assert.equal(nextColumnScroll(195.5, 900, [0, 196, 392, 588], 1), 392);
  assert.equal(nextColumnScroll(100, 0, [0], 1), 0);
});

test('desktop and mobile reveal at least a readable strip of the next column', () => {
  for (const [available, preferred, gap] of [[1180, 176, 20.8], [1152, 176, 20.8], [342, 154, 16], [308, 154, 16]]) {
    const width = peekColumnWidth(available, preferred, gap, 8);
    const full = Math.floor((available + gap) / (width + gap));
    const exposed = available - full * (width + gap);
    assert.ok(exposed >= 27.9, `${available}px viewport: next column exposes ${exposed}px`);
    assert.ok(exposed <= width * .75, 'The cut-off card must look meaningfully partial');
    assert.ok(width <= preferred && width >= preferred * .75);
  }
});

test('fit, empty, spacious and narrow layouts retain the normal card width', () => {
  assert.equal(peekColumnWidth(1180, 176, 20.8, 3), 176);
  assert.equal(peekColumnWidth(342, 154, 16, 2), 154);
  assert.equal(peekColumnWidth(270, 154, 16, 8), 154);
  assert.equal(peekColumnWidth(100, 154, 16, 8), 154);
  assert.equal(peekColumnWidth(342, 154, 16, 0), 154);
});
