export type Shape = 'circle' | 'rounded' | 'square';

export type Cell = {
    color: string;
    shape: Shape;
};

export type Buffer = Cell[][];
