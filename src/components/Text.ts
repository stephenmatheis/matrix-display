import GLYPHS from '../fonts/departure-mono';
import { config, getGlyphWidth, getGlyphHeight } from '../config';
import type { Buffer } from '../types';

type TextProps = {
    content: string[];
    buffer: Buffer;
};

export function Text({ content, buffer }: TextProps): Buffer {
    const glyphWidth = getGlyphWidth();
    const glyphHeight = getGlyphHeight();
    const longestLine = Math.max(...content.map((l) => l.length));
    const numberOfColumnsToRender =
        longestLine * glyphWidth +
        config.canvasPaddingLeft +
        config.canvasPaddingRight +
        (config.glyphGapX ? config.glyphGapX * (longestLine - 1) : 0);
    const numberOfLinesToRender =
        glyphHeight * content.length +
        config.canvasPaddingTop +
        config.canvasPaddingBottom +
        (config.glyphGapY ? config.glyphGapY * (content.length - 1) : 0);

    for (let i = 0; i < numberOfLinesToRender; i++) {
        if (!buffer[i]) {
            buffer[i] = [];
        }

        for (let j = 0; j < numberOfColumnsToRender; j++) {
            buffer[i][j] = {
                color: config.emptyColor,
                shape: config.shape,
            };
        }
    }

    for (let l = 0; l < content.length; l++) {
        for (let i = 0; i < content[l].length; i++) {
            const letter = content[l][i];
            const glyph = GLYPHS[letter];
            const offsetX = i * (glyphWidth + config.glyphGapX) + config.canvasPaddingLeft;
            const offsetY = l * (glyphHeight + config.glyphGapY) + config.canvasPaddingTop;

            for (let row = 0; row < glyphHeight; row++) {
                for (let col = 0; col < glyphWidth; col++) {
                    const bit = glyph[row][col];

                    buffer[offsetY + row][offsetX + col] = {
                        color: bit === 1 ? config.pixelColor : config.cellColor,
                        shape: config.shape,
                    };
                }
            }
        }
    }

    return buffer;
}
