import { Text } from '../components/Text';
import { Box } from '../components/Box';
import { config, getCellSize, getInterval, getRadius } from '../config';
import type { Buffer, Cell } from '../types';

type SetupOptions = {
    buffer: Buffer;
};

type DrawOptions = {
    buffer: Buffer;
    rows: number;
    cols: number;
};

type PaintOptions = {
    row: number;
    col: number;
    cell: Cell;
};

type AnimateOptions = {
    x: number;
    y: number;
}

type MatrixOptions = {
    canvas: HTMLCanvasElement;
}

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

export function Matrix({ canvas }: MatrixOptions) {

    if (!canvas) {
        throw new Error('Missing HTMLCanvasElement in MatrixOptions.');
    }

    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error("Couldn't get 2d context from canvas value.");
    }

    let frame: number;

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

        animate({ x, y });
    }

    function animate({ x, y }: AnimateOptions) {
        let startTime: number | null = null;
        let lastStep = 0;


        function animate(timestamp: number) {
            if (startTime === null) {
                startTime = timestamp;
            }

            const step = Math.floor((timestamp - startTime) / getInterval());

            if (step > config.steps) {
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

    function setup({ buffer }: SetupOptions) {
        if (!ctx) {
            throw new Error('Missing HTMLCanvasElement 2d context.');
        }

        const dpr = window.devicePixelRatio || 1;
        const cellSize = getCellSize();
        const minRows = Math.floor(window.innerHeight / cellSize) - config.padding;
        const minCols = Math.floor(window.innerWidth / cellSize) - config.padding;
        const contentRows = buffer.length;
        const contentCols = Math.max(...buffer.map((l) => l.length));
        const cols = Math.max(minCols, contentCols);
        const rows = Math.max(minRows, contentRows);

        canvas.width = cols * cellSize * dpr;
        canvas.height = rows * cellSize * dpr;
        canvas.style.width = `${cols * cellSize}px`;
        canvas.style.height = `${rows * cellSize}px`;



        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        return {
            rows,
            cols,
        };
    }

    function draw({ buffer, rows, cols }: DrawOptions) {
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

    function paint({ row, col, cell }: PaintOptions) {
        if (!ctx) {
            throw new Error('Missing HTMLCanvasElement 2d context.');
        }

        const cellSize = getCellSize();
        const radius = getRadius();
        const x = col * cellSize;
        const y = row * cellSize;
        const dotX = x + config.gap / 2;
        const dotY = y + config.gap / 2;

        ctx.fillStyle = config.background;
        ctx.fillRect(x, y, cellSize, cellSize);

        if (!cell) {
            ctx.fillStyle = config.emptyColor;

            switch (config.shape) {
                case 'square':
                default:
                    ctx.fillRect(dotX, dotY, config.dotSize, config.dotSize);
                    break;
                case 'circle':
                    ctx.beginPath();
                    ctx.arc(dotX + radius, dotY + radius, radius, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case 'rounded':
                    ctx.beginPath();
                    ctx.roundRect(dotX, dotY, config.dotSize, config.dotSize, radius * 0.35);
                    ctx.fill();
                    break;
            }

            return;
        }

        ctx.fillStyle = cell.color;

        switch (cell.shape) {
            case 'square':
            default:
                ctx.fillRect(dotX, dotY, config.dotSize, config.dotSize);
                break;
            case 'circle':
                ctx.beginPath();
                ctx.arc(dotX + radius, dotY + radius, radius, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'rounded':
                ctx.beginPath();
                ctx.roundRect(dotX, dotY, config.dotSize, config.dotSize, radius * 0.35);
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

    const resize = debounce(render, 10);

    return {
        render() {
            window.addEventListener('resize', resize);

            render();
        },
        destroy() {
            window.removeEventListener('resize', resize);

            if (frame) {
                cancelAnimationFrame(frame);
            }
        }
    };
}
