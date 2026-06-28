import { MatrixDisplay } from './matrix.ts';
import './style.scss';

const canvas = document.querySelector<HTMLCanvasElement>('#display')!;
const display = MatrixDisplay({ canvas, shape: 'square', dotSize: 8, gap: 2 });

let frame = 0;
let animating = false;
let painting = false;
let paintOn = false;

function runAnimation(): void {
    if (!animating) return;

    const t = frame++ * 0.04;

    display.fill((col, row) => {
        const x = (col / display.cols - 0.5) * 2;
        const y = (row / display.rows - 0.5) * 2;
        const d = Math.sqrt(x * x + y * y);

        return Math.sin(d * 14 - t) > 0;
    });

    requestAnimationFrame(runAnimation);
}

function dotAt(e: MouseEvent): [number, number] {
    const rect = canvas.getBoundingClientRect();

    return [
        Math.floor(((e.clientX - rect.left) * display.cols) / rect.width),
        Math.floor(((e.clientY - rect.top) * display.rows) / rect.height),
    ];
}

canvas.addEventListener('mousedown', (event) => {
    animating = false;
    painting = true;

    const [x, y] = dotAt(event);

    paintOn = !display.get(x, y);

    display.set(x, y, paintOn);
});

canvas.addEventListener('mousemove', (event) => {
    if (!painting) return;

    const [x, y] = dotAt(event);

    display.set(x, y, paintOn);
});

window.addEventListener('mouseup', () => {
    painting = false;
});

window.addEventListener('keydown', (event) => {
    if (event.key === ' ') {
        event.preventDefault();

        animating = !animating;

        if (animating) {
            runAnimation();
        }
    }

    if (event.key.toLowerCase() === 'c') {
        animating = false;

        display.clear();
    }
});

runAnimation();
