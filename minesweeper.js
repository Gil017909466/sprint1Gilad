'use strict';
var gBegining = null;
var gTimer = null;
var gIsHintOn = false;
var gCellsForHintArr = [];
var gBoard = [];
var gLevel = {
    SIZE: 4,
    MINES: 2
};
var gGame = null;

function initGame() {
    document.querySelector('.losingModal').style.display = 'none';
    document.querySelector('.winningModal').style.display = 'none';
    document.querySelector('.hint1Butt').style.display = 'block';
    document.querySelector('.hint2Butt').style.display = 'block';
    document.querySelector('.hint3Butt').style.display = 'block';

    gIsHintOn = false;
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        countSolvedCells: 0,
    };
    buildBoard();
    renderBoard();
    clearInterval(gTimer);
    var elTimer = document.querySelector('.timer');
    elTimer.innerText = `Timer:`;
}

function buildBoard() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        gBoard[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            gBoard[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
            }
        }
    }
}

function setMinesNegsCount(celRow, celCol) {
    var count = 0;
    for (var i = celRow - 1; i <= celRow + 1; i++) {
        if (i < 0 || i >= gLevel.SIZE)
            continue;
        for (var j = celCol - 1; j <= celCol + 1; j++) {
            if (j < 0 || j >= gLevel.SIZE || (celRow === i && celCol === j))
                continue;
            if (gBoard[i][j].isMine) {
                count++;
            }
        }
    }
    return count;
}

function renderBoard() {
    var theBoard = document.querySelector('.board');
    var strHTML = '';
    var currentCell = null;
    for (var i = 0; i < gLevel.SIZE; i++) {
        strHTML += `<tr>`;
        for (var j = 0; j < gLevel.SIZE; j++) {
            currentCell = gBoard[i][j];
            if (!currentCell.isShown) { // cell is hidden
                if (currentCell.isMarked) { // if it's marked then flag it
                    strHTML += `<td data-i="${i}" data-j="${j}" onmousedown="cellClicked(event,this,${i},${j})")">🚩</td>`;
                }
                else  // cell is not marked then keep it simple :)
                    strHTML += `<td data-i="${i}" data-j="${j}" onmousedown="cellClicked(event,this,${i},${j})")"></td>`;
            } else { //cell is shown
                if (currentCell.isMine)
                    strHTML += `<td data-i="${i}" data-j="${j}" onmousedown="cellClicked(event,this,${i},${j})")">💣</td>`;
                else // cell is shown but not a mine
                    strHTML += `<td data-i="${i}" data-j="${j}" onmousedown="cellClicked(event,this,${i},${j})")">${gBoard[i][j].minesAroundCount}</td>`;
            }
        }
        strHTML += `<tr>`;
    }
    theBoard.innerHTML = strHTML;
}

function cellClicked(event, elCell, i, j) {
    var cell = gBoard[parseInt(i)][parseInt(j)];

    if (event.button === 2) { //right mouse click
        if (!cell.isMarked) {
            if (gGame.countSolvedCells === 0) return; // do nothing
            cell.isMarked = true;  //add the flag
            renderBoard();
            if (cell.isMine) gGame.countSolvedCells++;
            checkGameOver();
        }
        else {
            cell.isMarked = false; //take off the flag
            renderBoard();
            if (cell.isMine) gGame.countSolvedCells--;
        }
        return;

    } else if (event.button === 0) { //left mouse click
        if (cell.isMarked) return;   // do nothing
        if (gGame.countSolvedCells === 0) { // then this is the first click
            runTimer();
            installBombs();
            if (gIsHintOn) {
                showNeighbors(i, j);
                gIsHintOn = false;
            }
            if (cell.minesAroundCount === 0)
                expandShown(elCell, i, j);
            else {
                cell.isShown = true;
                console.log('show it !!!');
                gGame.countSolvedCells++;
                renderBoard();
            }
        }
        else if (cell.isMine) {
            gameOver();
            return;
        }
        else { // cell should open up and show it's content
            if (cell.minesAroundCount === 0)
                expandShown(elCell, i, j);
            else {
                cell.isShown = true;
                gGame.countSolvedCells++;
                checkGameOver();
            }
            renderBoard();
        }
    }
}

