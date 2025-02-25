// @ts-ignore
var grid = [
    ["R", null, "R", null, "R", null, "R", null],
    [null, "R", null, "R", null, "R", null, "R"],
    ["R", null, "R", null, "R", null, "R", null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, "B", null, "B", null, "B", null, "B"],
    ["B", null, "B", null, "B", null, "B", null],
    [null, "B", null, "B", null, "B", null, "B"]
];
// @ts-ignore
var selected = [-1, -1];
// @ts-ignore
var otherSelected = [];
// @ts-ignore
var player = "B";
// @ts-ignore
function updateGrid() {
    grid.forEach(function (row, rowInd) {
        row.forEach(function (col, colInd) {
            var elem = document.getElementById("sq".concat(rowInd * 8 + colInd));
            if (!elem)
                return;
            if (areArraysEqual([rowInd, colInd], selected)) {
                elem.setAttribute('class', 'game-square selected');
            }
            else if (otherSelected.some(function (a) { return areArraysEqual(a, [rowInd, colInd]); })) {
                elem.setAttribute('class', 'game-square pseudoselected');
            }
            else {
                switch (col) {
                    case "R":
                        elem.innerText = 'X';
                        elem.setAttribute('class', 'game-square red');
                        break;
                    case "KR":
                        elem.innerText = 'K';
                        elem.setAttribute('class', 'game-square red');
                        break;
                    case "B":
                        elem.innerText = 'X';
                        elem.setAttribute('class', 'game-square black');
                        break;
                    case "KB":
                        elem.innerText = 'K';
                        elem.setAttribute('class', 'game-square black');
                        break;
                    default:
                        elem.innerText = ' ';
                        elem.setAttribute('class', 'game-square');
                        break;
                }
            }
        });
    });
    var winner = checkWinner();
    if (!!winner) {
        grid.forEach(function (row, rowInd) {
            row.forEach(function (_, colInd) {
                var sq = document.getElementById("sq".concat(rowInd * 8 + colInd));
                if (!sq)
                    return;
                sq.setAttribute('disabled', '');
                sq.removeAttribute('onclick');
            });
        });
        var currText = document.getElementById('current');
        if (!currText)
            return;
        currText.innerText = "The winner is: ".concat(winner === "R" ? "Red" : "Black", "!");
    }
}
// @ts-ignore
function mapDiagonals(coord, depth, dir) {
    if (depth === void 0) { depth = 8; }
    if (dir === void 0) { dir = "A"; }
    var arrDiag = [];
    for (var i = 1; i <= depth; i++) {
        if (dir === "U" || dir === "A")
            arrDiag.push([coord[0] - i, coord[1] - i], [coord[0] - i, coord[1] + i]);
        if (dir === "D" || dir === "A")
            arrDiag.push([coord[0] + i, coord[1] - i], [coord[0] + i, coord[1] + i]);
    }
    arrDiag = arrDiag
        .filter(function (x) { return x[0] >= 0 && x[0] <= 7 && x[1] >= 0 && x[1] <= 7; })
        .filter(function (x) {
        var coordElem = grid[x[0]][x[1]];
        var gridElem = grid[coord[0]][coord[1]];
        if (!gridElem || !coordElem)
            return true;
        if (["B", "KB"].includes(gridElem) && ["B", "KB"].includes(coordElem))
            return false;
        if (["R", "KR"].includes(gridElem) && ["R", "KR"].includes(coordElem))
            return false;
        if (gridElem !== coordElem)
            return true;
        return true;
    });
    return arrDiag;
}
// @ts-ignore
function updateSquare(sq) {
    var row = Math.floor(sq / 8);
    var col = sq % 8;
    var sqToMoveTo = otherSelected.find(function (n) { return areArraysEqual(n, [row, col]); });
    if (!!sqToMoveTo) {
        var prev_1 = grid[selected[0]][selected[1]];
        grid[selected[0]] = grid[selected[0]].map(function (x, i) { return i === selected[1] ? null : x; });
        grid[sqToMoveTo[0]] = grid[sqToMoveTo[0]].map(function (x, i) { return i === sqToMoveTo[1] ? prev_1 : x; });
        selected = [-1, -1];
        otherSelected = [];
        if (sqToMoveTo[0] === 0 && prev_1 === "B")
            grid[sqToMoveTo[0]] = grid[sqToMoveTo[0]].map(function (x, i) { return i === sqToMoveTo[1] ? "KB" : x; });
        if (sqToMoveTo[0] === 7 && prev_1 === "R")
            grid[sqToMoveTo[0]] = grid[sqToMoveTo[0]].map(function (x, i) { return i === sqToMoveTo[1] ? "KR" : x; });
        else
            switchPlayer();
    }
    else if (areArraysEqual(selected, [row, col])) {
        selected = [-1, -1];
        otherSelected = [];
    }
    else {
        selected = [row, col];
        if (grid[row][col] === "R" && player === "R") {
            otherSelected = mapDiagonals([row, col], 1, "D");
        }
        else if (grid[row][col] === "B" && player === "B") {
            otherSelected = mapDiagonals([row, col], 1, "U");
        }
        else if ((grid[row][col] === "KR" && player === "R") || (grid[row][col] === "KB" && player === "B")) {
            otherSelected = mapDiagonals([row, col]);
        }
        else {
            selected = [-1, -1];
            otherSelected = [];
        }
    }
    updateGrid();
}
// @ts-ignore
function areArraysEqual(array1, array2) {
    return array1.length === array2.length && array1.every(function (elem1, ind1) { return array2[ind1] === elem1; });
}
// @ts-ignore
function switchPlayer() {
    player = player === "R" ? "B" : "R";
    var currentPlayerText = document.getElementById('current');
    if (currentPlayerText)
        currentPlayerText.innerText = "Current player: ".concat(player === "R" ? "Red" : "Black");
}
// @ts-ignore
function checkWinner() {
    var flatGrid = grid.flat(1);
    if (!flatGrid.includes("B"))
        return "R";
    else if (!flatGrid.includes("R"))
        return "B";
    else
        return null;
}
