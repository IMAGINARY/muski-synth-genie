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
    // find the first segment we need to modify
    while (numElements + this.segments[segmentIndex].length <= x) {
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
  split(x: number): boolean {
    if (x <= 0 || x >= this.size) return false; // out of range

    const { segmentIndex, indexInSegment } = this.findSegmentIndex(x);
    if (indexInSegment === 0) return false; // a segment starts at x -> no split necessary

    const segment = this.segments[segmentIndex];
    const upper = segment.slice(indexInSegment);
    const lower = segment.slice(0, indexInSegment);
    this.segments.splice(segmentIndex, 1, lower, upper);
    this._numSegments += 1;

    return true;
  }

  /** Split segment before and after x.
   *
   * @param x
   */
  isolate(x: number): boolean {
    return this.split(x) || this.split(x + 1);
  }

  /**
   * Join segments containing indices x-1 and x.
   * @param x
   */
  join(x: number): boolean {
    if (x <= 0 || x >= this.size) return false; // out of range

    const { segmentIndex, indexInSegment } = this.findSegmentIndex(x);
    if (indexInSegment !== 0) return false; // no segment starts at x -> no join necessary

    const lower = this.segments[segmentIndex - 1];
    const upper = this.segments[segmentIndex];
    this.segments.splice(segmentIndex, 1);
    lower.push(...upper);
    this._numSegments -= 1;

    return true;
  }

  resize(size: number) {
    if (size > this.size) {
      const diff = size - this.size;
      this.segments.push(
        new Array(diff).fill(0).map(this.defaultValueCallback),
      );
      this._size = size;
    } else if (size > 0 && size < this.size) {
      this.split(size);
      const { segmentIndex } = this.findSegmentIndex(size);
      this.segments.splice(segmentIndex);
      this._size = size;
    }
  }
}
