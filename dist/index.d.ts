import { PianoGenie } from "@magenta/music";
import * as Tone from "tone";
declare class Segments<T> {
    protected segments: T[][];
    _size: number;
    protected defaultValueCallback: () => T;
    constructor(size: number, defaultValueCallback: () => T);
    get size(): number;
    get numSegments(): number;
    findSegmentIndex(x: number): {
        segmentIndex: number;
        indexInSegment: number;
    };
    get(x: number, defaultValue: T): T;
    get(x: number): T | undefined;
    set(x: number, ...values: T[]): void;
    getSegment(which: number): T[] | undefined;
    getSegmentOf(x: number): {
        segment: T[];
        indexInSegment: number;
    };
    getAllSegments(): T[][];
    /**
     * Split segments before in front of x.
     * @param x
     */
    splitBefore(x: number): number;
    splitAfter(x: number): number;
    /** Split segment before and after x.
     *
     * @param x The index of the element to put into an isolated segment.
     */
    isolate(x: number): number;
    protected join1(x: number): number;
    protected join2(x0: number, x1: number): [number, number];
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
    /**
     * Join the segment with the one in front of it.
     *
     * @param segmentIndex The index of the segment to join with its predecessor.
     */
    joinSegments(segmentIndex: number): number;
    resize(size: number): void;
}
type _SynthGenieOptions1 = {
    resetStateOnLoop: boolean;
    sustainInSegments: boolean;
    slideInSegments: boolean;
    numBeats: number;
    mute: boolean;
    volume: number;
    pause: boolean;
    beatLength: number;
    relativeNoteLength: number;
    minMidiNote: number;
    maxMidiNote: number;
    showGrid: boolean;
    showBar: boolean;
    gridColor: string;
    barColor: string;
    activeCellColor: string;
    dotColor: string;
    relativeDotSize: number;
    lineColor: string;
    relativeLineWidth: number;
};
export const defaultOptions: Readonly<_SynthGenieOptions1>;
type RenderingContext2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
type CellData = {
    cellX: number;
    cellY: number;
};
declare class SynthGenie<T extends Element> {
    protected handlers: {
        addPointer: (pe: PointerEvent) => void;
        updatePointer: (pe: PointerEvent) => void;
        removePointer: (pe: PointerEvent) => void;
    };
    readonly element: T;
    protected pane: HTMLDivElement;
    protected pointers: Map<number, CellData>;
    protected canvas: HTMLCanvasElement;
    protected context: RenderingContext2D;
    protected segments: Segments<number>;
    protected _position: number;
    protected genie: PianoGenie;
    protected _volume: number;
    protected _mute: boolean;
    protected gain: Tone.Gain;
    protected _beatLength: number;
    protected _relativeNoteLength: number;
    protected _minMidiNote: number;
    protected _maxMidiNote: number;
    protected allowedPianoKeys: number[];
    resetStateOnLoop: boolean;
    sustainInSegments: boolean;
    slideInSegments: boolean;
    protected _showGrid: boolean;
    protected _showBar: boolean;
    protected _gridColor: string;
    protected _barColor: string;
    protected _activeCellColor: string;
    protected _dotColor: string;
    protected _relativeDotSize: number;
    protected _lineColor: string;
    protected _relativeLineWidth: number;
    protected synthOptions: ConstructorParameters<typeof Tone.AMSynth>[0];
    protected synthPool: Tone.AMSynth[];
    protected synth: Tone.AMSynth | null;
    protected beatTimer: ReturnType<typeof setInterval> | 0;
    protected repaintTimer: ReturnType<typeof setTimeout> | 0;
    protected canvasTargetSize: {
        width: number;
        height: number;
    };
    protected initPromise: Promise<void> | null;
    protected constructor(element: T, checkpoint: URL, options?: Partial<_SynthGenieOptions1>);
    static create<T extends Element>(element: T, checkpoint: URL, options?: Partial<_SynthGenieOptions1>): Promise<SynthGenie<T>>;
    get numBeats(): number;
    set numBeats(b: number);
    get position(): number;
    set position(p: number);
    protected updateGain(): void;
    get mute(): boolean;
    set mute(m: boolean);
    get volume(): number;
    set volume(v: number);
    get beatLength(): number;
    set beatLength(l: number);
    get relativeNoteLength(): number;
    set relativeNoteLength(l: number);
    get minMidiNote(): number;
    set minMidiNote(n: number);
    get maxMidiNote(): number;
    set maxMidiNote(n: number);
    get showGrid(): boolean;
    set showGrid(val: boolean);
    get showBar(): boolean;
    set showBar(val: boolean);
    get gridColor(): string;
    set gridColor(c: string);
    get barColor(): string;
    set barColor(c: string);
    get activeCellColor(): string;
    set activeCellColor(c: string);
    get dotColor(): string;
    set dotColor(c: string);
    get relativeDotSize(): number;
    set relativeDotSize(s: number);
    get lineColor(): string;
    set lineColor(c: string);
    get relativeLineWidth(): number;
    set relativeLineWidth(w: number);
    get(): _SynthGenieOptions1;
    set(options: Partial<_SynthGenieOptions1>): void;
    get pause(): boolean;
    set pause(pause: boolean);
    protected playBeat(): void;
    createSynth(): Tone.AMSynth;
    releaseAndFreeSynth(synth: Tone.AMSynth, seconds: number): void;
    getGenieFrequency(cell: number): number;
    protected init(): Promise<void>;
    protected getHandlers(): {
        addPointer: (pe: PointerEvent) => void;
        updatePointer: (pe: PointerEvent) => void;
        removePointer: (pe: PointerEvent) => void;
    };
    getCellCoordinates(relX: number, relY: number): {
        cellX: number;
        cellY: number;
    };
    protected addPointer(pe: PointerEvent): void;
    protected updateAllowedPianoKeys(): void;
    protected updatePointer(pe: PointerEvent): void;
    protected connectCells(first: CellData, second: CellData): [number, number];
    protected removePointer(pe: PointerEvent): void;
    clear(): void;
    repaint(): void;
    scheduleRepaint(): void;
    protected paintSegments(): void;
    protected paintGrid(): void;
    protected paintCells(): void;
    protected paintBar(): void;
}
export default SynthGenie;
export type SynthGenieOptions = _SynthGenieOptions1;

//# sourceMappingURL=index.d.ts.map
