import './style.scss';

type Shape = 'circle' | 'rounded' | 'square';

const PADDING = 2;
const DOT_SIZE = 12;
const GAP = 2;
const CELL_SIZE = DOT_SIZE + GAP;
const RADIUS = DOT_SIZE / 2;
const SHAPE: Shape = 'square';
const ON_COLOR = '#000000';
const OFF_COLOR = '#ffffff';
const BACKGROUND = '#ffffff';

const GLYPHS: Record<string, number[][]> = {
    A: [
        [1, 1, 1],
        [1, 0, 1],
        [1, 1, 1],
        [1, 0, 1],
        [1, 0, 1],
    ],
    D: [
        [1, 1, 0],
        [1, 0, 1],
        [1, 0, 1],
        [1, 0, 1],
        [1, 1, 1],
    ],
    E: [
        [1, 1, 1],
        [1, 0, 0],
        [1, 1, 1],
        [1, 0, 0],
        [1, 1, 1],
    ],
    H: [
        [1, 0, 1],
        [1, 0, 1],
        [1, 1, 1],
        [1, 0, 1],
        [1, 0, 1],
    ],
    L: [
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 1, 1],
    ],
    O: [
        [1, 1, 1],
        [1, 0, 1],
        [1, 0, 1],
        [1, 0, 1],
        [1, 1, 1],
    ],
    R: [
        [1, 1, 1],
        [1, 0, 1],
        [1, 1, 0],
        [1, 0, 1],
        [1, 0, 1],
    ],
    W: [
        [1, 0, 1],
        [1, 0, 1],
        [1, 0, 1],
        [1, 1, 1],
        [1, 0, 1],
    ],
    '.': [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
        [0, 1, 0],
    ],
    ',': [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
        [0, 1, 0],
        [0, 1, 0],
    ],
    ' ': [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
    ],
};

const GLYPH_WIDTH = 3;
const GLYPH_HEIGHT = 5;
const GLYPH_GAP_X = 1;
const GLYPH_GAP_Y = 1;
const TEXT = 'HELLO, WORLD.';

const canvas: HTMLCanvasElement = document.querySelector('#display')!;
const ctx = canvas.getContext('2d')!;

const dots: boolean[][] = [];

let cols = 0;
let rows = 0;

window.addEventListener('resize', debounce(render, 10));

render();

function buildBuffer(): boolean[][] {
    const buffer: boolean[][] = [];

    for (let i = 0; i < GLYPH_HEIGHT; i++) {
        buffer[i] = [];

        for (let j = 0; j < TEXT.length * (GLYPH_WIDTH + 1); j++) {
            buffer[i][j] = false;
        }
    }

    for (let i = 0; i < TEXT.length; i++) {
        const letter = TEXT[i];
        const glyph = GLYPHS[letter];
        const offsetX = i * (GLYPH_WIDTH + GLYPH_GAP_X);

        for (let row = 0; row < GLYPH_HEIGHT; row++) {
            for (let col = 0; col < GLYPH_WIDTH; col++) {
                buffer[row][offsetX + col] = glyph[row][col] === 1;
            }
        }
    }

    return buffer;
}

function render(): void {
    const buffer = buildBuffer();

    const dpr = window.devicePixelRatio || 1;

    cols = Math.floor(window.innerWidth / CELL_SIZE) - PADDING;
    rows = Math.floor(window.innerHeight / CELL_SIZE) - PADDING;

    canvas.width = cols * CELL_SIZE * dpr;
    canvas.height = rows * CELL_SIZE * dpr;
    canvas.style.width = `${cols * CELL_SIZE}px`;
    canvas.style.height = `${rows * CELL_SIZE}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    for (let row = 0; row < rows; row++) {
        dots[row] = [];

        for (let col = 0; col < cols; col++) {
            dots[row][col] = buffer[row]?.[col] === true;
        }
    }

    draw();
}

function draw() {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            paint(col, row, dots[row][col]);
        }
    }
}

function paint(col: number, row: number, on: boolean): void {
    const x = col * CELL_SIZE;
    const y = row * CELL_SIZE;
    const dotX = x + GAP / 2;
    const dotY = y + GAP / 2;

    ctx.fillStyle = BACKGROUND;
    ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
    ctx.fillStyle = on ? ON_COLOR : OFF_COLOR;

    if (SHAPE === 'square') {
        ctx.fillRect(dotX, dotY, DOT_SIZE, DOT_SIZE);

        return;
    }

    if (SHAPE === 'circle') {
        ctx.beginPath();
        ctx.arc(dotX + RADIUS, dotY + RADIUS, RADIUS, 0, Math.PI * 2);
        ctx.fill();
        x;

        return;
    }

    if (SHAPE === 'rounded') {
        ctx.beginPath();
        ctx.roundRect(dotX, dotY, DOT_SIZE, DOT_SIZE, RADIUS * 0.35);
        ctx.fill();

        return;
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
