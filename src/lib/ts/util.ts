function getRelativePointerPosition(pe: PointerEvent, elem: HTMLElement) {
  const { left, top, width, height } = elem.getBoundingClientRect();
  const x = pe.clientX - left;
  const y = pe.clientY - top;
  const relX = x / width;
  const relY = y / height;
  return { x, y, relX, relY, width, height };
}

function getCurvePoints(
  points: { x: number; y: number }[],
  tension = 0.5,
  isClosed = false,
  numOfSegments = 16,
): { x: number; y: number }[] {
  // convert to internal format
  const pts = new Array<number>();
  points.forEach(({ x, y }) => pts.push(x, y));

  // The algorithm require a previous and next point to the actual point array.
  // Check if we will draw closed or open curve.
  // If closed, copy end points to beginning and first points to end
  // If open, duplicate first points to beginning, end points to end
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  if (isClosed) {
    pts.unshift(lastPoint.x, lastPoint.y);
    pts.unshift(lastPoint.x, lastPoint.y);
    pts.push(firstPoint.x, firstPoint.y);
  } else {
    pts.unshift(firstPoint.x, firstPoint.y); // copy 1. point and insert at beginning
    pts.push(lastPoint.x, lastPoint.y); // copy last point and append
  }

  // ok, lets start..
  const res = new Array<{ x: number; y: number }>();

  // 1. loop goes through point array
  // 2. loop goes through each segment between the 2 pts + 1e point before and after
  for (let i = 2; i < pts.length - 4; i += 2) {
    for (let t = 0; t <= numOfSegments; t += 1) {
      // calc tension vectors
      const t1x = (pts[i + 2] - pts[i - 2]) * tension;
      const t2x = (pts[i + 4] - pts[i]) * tension;

      const t1y = (pts[i + 3] - pts[i - 1]) * tension;
      const t2y = (pts[i + 5] - pts[i + 1]) * tension;

      // calc step
      const st = t / numOfSegments;

      // calc cardinals
      const c1 = 2 * st ** 3 - 3 * st ** 2 + 1;
      const c2 = -(2 * st ** 3) + 3 * st ** 2;
      const c3 = st ** 3 - 2 * st ** 2 + st;
      const c4 = st ** 3 - st ** 2;

      // calc x and y cords with common control vectors
      const x = c1 * pts[i] + c2 * pts[i + 2] + c3 * t1x + c4 * t2x;
      const y = c1 * pts[i + 1] + c2 * pts[i + 3] + c3 * t1y + c4 * t2y;

      // store points in array
      res.push({ x, y });
    }
  }

  return res;
}

export { getRelativePointerPosition, getCurvePoints };
