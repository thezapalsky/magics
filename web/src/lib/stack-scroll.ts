const EDGE_TOLERANCE = 1;

export type StackScrollState = {
  overflows: boolean;
  atStart: boolean;
  atEnd: boolean;
  maxScroll: number;
};

export function stackScrollState(left: number, scrollWidth: number, viewportWidth: number): StackScrollState {
  const maxScroll = Math.max(0, scrollWidth - viewportWidth);
  const position = Math.max(0, Math.min(left, maxScroll));
  return {
    overflows: maxScroll > EDGE_TOLERANCE,
    atStart: position <= EDGE_TOLERANCE,
    atEnd: position >= maxScroll - EDGE_TOLERANCE,
    maxScroll,
  };
}

export function nextColumnScroll(left: number, maxScroll: number, offsets: number[], direction: -1 | 1): number {
  const position = Math.max(0, Math.min(left, maxScroll));
  const next = direction === 1
    ? offsets.find(offset => offset > position + EDGE_TOLERANCE) ?? maxScroll
    : offsets.findLast(offset => offset < position - EDGE_TOLERANCE) ?? 0;
  return Math.max(0, Math.min(next, maxScroll));
}

// Keep the usual card size, shrinking slightly only when the next column would
// otherwise end at a gap or show an imperceptibly small strip.
export function peekColumnWidth(available: number, preferred: number, gap: number, count: number, peek = 28): number {
  if (count < 2 || count * preferred + (count - 1) * gap <= available) return preferred;
  let fullColumns = Math.floor((available + gap) / (preferred + gap));
  if (!fullColumns) return preferred;
  const remainder = available - (fullColumns * preferred + (fullColumns - 1) * gap);
  if (remainder >= gap + peek && remainder <= gap + preferred * .75) return preferred;
  // A nearly complete card looks like the end of the row. Fit it fully, then
  // expose the start of the following column instead.
  if (remainder > gap + preferred * .75) fullColumns += 1;
  return Math.max(preferred * .75, (available - fullColumns * gap - peek) / fullColumns);
}

export function observeStackScroll(node: HTMLDivElement, changed: (state: StackScrollState) => void) {
  let frame: number | undefined;
  const sync = () => changed(stackScrollState(node.scrollLeft, node.scrollWidth, node.clientWidth));
  const measure = () => {
    const style = getComputedStyle(node);
    const available = node.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const preferred = parseFloat(style.getPropertyValue('--stack-column-width'));
    const width = `${peekColumnWidth(available, preferred, parseFloat(style.columnGap), node.children.length)}px`;
    if (node.style.getPropertyValue('--peek-column-width') !== width) node.style.setProperty('--peek-column-width', width);
    sync();
  };
  const schedule = () => {
    if (frame !== undefined) return;
    frame = requestAnimationFrame(() => { frame = undefined; measure(); });
  };
  const resize = new ResizeObserver(schedule);
  const children = new MutationObserver(schedule);
  resize.observe(node);
  children.observe(node, { childList: true });
  node.addEventListener('scroll', sync, { passive: true });
  measure();
  return {
    destroy() {
      resize.disconnect();
      children.disconnect();
      node.removeEventListener('scroll', sync);
      if (frame !== undefined) cancelAnimationFrame(frame);
    },
  };
}
