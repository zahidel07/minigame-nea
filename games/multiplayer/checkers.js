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
var toCapture = [-1, -1];
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
            else if (otherSelected.some(function (a) { return areArraysEqual(a.nextMove, [rowInd, colInd]); })) {
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
function mapDiagonals(coord, dir) {
    if (dir === void 0) { dir = "A"; }
    var arrDiag = [];
    var currentSq = grid[coord[0]][coord[1]];
    if (!currentSq)
        return [];
    if (dir === "U" || dir === "A") {
        var upperLeft = [coord[0] - 1, coord[1] - 1];
        if (validCoordinate(upperLeft)) {
            var upperLeftSq = grid[upperLeft[0]][upperLeft[1]];
            if (upperLeftSq) {
                if (!checkSameColour(currentSq, upperLeftSq)) {
                    var nextUpperLeft = [coord[0] - 2, coord[1] - 2];
                    if (validCoordinate(nextUpperLeft)) {
                        var nextUpperLeftSq = grid[nextUpperLeft[0]][nextUpperLeft[1]];
                        if (!nextUpperLeftSq) {
                            toCapture = upperLeft;
                            arrDiag.push({
                                nextMove: nextUpperLeft,
                                capture: toCapture
                            });
                        }
                    }
                }
            }
            else
                arrDiag.push({
                    nextMove: upperLeft,
                    capture: [-1, -1]
                });
        }
        var upperRight = [coord[0] - 1, coord[1] + 1];
        if (validCoordinate(upperRight)) {
            var upperRightSq = grid[upperRight[0]][upperRight[1]];
            if (upperRightSq) {
                if (!checkSameColour(currentSq, upperRightSq)) {
                    var nextUpperRight = [coord[0] - 2, coord[1] + 2];
                    if (validCoordinate(nextUpperRight)) {
                        var nextUpperRightSq = grid[nextUpperRight[0]][nextUpperRight[1]];
                        if (!nextUpperRightSq) {
                            toCapture = upperRight;
                            arrDiag.push({
                                nextMove: nextUpperRight,
                                capture: toCapture
                            });
                        }
                    }
                }
            }
            else
                arrDiag.push({
                    nextMove: upperRight,
                    capture: [-1, -1]
                });
        }
    }
    if (dir === "D" || dir === "A") {
        var lowerLeft = [coord[0] + 1, coord[1] - 1];
        if (validCoordinate(lowerLeft)) {
            var lowerLeftSq = grid[lowerLeft[0]][lowerLeft[1]];
            if (lowerLeftSq) {
                if (!checkSameColour(currentSq, lowerLeftSq)) {
                    var nextLowerLeft = [coord[0] + 2, coord[1] - 2];
                    if (validCoordinate(nextLowerLeft)) {
                        var nextLowerLeftSq = grid[nextLowerLeft[0]][nextLowerLeft[1]];
                        if (!nextLowerLeftSq) {
                            toCapture = lowerLeft;
                            arrDiag.push({
                                nextMove: nextLowerLeft,
                                capture: toCapture
                            });
                        }
                    }
                }
            }
            else
                arrDiag.push({
                    nextMove: lowerLeft,
                    capture: [-1, -1]
                });
        }
        var lowerRight = [coord[0] + 1, coord[1] + 1];
        if (validCoordinate(lowerRight)) {
            var lowerRightSq = grid[lowerRight[0]][lowerRight[1]];
            if (lowerRightSq) {
                if (!checkSameColour(currentSq, lowerRightSq)) {
                    var nextLowerRight = [coord[0] + 2, coord[1] + 2];
                    if (validCoordinate(nextLowerRight)) {
                        var nextLowerRightSq = grid[nextLowerRight[0]][nextLowerRight[1]];
                        if (!nextLowerRightSq) {
                            toCapture = lowerRight;
                            arrDiag.push({
                                nextMove: nextLowerRight,
                                capture: toCapture
                            });
                        }
                    }
                }
            }
            else
                arrDiag.push({
                    nextMove: lowerRight,
                    capture: [-1, -1]
                });
        }
    }
    return arrDiag;
}
// @ts-ignore
function updateSquare(sq) {
    var row = Math.floor(sq / 8);
    var col = sq % 8;
    var isSqToMoveTo = otherSelected.find(function (n) { return areArraysEqual(n.nextMove, [row, col]); });
    if (!!isSqToMoveTo) {
        var nextSqMoveTo_1 = isSqToMoveTo.nextMove;
        var prev_1 = grid[selected[0]][selected[1]];
        grid[selected[0]] = grid[selected[0]].map(function (x, i) { return i === selected[1] ? null : x; });
        grid[nextSqMoveTo_1[0]] = grid[nextSqMoveTo_1[0]].map(function (x, i) { return i === nextSqMoveTo_1[1] ? prev_1 : x; });
        selected = [-1, -1];
        otherSelected = [];
        if (nextSqMoveTo_1[0] === 0 && prev_1 === "B")
            grid[nextSqMoveTo_1[0]] = grid[nextSqMoveTo_1[0]].map(function (x, i) { return i === nextSqMoveTo_1[1] ? "KB" : x; });
        if (nextSqMoveTo_1[0] === 7 && prev_1 === "R")
            grid[nextSqMoveTo_1[0]] = grid[nextSqMoveTo_1[0]].map(function (x, i) { return i === nextSqMoveTo_1[1] ? "KR" : x; });
        if (!areArraysEqual(isSqToMoveTo.capture, [-1, -1]) && areArraysEqual(toCapture, isSqToMoveTo.capture)) {
            grid[toCapture[0]] = grid[toCapture[0]].map(function (x, ind) { return ind === toCapture[1] ? null : x; });
            toCapture = [-1, -1];
        }
        switchPlayer();
    }
    else if (areArraysEqual(selected, [row, col])) {
        selected = [-1, -1];
        toCapture = [-1, -1];
        otherSelected = [];
    }
    else {
        selected = [row, col];
        if (grid[row][col] === "R" && player === "R") {
            otherSelected = mapDiagonals([row, col], "D");
        }
        else if (grid[row][col] === "B" && player === "B") {
            otherSelected = mapDiagonals([row, col], "U");
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
// @ts-ignore
function validCoordinate(coordinate) {
    return (coordinate[0] >= 0 && coordinate[0] <= 7) && (coordinate[1] >= 0 && coordinate[1] <= 7);
}
// @ts-ignore
function checkSameColour(checker1, checker2) {
    if (["B", "KB"].includes(checker1))
        return ["B", "KB"].includes(checker2);
    else if (["R", "KR"].includes(checker1))
        return ["R", "KR"].includes(checker2);
    else
        return false;
}
