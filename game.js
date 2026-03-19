const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const COLS = 10;
const ROWS = 20;
const CELL = 30; // pixel size of each cell

// The board: a 2D array of ROWS rows, each with COLS columns.
// 0 = empty, non-zero = filled (color string once a piece locks).
const board = Array.from({ length: ROWS }, () => new Array(COLS).fill(0));

// --- Tetrominoes ---
const PIECES = [
  { shape: [[1, 1, 1, 1]],           color: 'cyan'   }, // I
  { shape: [[1, 1], [1, 1]],         color: 'yellow' }, // O
  { shape: [[0, 1, 0], [1, 1, 1]],   color: 'purple' }, // T
  { shape: [[0, 1, 1], [1, 1, 0]],   color: 'green'  }, // S
  { shape: [[1, 1, 0], [0, 1, 1]],   color: 'red'    }, // Z
  { shape: [[1, 0, 0], [1, 1, 1]],   color: 'blue'   }, // J
  { shape: [[0, 0, 1], [1, 1, 1]],   color: 'orange' }, // L
];

// 7-bag randomizer: shuffle all 7 pieces, deal one at a time.
// When the bag is empty, refill and reshuffle.
let bag = [];

function refillBag() {
  bag = [...PIECES]; // copy the array so we don't mutate PIECES
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]]; // Fisher-Yates shuffle swap
  }
}

function nextPiece() {
  if (bag.length === 0) refillBag();
  const template = bag.pop();
  return { shape: template.shape, color: template.color, pos: { col: 3, row: 0 } };
}

let activePiece = nextPiece();

// --- Collision detection ---
// Returns true if the piece is in a valid position (in bounds, no overlap).
function isValid(piece, pos) {
  return piece.shape.every((rowCells, r) =>
    rowCells.every((cell, c) => {
      if (!cell) return true; // empty cell in the shape matrix — always fine
      const boardCol = pos.col + c;
      const boardRow = pos.row + r;
      return (
        boardCol >= 0 &&
        boardCol < COLS &&
        boardRow < ROWS &&
        !board[boardRow][boardCol] // not overlapping a locked cell
      );
    })
  );
}

// --- Locking & spawning ---
// Write the active piece into the board, then spawn a new one.
function lockPiece() {
  activePiece.shape.forEach((rowCells, r) => {
    rowCells.forEach((cell, c) => {
      if (cell) {
        board[activePiece.pos.row + r][activePiece.pos.col + c] = activePiece.color;
      }
    });
  });
  activePiece = nextPiece();
}

// --- Movement ---
function moveDown() {
  const newPos = { col: activePiece.pos.col, row: activePiece.pos.row + 1 };
  if (isValid(activePiece, newPos)) {
    activePiece.pos = newPos;
  } else {
    lockPiece(); // can't move down — lock it
  }
}

function moveLeft() {
  const newPos = { col: activePiece.pos.col - 1, row: activePiece.pos.row };
  if (isValid(activePiece, newPos)) activePiece.pos = newPos;
}

function moveRight() {
  const newPos = { col: activePiece.pos.col + 1, row: activePiece.pos.row };
  if (isValid(activePiece, newPos)) activePiece.pos = newPos;
}

// --- Keyboard input ---
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft')  moveLeft();
  if (e.key === 'ArrowRight') moveRight();
  if (e.key === 'ArrowDown')  moveDown();
});

// --- Drawing ---
function drawCell(col, row, color) {
  const x = col * CELL;
  const y = row * CELL;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, CELL, CELL);
  ctx.strokeStyle = '#333';
  ctx.strokeRect(x, y, CELL, CELL);
}

function drawBoard() {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      drawCell(col, row, board[row][col] || '#111');
    }
  }
}

function drawPiece(piece) {
  piece.shape.forEach((rowCells, r) => {
    rowCells.forEach((cell, c) => {
      if (cell) drawCell(piece.pos.col + c, piece.pos.row + r, piece.color);
    });
  });
}

function draw() {
  drawBoard();
  drawPiece(activePiece);
}

// --- Game loop ---
// requestAnimationFrame calls our loop ~60 times/sec.
// We use a timestamp to trigger gravity at a fixed interval (500ms).
let lastTime = 0;
const DROP_INTERVAL = 500; // ms between automatic drops

function loop(timestamp) {
  if (timestamp - lastTime >= DROP_INTERVAL) {
    moveDown();
    lastTime = timestamp;
  }
  draw();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
