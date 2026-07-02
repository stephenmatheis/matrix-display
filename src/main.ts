import GLYPHS from './fonts/departure-mono';
import './style.scss';

type Shape = 'circle' | 'rounded' | 'square';

type Cell = {
    color: string;
    shape: Shape;
};

type Buffer = Cell[][];

type TextProps = {
    content: string[];
    buffer: Buffer;
};

type BoxProps = {
    x: number;
    y: number;
    height: number;
    width: number;
    buffer: Buffer;
};

type SetupProps = {
    buffer: Buffer;
};

type DrawProps = {
    buffer: Buffer;
    rows: number;
    cols: number;
};

type PaintProps = {
    row: number;
    col: number;
    cell: Cell;
};

const DOT_SIZE = 8;
const GAP = 1;
const PADDING = 0;
const CANVAS_PADDING_TOP = 1;
const CANVAS_PADDING_BOTTOM = 1;
const CANVAS_PADDING_LEFT = 1;
const CANVAS_PADDING_RIGHT = 1;
const GLYPH_PADDING_LEFT = 1;
const GLYPH_PADDING_RIGHT = 1;
const GLYPH_ASCENDER_HEIGHT = 3;
const GLYPH_DESCENDER_HEIGHT = 3;
const GLYPH_BASE_HEIGHT = 8;
const GLYPH_BASE_WIDTH = 5;
const GLYPH_WIDTH = GLYPH_PADDING_LEFT + GLYPH_BASE_WIDTH + GLYPH_PADDING_RIGHT;
const GLYPH_HEIGHT = GLYPH_ASCENDER_HEIGHT + GLYPH_BASE_HEIGHT + GLYPH_DESCENDER_HEIGHT;
const GLYPH_GAP_X = 1;
const GLYPH_GAP_Y = 1;
const CELL_SIZE = DOT_SIZE + GAP;
const RADIUS = DOT_SIZE / 2;
const PIXEL_COLOR = '#000000';
const CELL_COLOR = '#d5d5d5';
const EMPTY_COLOR = '#eeeeee';
const BACKGROUND = '#ffffff';
const TEXT = [
    '─│┐┌┘└', // box drawing
    '0123456789', // numbers
    'ABCDEFGHIJKLM', // uppercase
    'NOPQRSTUVWXYZ',
    'abcdefghijklm', // lowercase
    'nopqrstuvwxyz',
    '.,:;!?·•*@#/\\', // punctuation
    '-–―_><%+="\'|$',
    '()[]{}',
];

function render(): void {
    let buffer: Buffer = [];

    buffer = Text({
        buffer,
        content: TEXT,
    });

    const x = 0;
    const y = 0;

    buffer = Box({
        buffer,
        x,
        y,
        width: 10,
        height: 10,
    });

    const { rows, cols } = setup({ buffer });

    draw({ buffer, cols, rows });

    // animation
    const STEPS = 10;
    const STEPS_PER_SECOND = 20; // speed knob: 1 = 1 step/sec, 2 = 1 step/500ms
    const INTERVAL = 1000 / STEPS_PER_SECOND;

    let startTime: number | null = null;
    let lastStep = 0;
    let frame: number;

    function animate(timestamp: number) {
        if (startTime === null) {
            startTime = timestamp;
        }

        const step = Math.floor((timestamp - startTime) / INTERVAL);

        if (step > STEPS) {
            cancelAnimationFrame(frame);

            return;
        }

        if (step !== lastStep) {
            lastStep = step;

            let buffer: Buffer = [];

            buffer = Text({
                buffer,
                content: TEXT,
            });

            buffer = Box({
                buffer,
                x: x + (step + 1),
                y: y + (step + 1),
                width: 10,
                height: 10,
            });

            const { rows, cols } = setup({ buffer });

            draw({ buffer, cols, rows });
        }

        frame = requestAnimationFrame(animate);
    }

    frame = requestAnimationFrame(animate);
}

