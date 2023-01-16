export default class Segments<T> {
  protected segments: T[][];

  public _size: number;

  public _numSegments: number;

  protected defaultValueCallback: () => T;

  constructor(size: number, defaultValueCallback: () => T) {
    this.segments = [new Array(size).fill(undefined).map(defaultValueCallback)];
    this._size = size;
    this._numSegments = 1;
    this.defaultValueCallback = defaultValueCallback;
  }

  get size() {
    return this._size;
  }

  get numSegments() {
    return this._numSegments;
  }

  findSegmentIndex(x: number): {
    segmentIndex: number;
    indexInSegment: number;
  } {
    let numElements = 0;
    let segmentIndex = 0;
    while (
      segmentIndex < this.segments.length &&
      numElements + this.segments[segmentIndex].length <= x
    ) {
      numElements += this.segments[segmentIndex].length;
      segmentIndex += 1;
    }
    const indexInSegment = x - numElements;
    return { segmentIndex, indexInSegment };
  }

  get(x: number, defaultValue: T): T;
  get(x: number): T | undefined;
  get(x: number, defaultValue?: T): T | undefined {
    if (x < 0 || x >= this.size) return defaultValue ?? undefined; // out of range
    const { segmentIndex, indexInSegment } = this.findSegmentIndex(x);
    return this.segments[segmentIndex][indexInSegment];
  }

  set(x: number, ...values: T[]) {
    if (x < 0 || x >= this.size) return; // out of range
    let { segmentIndex, indexInSegment } = this.findSegmentIndex(x);
    for (let i = 0; i < values.length; i += 1) {
      this.segments[segmentIndex][indexInSegment] = values[i];
      indexInSegment += 1;
      if (indexInSegment >= this.segments[segmentIndex].length) {
        segmentIndex += 1;
        indexInSegment = 0;
      }
      if (segmentIndex > this.segments.length) break;
    }
  }

  getSegment(which: number): T[] | undefined {
    return this.segments[which];
  }

  getSegmentOf(x: number): { segment: T[]; indexInSegment: number } {
    const { segmentIndex, indexInSegment } = this.findSegmentIndex(x);
    return { segment: [...this.segments[segmentIndex]], indexInSegment };
  }

  getAllSegments() {
    return this.segments.map((s) => [...s]);
  }

  /**
   * Split segments before in front of x.
   * @param x
   */
  splitBefore(x: number): number {
    if (x < 0 || x >= this.size) return -1; // out of range

    if (x === 0) return 0;

    const { segmentIndex, indexInSegment } = this.findSegmentIndex(x);
    if (indexInSegment === 0) {
      // a segment starts at x -> no split necessary
      return segmentIndex;
    }

    const segment = this.segments[segmentIndex];
    const upper = segment.slice(indexInSegment);
    const lower = segment.slice(0, indexInSegment);
    this.segments.splice(segmentIndex, 1, lower, upper);
    this._numSegments += 1;

    return segmentIndex + 1;
  }

  splitAfter(x: number): number {
    if (x < 0 || x >= this.size) return -1; // out of range

    if (x === this.size - 1) return this.size - 1;

    return this.splitBefore(x + 1) + 1;
  }

  /** Split segment before and after x.
   *
   * @param x The index of the element to put into an isolated segment.
   */
  isolate(x: number): number {
    this.splitAfter(x);
    return this.splitBefore(x);
  }

  protected join1(x: number): number {
    if (x <= 0 || x >= this.size) return -1; // out of range

    const { segmentIndex, indexInSegment } = this.findSegmentIndex(x);
    if (indexInSegment !== 0) this.joinSegments(segmentIndex);

    return segmentIndex;
  }

  protected join2(x0: number, x1: number): [number, number] {
    if (x0 > x1) {
      const [segmentIndex1, segmentIndex0] = this.join2(x1, x0);
      return [segmentIndex0, segmentIndex1];
    }

    if (x1 < 0 || x0 >= this.size) return [-1, -1];

    const clampedX0 = Math.min(this.size - 1, Math.max(x0, 0));
    const clampedX1 = Math.min(this.size - 1, Math.max(x1, 0));

    const { segmentIndex: segmentIndex0 } = this.findSegmentIndex(clampedX0);
    const { segmentIndex: segmentIndex1 } = this.findSegmentIndex(clampedX1);

    for (let i = 0; i < segmentIndex1 - segmentIndex0; i += 1) {
      this.joinSegments(segmentIndex0 + 1);
    }

    return [x0 < 0 ? -1 : segmentIndex0, x1 >= this.size ? -1 : segmentIndex1];
  }

  /**
   * Join segments containing indices x-1 and x.
   *
   * @param x The index of the element to join with the element in front of it.
   */
  join(x: number): number;
  /**
   * Join all segments inbetween x0 and x1 (inclusive).
   * @param x0 The index of the element in the first element.
   * @param x1 The index of the element in the second element.
   */
  join(x0: number, x1: number): [number, number];
  join(x0: number, x1?: number): number | [number, number] {
    return typeof x1 === 'undefined' ? this.join1(x0) : this.join2(x0, x1);
  }

  /**
   * Join the segment with the one in front of it.
   *
   * @param segmentIndex The index of the segment to join with its predecessor.
   */
  joinSegments(segmentIndex: number): number {
    if (segmentIndex <= 0 || segmentIndex >= this.numSegments) return -1;

    const lower = this.segments[segmentIndex - 1];
    const upper = this.segments[segmentIndex];
    this.segments.splice(segmentIndex, 1);
    lower.push(...upper);
    this._numSegments -= 1;

    return segmentIndex - 1;
  }

  resize(size: number) {
    if (size > this.size) {
      const diff = size - this.size;
      this.segments.push(
        new Array(diff).fill(0).map(this.defaultValueCallback),
      );
      this._size = size;
    } else if (size > 0 && size < this.size) {
      this.splitBefore(size);
      const { segmentIndex } = this.findSegmentIndex(size);
      this.segments.splice(segmentIndex);
      this._size = size;
    }
  }
}
