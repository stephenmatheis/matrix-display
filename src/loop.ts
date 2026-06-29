import Stats from 'stats.js';

function timestamp() {
    return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
}

type LoopParameters = {
    slow: number;
    fps: number;
    update: (step: number) => void;
    render: (dt: number) => void;
};

export function Loop({ fps, update, render }: LoopParameters) {
    var stats = new Stats();
    stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom);

    const step = 1 / fps;

    let last = timestamp();
    let dt = 0;
    let now = null;

    function frame() {
        stats.begin();

        now = timestamp();

        dt = dt + Math.min(1, (now - last) / 1000);

        while (dt > step) {
            dt = dt - step;

            update(step);
        }

        render(dt);

        last = now;

        stats.end();

        requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
}
