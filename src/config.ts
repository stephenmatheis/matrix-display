import type { Shape } from './types';

export const config = {
    dotSize: 8,
    gap: 1,
    padding: 0,
    canvasPaddingTop: 1,
    canvasPaddingBottom: 1,
    canvasPaddingLeft: 1,
    canvasPaddingRight: 1,
    glyphPaddingLeft: 1,
    glyphPaddingRight: 1,
    glyphAscenderHeight: 3,
    glyphDescenderHeight: 3,
    glyphBaseHeight: 8,
    glyphBaseWidth: 5,
    glyphGapX: 1,
    glyphGapY: 1,
    steps: 10,
    stepsPerSecond: 20,
    shape: 'circle' as Shape,
    pixelColor: '#000000',
    cellColor: '#d5d5d5',
    emptyColor: '#eeeeee',
    background: '#ffffff',
};

export function getGlyphWidth(): number {
    return config.glyphPaddingLeft + config.glyphBaseWidth + config.glyphPaddingRight;
}

export function getGlyphHeight(): number {
    return config.glyphAscenderHeight + config.glyphBaseHeight + config.glyphDescenderHeight;
}

export function getCellSize(): number {
    return config.dotSize + config.gap;
}

export function getRadius(): number {
    return config.dotSize / 2;
}

export function getInterval(): number {
    return 1000 / config.stepsPerSecond;
}