function setup({ buffer }: SetupProps) {
    const dpr = window.devicePixelRatio || 1;
    const minRows = Math.floor(window.innerHeight / CELL_SIZE) - PADDING;
    const minCols = Math.floor(window.innerWidth / CELL_SIZE) - PADDING;
    const contentRows = buffer.length;
    const contentCols = Math.max(...buffer.map((l) => l.length));
    const cols = Math.max(minCols, contentCols);
    const rows = Math.max(minRows, contentRows);

    canvas.width = cols * CELL_SIZE * dpr;
    canvas.height = rows * CELL_SIZE * dpr;
    canvas.style.width = `${cols * CELL_SIZE}px`;
    canvas.style.height = `${rows * CELL_SIZE}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    return {
        rows,
        cols,
    };
}

function draw({ buffer, rows, cols }: DrawProps) {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            paint({
                col,
                row,
                cell: buffer[row]?.[col],
            });
        }
    }
}

function paint({ row, col, cell }: PaintProps) {
    const x = col * CELL_SIZE;
    const y = row * CELL_SIZE;
    const dotX = x + GAP / 2;
    const dotY = y + GAP / 2;

    ctx.fillStyle = BACKGROUND;
    ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);

    if (!cell) {
        ctx.fillStyle = EMPTY_COLOR;
        ctx.fillRect(dotX, dotY, DOT_SIZE, DOT_SIZE);

        return;
    }

    ctx.fillStyle = cell.color;

    switch (cell.shape) {
        case 'square':
        default:
            ctx.fillRect(dotX, dotY, DOT_SIZE, DOT_SIZE);
            break;
        case 'circle':
            ctx.beginPath();
            ctx.arc(dotX + RADIUS, dotY + RADIUS, RADIUS, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'rounded':
            ctx.beginPath();
            ctx.roundRect(dotX, dotY, DOT_SIZE, DOT_SIZE, RADIUS * 0.35);
            ctx.fill();
            break;
    }
}

function debounce(callback: (...args: any[]) => void, delay: number) {
    let timeoutId: number;

    return function (this: unknown, ...args: any[]) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
            callback.apply(this, args);
        }, delay);
    };
}

// Components

function Text({ content, buffer }: TextProps): Buffer {
    const longestLine = Math.max(...content.map((l) => l.length));
    const numberOfColumnsToRender =
        longestLine * GLYPH_WIDTH +
        CANVAS_PADDING_LEFT +
        CANVAS_PADDING_RIGHT +
        (GLYPH_GAP_X ? GLYPH_GAP_X * (longestLine - 1) : 0);
    const numberOfLinesToRender =
        GLYPH_HEIGHT * content.length +
        CANVAS_PADDING_TOP +
        CANVAS_PADDING_BOTTOM +
        (GLYPH_GAP_Y ? GLYPH_GAP_Y * (content.length - 1) : 0);

    for (let i = 0; i < numberOfLinesToRender; i++) {
        if (!buffer[i]) {
            buffer[i] = [];
        }

        for (let j = 0; j < numberOfColumnsToRender; j++) {
            buffer[i][j] = {
                color: EMPTY_COLOR,
                shape: 'square',
            };
        }
    }

    for (let l = 0; l < content.length; l++) {
        for (let i = 0; i < content[l].length; i++) {
            const letter = content[l][i];
            const glyph = GLYPHS[letter];
            const offsetX = i * (GLYPH_WIDTH + GLYPH_GAP_X) + CANVAS_PADDING_LEFT;
            const offsetY = l * (GLYPH_HEIGHT + GLYPH_GAP_Y) + CANVAS_PADDING_TOP;

            for (let row = 0; row < GLYPH_HEIGHT; row++) {
                for (let col = 0; col < GLYPH_WIDTH; col++) {
                    const bit = glyph[row][col];

                    buffer[offsetY + row][offsetX + col] = {
                        color: bit === 1 ? PIXEL_COLOR : CELL_COLOR,
                        shape: 'square',
                    };
                }
            }
        }
    }

    return buffer;
}

function Box({ x, y, height, width, buffer }: BoxProps): Buffer {
    for (let i = 0; i < height + y; i++) {
        if (!buffer[i]) {
            buffer[i] = [];
        }

        for (let j = 0; j < width + x; j++) {
            if (i >= y && j >= x) {
                if (
                    i === y || // top
                    i === y + height - 1 || // bottom
                    j == x || // left
                    j === x + width - 1 // right
                ) {
                    buffer[i][j] = {
                        color: '#ff0000',
                        shape: 'square',
                    };
                } else {
                    buffer[i][j] = {
                        color: '#ffcfcf',
                        shape: 'square',
                    };
                }
            }
        }
    }

    return buffer;
}

const canvas: HTMLCanvasElement = document.querySelector('#display')!;
const ctx = canvas.getContext('2d')!;

window.addEventListener('resize', debounce(render, 10));

render();
