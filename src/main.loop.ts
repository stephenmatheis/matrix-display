import Stats from 'stats.js';
import './style.scss';

type Shape = 'circle' | 'rounded' | 'square';

const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

const canvas: HTMLCanvasElement = document.querySelector('#display')!;
const dotSize = 8;
const gap = 2;
const cellSize = dotSize + gap;
const radius = dotSize / 2;
const shape: Shape = 'square';
const onColor = '#000000';
const offColor = '#ffffff';
const bg = '#ffffff';
const ctx = canvas.getContext('2d')!;

let cols = 0;
let rows = 0;
let dots: boolean[][] = [];
let now = null;
let dt = 0;
let step = 1;
let last = timestamp();

window.addEventListener('resize', resize);

resize();

requestAnimationFrame(frame);

// function frame() {
//     stats.begin();

//     update();
//     render();

//     stats.end();

//     requestAnimationFrame(frame);
// }

function frame() {
    stats.begin();

    now = timestamp();

    dt = dt + Math.min(1, (now - last) / 1000);

    while (dt > step) {
        dt = dt - step;

        update();
    }

    render();

    last = now;

    stats.end();

    requestAnimationFrame(frame);
}

function timestamp() {
    return window.performance.now();
}

function update() {
    // for (let row = 0; row < rows; row++) {
    //     for (let col = 0; col < cols; col++) {
    //         // console.log(row, col);
    //         dots[row][col] = true;
    //     }
    // }
}

function render() {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            paint(col, row, dots[row][col]);
        }
    }
}

function paint(col: number, row: number, on: boolean): void {
    const x = col * cellSize;
    const y = row * cellSize;
    const dotX = x + gap / 2;
    const dotY = y + gap / 2;

    ctx.fillStyle = bg;
    ctx.fillRect(x, y, cellSize, cellSize);
    ctx.fillStyle = on ? onColor : offColor;

    if (shape === 'square') {
        ctx.fillRect(dotX, dotY, dotSize, dotSize);

        return;
    }

    if (shape === 'circle') {
        ctx.beginPath();
        ctx.arc(dotX + radius, dotY + radius, radius, 0, Math.PI * 2);
        ctx.fill();

        return;
    }

    if (shape === 'rounded') {
        ctx.beginPath();
        ctx.roundRect(dotX, dotY, dotSize, dotSize, radius * 0.35);
        ctx.fill();

        return;
    }
}

function resize(): void {
    const dpr = window.devicePixelRatio || 1;

    cols = Math.floor(window.innerWidth / cellSize);
    rows = Math.floor(window.innerHeight / cellSize);

    canvas.width = cols * cellSize * dpr;
    canvas.height = rows * cellSize * dpr;
    canvas.style.width = `${cols * cellSize}px`;
    canvas.style.height = `${rows * cellSize}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    dots = Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => dots[r]?.[c] ?? true));
}
