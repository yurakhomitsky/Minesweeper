import { createBoard } from './minesweeper.js';

// Const
const BOARD_SIZE = 10;
const NUMBER_OF_MINES = 10;

// Dom elements
const app = document.querySelector('#app');

createBoard(app, BOARD_SIZE, NUMBER_OF_MINES);
