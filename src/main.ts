import './style.css';
import { MatrixDisplay } from './matrix.ts';

const canvas = document.querySelector<HTMLCanvasElement>('#display')!;
const display = MatrixDisplay(canvas);

// Ripple animation
let animating = true;
let frame = 0;

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

// Mouse drawing — pauses animation, click+drag to paint
let painting = false;
let paintOn = false;

function dotAt(e: MouseEvent): [number, number] {
    const rect = canvas.getBoundingClientRect();
    return [
        Math.floor((e.clientX - rect.left) * display.cols / rect.width),
        Math.floor((e.clientY - rect.top) * display.rows / rect.height),
    ];
}

canvas.addEventListener('mousedown', (e) => {
    animating = false;
    painting = true;
    const [x, y] = dotAt(e);
    paintOn = !display.get(x, y);
    display.set(x, y, paintOn);
});

canvas.addEventListener('mousemove', (e) => {
    if (!painting) return;
    const [x, y] = dotAt(e);
    display.set(x, y, paintOn);
});

window.addEventListener('mouseup', () => {
    painting = false;
});

// Space — toggle animation; C — clear
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        animating = !animating;
        if (animating) runAnimation();
    }
    if (e.code === 'KeyC') {
        animating = false;
        display.clear();
    }
});

runAnimation();