//function cellMarked(elCell) {

//}

function checkGameOver() {
    if (gGame.countSolvedCells === (gLevel.SIZE * gLevel.SIZE)) {
        document.querySelector('.winningModal').style.display = 'block';
        clearInterval(gTimer);
    }
    renderBoard();
    return;
}

function installBombs() {
    for (var i = 0; i < gLevel.MINES;) {
        var row = Math.floor(Math.random() * gLevel.SIZE);
        var col = Math.floor(Math.random() * gLevel.SIZE);
        if (!gBoard[row][col].isMine && !gBoard[row][col].isShown) {
            gBoard[row][col].isMine = true;
            i++;
        }
    }
    for (var i = 0; i < gLevel.SIZE; i++)
        for (var j = 0; j < gLevel.SIZE; j++)
            gBoard[i][j].minesAroundCount = setMinesNegsCount(i, j);

    return;
}

function gameOver() {
    for (var i = 0; i < gLevel.SIZE; i++)
        for (var j = 0; j < gLevel.SIZE; j++)
            if (gBoard[i][j].isMine)
                gBoard[i][j].isShown = true;

    renderBoard();
    document.querySelector('.losingModal').style.display = 'block';
    clearInterval(gTimer);
}

function runTimer() {
    gBegining = Date.now();
    var elTimer = document.querySelector('.timer');
    gTimer = setInterval(
        function () { elTimer.innerText = `Timer: ${Math.floor(((Date.now() - gBegining) / 1000))} sec`; },
        200);
}

function setLevel(elLevelButt) {
    if (elLevelButt.id === 'easy') {
        gLevel.SIZE = 4;
        gLevel.MINES = 2;
        initGame();
    }
    else if (elLevelButt.id === 'medium') {
        gLevel.SIZE = 8;
        gLevel.MINES = 12;
        initGame();
    }
    else if (elLevelButt.id === 'hard') {
        gLevel.SIZE = 12;
        gLevel.MINES = 30;
        initGame();
    }
}

function expandShown(elCell, x, y) {
    if (!gBoard[x][y].isShown) {
        if (gBoard[x][y].isMarked || gBoard[x][y].isMine) return;

        gBoard[x][y].isShown = true;
        gGame.countSolvedCells++;
        checkGameOver();

        if (gBoard[x][y].minesAroundCount === 0)
            for (var i = x - 1; i <= x + 1; i++) {
                if (i < 0 || i >= gLevel.SIZE) continue;
                for (var j = y - 1; j <= y + 1; j++) {
                    if (i === x && j === y) continue;
                    if (j < 0 || j >= gLevel.SIZE) continue;
                    expandShown(elCell, i, j);
                }
            }
    }
    return;
}

function hint(elHintButt) {
    gIsHintOn = true;
    var tdsArr = document.querySelectorAll('td');
    for (var i = 0; i < tdsArr.length; i++)
        tdsHolder[i].innerHTML = 'Show this';
    elHintButt.style.display = 'none';
}

function hint(elHintButt) {
    gIsHintOn = true;
    var tdsArr = document.querySelectorAll('td');
    for (var i = 0; i < tdsArr.length; i++)
        tdsArr[i].innerHTML = 'Click 2 See';
    elHintButt.style.display = 'none';
}

function showNeighbors(xIndex, yIndex) {
    for (var i = xIndex - 1; i <= xIndex + 1; i++) {
        if (i < 0 || i >= gLevel.SIZE) continue;
        for (var j = yIndex - 1; j <= yIndex + 1; j++) {
            if (j < 0 || j >= gLevel.SIZE) continue;
            if (gBoard[i][j].isShown) continue;
            gBoard[i][j].isShown = true;
            gCellsForHintArr.push(gBoard[i][j]);
            renderBoard();
            setTimeout(function () { terminateHint(); }, 700);  // the PDF said a full second... but that's way too much !!! LOL
        }
    }
}
function terminateHint() {
    for (var k = 0; k < gCellsForHintArr.length; k++)
        gCellsForHintArr[k].isShown = false;
    renderBoard();
    gCellsForHintArr = [];
    gIsHintOn = false;
}