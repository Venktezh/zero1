(function() {
const root = document.getElementById('minesweeper-tab');
root.innerHTML = `
    <h2 class="center" style="margin-top:0em; color:var(--primary);">Minesweeper</h2>
    <div id="mine-container">
        <div id="game-options" style="text-align:center;margin-bottom:1.2em;">
            <span>Level: Easy (9x9, 10 mines)</span>
            <button class="btn" id="mineNewBtn">New Game</button>
            <span id="mine-count"></span>
        </div>
        <div id="board-wrap">
            <div class="board" id="board"></div>
        </div>
        <div id="status" class="center"></div>
    </div>
`;
const rows = 9, cols = 9, mines = 10;
let board = [], revealed = [], flagged = [];
let gameOver = false, started = false, minesLeft = mines;
let explodedCell = null;
function newGame() {
    board = Array.from({length: rows}, () => Array(cols).fill(0));
    revealed = Array.from({length: rows}, () => Array(cols).fill(false));
    flagged = Array.from({length: rows}, () => Array(cols).fill(false));
    gameOver = false;
    started = false;
    minesLeft = mines;
    explodedCell = null;
    document.getElementById('status').innerHTML = '';
    document.getElementById('mine-count').textContent = `💣 ${minesLeft}`;
    drawBoard();
}
function drawBoard() {
    const boardDiv = document.getElementById('board');
    boardDiv.innerHTML = '';
    for(let r=0; r<rows; r++) for(let c=0; c<cols; c++) {
        const cell = document.createElement('button');
        cell.className = 'mine-cell';
        cell.dataset.r = r;
        cell.dataset.c = c;
        cell.addEventListener('click', cellClick);
        cell.addEventListener('contextmenu', cellFlag);
        boardDiv.appendChild(cell);
    }
}
function placeMines(safeR, safeC) {
    let placed = 0, safeCells = new Set();
    for(let dr=-1; dr<=1; dr++) for(let dc=-1; dc<=1; dc++)
        if (valid(safeR+dr, safeC+dc)) safeCells.add(`${safeR+dr},${safeC+dc}`);
    while (placed < mines) {
        let r = Math.floor(Math.random() * rows), c = Math.floor(Math.random() * cols);
        if (board[r][c] === 'M') continue;
        if (safeCells.has(`${r},${c}`)) continue;
        board[r][c] = 'M';
        placed++;
    }
    for(let r=0; r<rows; r++) for(let c=0; c<cols; c++) {
        if (board[r][c]=='M') continue;
        let cnt = 0;
        for(let dr=-1; dr<=1; dr++) for(let dc=-1; dc<=1; dc++)
            if (valid(r+dr,c+dc) && board[r+dr][c+dc]=='M') cnt++;
        board[r][c] = cnt;
    }
}
function cellClick(e) {
    e.preventDefault();
    if (gameOver) return;
    const r = +this.dataset.r, c = +this.dataset.c;
    if (!started) { placeMines(r, c); started = true; }
    if (flagged[r][c] || revealed[r][c]) return;
    const hitMine = reveal(r, c);
    if (!hitMine) checkWin();
}
function cellFlag(e) {
    e.preventDefault();
    if (gameOver) return;
    const r = +this.dataset.r, c = +this.dataset.c;
    if (revealed[r][c]) return;
    flagged[r][c] = !flagged[r][c];
    updateCell(r, c);
    let flagsUsed = flagged.flat().filter(Boolean).length;
    document.getElementById('mine-count').textContent = `💣 ${mines - flagsUsed}`;
    checkWin();
}
function reveal(r, c) {
    if (!valid(r, c) || flagged[r][c] || revealed[r][c]) return false;
    revealed[r][c] = true;
    updateCell(r, c);
    if (board[r][c] === 'M') {
        explodedCell = [r, c];
        endGame(false, r, c);
        return true;
    }
    if (board[r][c] === 0) {
        for(let dr=-1; dr<=1; dr++) for(let dc=-1; dc<=1; dc++)
            if (dr!==0||dc!==0) reveal(r+dr, c+dc);
    }
    return false;
}
function updateCell(r, c) {
    const i = r*cols+c;
    const minecells = document.getElementsByClassName('mine-cell');
    const btn = minecells[i];
    btn.disabled = revealed[r][c] || gameOver;
    btn.className = 'mine-cell';
    if (flagged[r][c] && !revealed[r][c]) {
        btn.classList.add('flagged');
        btn.textContent = "🚩";
        return;
    }
    if (revealed[r][c]) {
        btn.classList.add('revealed');
        if (board[r][c]=='M') {
            btn.classList.add('mine');
            btn.textContent = "💣";
            if (explodedCell && explodedCell[0] === r && explodedCell[1] === c && gameOver) {
                btn.classList.add('exploded');
            }
        } else if (board[r][c]>0) {
            btn.textContent = board[r][c];
            btn.classList.add('num' + board[r][c]);
        }
    }
}
function valid(r, c) { return r>=0 && c>=0 && r<rows && c<cols; }
function endGame(won, explodedR=null, explodedC=null) {
    gameOver = true;
    for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) {
        if (revealed[r][c] || (won && board[r][c] != 'M')) continue;
        flagged[r][c] = (board[r][c]=='M');
        revealed[r][c] = true;
        updateCell(r, c);
    }
    if (!won && explodedR!=null && explodedC!=null) updateCell(explodedR, explodedC);
    document.getElementById('status').innerHTML = won
        ? '<span style="color:#27ae60;font-weight:600;">🎉 Congratulations, you cleared the board!</span>'
        : '<span style="color:#e2381a;font-weight:600;">Oh you stepped on mine</span>';
}
function checkWin() {
    if (gameOver) return;
    let win = true;
    for(let r=0;r<rows;r++) for(let c=0;c<cols;c++)
        if (board[r][c]!='M' && !revealed[r][c]) win = false;
    if (win) endGame(true);
}
document.getElementById('mineNewBtn').onclick = newGame;
newGame();
})();
