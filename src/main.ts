import './style.scss';

type Shape = 'circle' | 'rounded' | 'square';

const PADDING = 4;
const DOT_SIZE = 8;
const GAP = 2;
const CELL_SIZE = DOT_SIZE + GAP;
const RADIUS = DOT_SIZE / 2;
const SHAPE: Shape = 'square';
const ON_COLOR = '#000000';
const OFF_COLOR = '#ffffff';
const BACKGROUND = '#ffffff';

const canvas: HTMLCanvasElement = document.querySelector('#display')!;
const ctx = canvas.getContext('2d')!;

let cols = 0;
let rows = 0;

window.addEventListener('resize', resize);

resize();

function resize(): void {
    const dpr = window.devicePixelRatio || 1;

    cols = Math.floor(window.innerWidth / CELL_SIZE) - PADDING;
    rows = Math.floor(window.innerHeight / CELL_SIZE) - PADDING;

    canvas.width = cols * CELL_SIZE * dpr;
    canvas.height = rows * CELL_SIZE * dpr;
    canvas.style.width = `${cols * CELL_SIZE}px`;
    canvas.style.height = `${rows * CELL_SIZE}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            paint(col, row, true);
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

        return;
    }

    if (SHAPE === 'rounded') {
        ctx.beginPath();
        ctx.roundRect(dotX, dotY, DOT_SIZE, DOT_SIZE, RADIUS * 0.35);
        ctx.fill();

        return;
    }
}
