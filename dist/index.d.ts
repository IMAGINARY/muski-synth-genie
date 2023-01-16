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
export type SynthGenieOptions = Record<string, unknown>;
export const defaultOptions: Readonly<SynthGenieOptions>;
type RenderingContext2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
type CellData = {
    cellX: number;
    cellY: number;
};
declare class SynthGenie {
    protected readonly _options: SynthGenieOptions;
    protected handlers: {
        addPointer: (pe: PointerEvent) => void;
        updatePointer: (pe: PointerEvent) => void;
        removePointer: (pe: PointerEvent) => void;
    };
    protected element: Element;
    protected pane: HTMLDivElement;
    protected pointers: Map<number, CellData>;
    protected canvas: HTMLCanvasElement;
    protected context: RenderingContext2D;
    protected segments: Segments<number>;
    protected numNotes: number;
    protected position: number;
    protected loopCount: number;
    protected genie: PianoGenie;
    protected gain: Tone.Gain;
    protected beatLength: number;
    protected relativeNoteLength: number;
    protected minMidiNote: number;
    protected maxMidiNote: number;
    protected allowedPianoKeys: number[];
    protected resetStateOnLoop: boolean;
    protected sustainInSegments: boolean;
    protected slideInSegments: boolean;
    protected showGrid: boolean;
    protected showBar: boolean;
    protected dotColor: string;
    protected relativeDotSize: number;
    protected lineColor: string;
    protected relativeLineWidth: number;
    protected synthOptions: ConstructorParameters<typeof Tone.AMSynth>[0];
    protected synthPool: Tone.AMSynth[];
    protected synth: Tone.AMSynth | null;
    protected timer: ReturnType<typeof setInterval> | 0;
    protected constructor(element: Element, options?: Partial<SynthGenieOptions>);
    static create(element: Element, options?: Partial<SynthGenieOptions>): Promise<SynthGenie>;
    play(): void;
    pause(): void;
    isPlaying(): boolean;
    protected playBeat(): void;
    createSynth(): Tone.AMSynth;
    releaseAndFreeSynth(synth: Tone.AMSynth, seconds: number): void;
    getGenieFrequency(cell: number): number;
    init(): Promise<void>;
    getOptions(): {
        [x: string]: unknown;
    };
    applyOptions(o: Partial<SynthGenieOptions>): void;
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
    protected updateGrid(): void;
    protected paintSegments(): void;
    protected paintGrid(): void;
    protected paintCells(): void;
    protected paintBar(): void;
}
export default SynthGenie;

//# sourceMappingURL=index.d.ts.map
