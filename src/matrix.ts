export type Shape = 'circle' | 'square' | 'rounded';

export type MatrixOptions = {
    canvas: HTMLCanvasElement;
    dotSize?: number;
    gap?: number;
    shape?: Shape;
    onColor?: string;
    offColor?: string;
    background?: string;
    onResize?: (cols: number, rows: number) => void;
};

export function MatrixDisplay(options: MatrixOptions) {
    const canvas = options.canvas;
    const dotSize = options.dotSize ?? 12;
    const gap = options.gap ?? 4;
    const shape = options.shape ?? 'circle';
    const onColor = options.onColor ?? '#000000';
    const offColor = options.offColor ?? '#ffffff';
    const bg = options.background ?? '#ffffff';
    const cellSize = dotSize + gap;
    const radius = dotSize / 2;
    const ctx = canvas.getContext('2d')!;

    let cols = 0;
    let rows = 0;
    let dots: boolean[][] = [];
    let prevDots: boolean[][] = [];
    let allDirty = true;
    let rafId: number | null = null;

    function resize(): void {
        const dpr = window.devicePixelRatio || 1;

        cols = Math.floor(window.innerWidth / cellSize);
        rows = Math.floor(window.innerHeight / cellSize);

        canvas.width = cols * cellSize * dpr;
        canvas.height = rows * cellSize * dpr;
        canvas.style.width = `${cols * cellSize}px`;
        canvas.style.height = `${rows * cellSize}px`;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        dots = Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => dots[r]?.[c] ?? false));
        prevDots = Array.from({ length: rows }, () => new Array<boolean>(cols).fill(false));
        allDirty = true;

        options.onResize?.(cols, rows);

        scheduleRender();
    }

    function paintDot(col: number, row: number, on: boolean): void {
        const x = col * cellSize;
        const y = row * cellSize;
        const dotX = x + gap / 2;
        const dotY = y + gap / 2;

        // Fill cell area (covers the gap between dots)
        ctx.fillStyle = bg;
        ctx.fillRect(x, y, cellSize, cellSize);
        ctx.fillStyle = on ? onColor : offColor;

        if (shape === 'circle') {
            ctx.beginPath();
            ctx.arc(dotX + radius, dotY + radius, radius, 0, Math.PI * 2);
            ctx.fill();
        } else if (shape === 'rounded') {
            ctx.beginPath();
            ctx.roundRect(dotX, dotY, dotSize, dotSize, radius * 0.35);
            ctx.fill();
        } else {
            ctx.fillRect(dotX, dotY, dotSize, dotSize);
        }
    }

    function flush(): void {
        rafId = null;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const on = dots[r][c];

                if (allDirty || on !== prevDots[r][c]) {
                    paintDot(c, r, on);

                    prevDots[r][c] = on;
                }
            }
        }

        allDirty = false;
    }

    function scheduleRender(): void {
        if (rafId !== null) return;

        rafId = requestAnimationFrame(flush);
    }

    window.addEventListener('resize', resize);

    resize();

    return {
        get cols(): number {
            return cols;
        },
        get rows(): number {
            return rows;
        },

        get(x: number, y: number): boolean {
            if (x < 0 || x >= cols || y < 0 || y >= rows) return false;

            return dots[y][x];
        },

        set(x: number, y: number, on: boolean): void {
            if (x < 0 || x >= cols || y < 0 || y >= rows) return;

            dots[y][x] = on;

            scheduleRender();
        },

        toggle(x: number, y: number): void {
            if (x < 0 || x >= cols || y < 0 || y >= rows) return;

            dots[y][x] = !dots[y][x];

            scheduleRender();
        },
        fill(arg: boolean[][] | ((col: number, row: number) => boolean)): void {
            if (typeof arg === 'function') {
                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        dots[r][c] = arg(c, r);
                    }
                }
            } else {
                for (let r = 0; r < Math.min(arg.length, rows); r++) {
                    for (let c = 0; c < Math.min(arg[r].length, cols); c++) {
                        dots[r][c] = arg[r][c];
                    }
                }
            }

            scheduleRender();
        },

        clear(): void {
            for (let r = 0; r < rows; r++) {
                dots[r].fill(false);
            }

            scheduleRender();
        },

        destroy(): void {
            window.removeEventListener('resize', resize);

            if (rafId !== null) {
                cancelAnimationFrame(rafId);
            }
        },
    };
}
