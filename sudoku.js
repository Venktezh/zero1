(function () {
    const sudokuTab = document.getElementById('sudoku-tab');
    sudokuTab.innerHTML = `
        <h2>Sudoku Game</h2>
        <div id="levelLabel" style="color:#3498db;text-align:center; font-size: 1.1em;margin-bottom:.7em;">Level <span id="level-num">1</span></div>
        <div class="sudoku-board" id="sudokuBoard"></div>
        <div class="controls">
            <button class="btn" id="checkSudokuBtn">Check</button>
            <button class="btn" id="restartSudokuBtn">Restart</button>
            <button class="btn" id="nextLevelBtn">Next Level</button>
        </div>
        <div id="message"></div>
    `;
    let level = 1, solution = [], puzzle = [];
    function generateSudokuSolution() {
        let board = [...Array(9)].map(()=>Array(9).fill(0));
        let rows = Array.from({length:9},()=>Array(10).fill(false)),
            cols = Array.from({length:9},()=>Array(10).fill(false)),
            boxes = Array.from({length:9},()=>Array(10).fill(false));
        function canPlace(r,c,n){
            let b = Math.floor(r/3)*3+Math.floor(c/3);
            return !rows[r][n]&&!cols[c][n]&&!boxes[b][n];
        }
        function place(r,c,n,v){
            let b = Math.floor(r/3)*3+Math.floor(c/3);
            rows[r][n]=v; cols[c][n]=v; boxes[b][n]=v;
        }
        function fill(r=0,c=0){
            if(r===9) return true;
            let nr = (c===8)?r+1:r, nc = (c+1)%9;
            let nums = [1,2,3,4,5,6,7,8,9].sort(()=>Math.random()-0.5);
            for(let n of nums){
                if(canPlace(r,c,n)){
                    board[r][c]=n; place(r,c,n,true);
                    if(fill(nr,nc)) return true;
                    board[r][c]=0; place(r,c,n,false);
                }
            }
            return false;
        }
        fill();
        return board;
    }
    function makeEasyPuzzle(solution) {
        let puzzle = solution.map(row=>row.slice());
        let positions = [];
        for(let r=0;r<9;r++) for(let c=0;c<9;c++) positions.push([r,c]);
        for(let i = positions.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i+1));
            [positions[i],positions[j]] = [positions[j],positions[i]];
        }
        let clues = 40 - Math.floor(Math.random()*5);
        let removed = 81 - clues;
        for(let i=0;i<removed;i++) {
            let [r,c]=positions[i];
            puzzle[r][c]='';
        }
        return puzzle;
    }
    function createSudoku(levelIncrement = false) {
        if (levelIncrement) level++;
        document.getElementById('level-num').textContent = level;
        solution = generateSudokuSolution();
        puzzle = makeEasyPuzzle(solution);
        renderSudoku();
    }
    function renderSudoku() {
        const boardDiv = document.getElementById('sudokuBoard'); boardDiv.innerHTML = '';
        for(let row=0; row<9; row++) for(let col=0; col<9; col++) {
            let cell = document.createElement('input');
            cell.type = 'text'; cell.maxLength = 1; cell.className = 'sudoku-cell';
            if ((col+1)%3 === 0 && col < 8) cell.classList.add('block-right');
            if ((row+1)%3 === 0 && row < 8) cell.classList.add('block-bottom');
            if (puzzle[row][col] !== "") {
                cell.value = puzzle[row][col];
                cell.readOnly = true;
            } else {
                cell.value = '';
                cell.oninput = function(){ this.value = this.value.replace(/[^1-9]/g,''); };
            }
            cell.dataset.r = row; cell.dataset.c = col;
            boardDiv.appendChild(cell);
        }
        document.getElementById('message').textContent = '';
    }
    function checkSudoku() {
        let correct = true;
        const cells = document.querySelectorAll('.sudoku-cell:not([readonly])');
        cells.forEach(e => {
            const r = parseInt(e.dataset.r), c = parseInt(e.dataset.c);
            let v = Number(e.value);
            e.classList.remove('cell-correct','cell-wrong');
            if (!e.value) {
                correct = false;
            } else if (v === solution[r][c]) {
                e.classList.add('cell-correct');
            } else {
                e.classList.add('cell-wrong');
                correct = false;
            }
        });
        const message = document.getElementById('message');
        if (correct) {
            message.innerHTML = `<span class="success">🎉 Correct! Sudoku Solved.</span>`;
        } else {
            message.innerHTML = `<span class="fail">Some cells are wrong or empty. Try again!</span>`;
        }
    }
    document.getElementById('checkSudokuBtn').onclick = checkSudoku;
    document.getElementById('restartSudokuBtn').onclick = () => renderSudoku();
    document.getElementById('nextLevelBtn').onclick = () => createSudoku(true);
    createSudoku();
})();
