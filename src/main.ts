import { Matrix } from './lib/matrix';
import './style.scss';

const canvas: HTMLCanvasElement = document.querySelector('#display')!;

const matrix = Matrix({ canvas });

matrix.render();