const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const COLS = 10;
const ROWS = 20;
const CELL = 30; // pixel size of each cell

// The board: a 2D array of ROWS rows, each with COLS columns.
// 0 = empty, non-zero = filled (we'll use color values later).
const board = Array.from({ length: ROWS }, () => new Array(COLS).fill(0));

function drawBoard() {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (board[row][col]) {
        ctx.fillStyle = 'cyan';
        ctx.fillRect(col * CELL, row * CELL, CELL, CELL);
      } else {
        ctx.fillStyle = '#111';
        ctx.fillRect(col * CELL, row * CELL, CELL, CELL);
      }

      // Draw grid lines
      ctx.strokeStyle = '#333';
      ctx.strokeRect(col * CELL, row * CELL, CELL, CELL);
    }
  }
}

drawBoard();
