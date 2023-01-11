function getRelativePointerPosition(pe: PointerEvent, elem: HTMLElement) {
  const { left, top, width, height } = elem.getBoundingClientRect();
  const x = Math.max(0, Math.min(pe.clientX - left, width));
  const y = Math.max(0, Math.min(pe.clientY - top, height));
  const relX = x / width;
  const relY = y / height;
  return { x, y, relX, relY, width, height };
}

function setPosition(element: HTMLElement, x: number, y: number) {
  const { style } = element;
  style.transform = `translate(${x}px, ${y}px)`;
}

export { getRelativePointerPosition, setPosition };
