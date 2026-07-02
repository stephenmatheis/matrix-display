import { config } from '../config';
import type { Buffer } from '../types';

type BoxProps = {
    x: number;
    y: number;
    height: number;
    width: number;
    buffer: Buffer;
};

export function Box({ x, y, height, width, buffer }: BoxProps): Buffer {
    for (let i = 0; i < height + y; i++) {
        if (!buffer[i]) {
            buffer[i] = [];
        }

        for (let j = 0; j < width + x; j++) {
            if (i >= y && j >= x) {
                if (
                    i === y || // top
                    i === y + height - 1 || // bottom
                    j == x || // left
                    j === x + width - 1 // right
                ) {
                    buffer[i][j] = {
                        color: '#ff0000',
                        shape: config.shape,
                    };
                } else {
                    buffer[i][j] = {
                        color: '#ffcfcf',
                        shape: config.shape,
                    };
                }
            }
        }
    }

    return buffer;
}
