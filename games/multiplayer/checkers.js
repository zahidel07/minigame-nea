var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
console.clear();
var grid = [
    ["R", null, "R", null, "R", null, "R", null],
    [null, "R", null, "R", null, "R", null, "R"],
    ["R", null, "R", null, "R", null, "R", null],
    [null, "B", null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, "B", null, "B", null, "B", null, "B"],
    [null, null, null, null, null, null, "B", null],
    [null, "B", null, "B", null, "B", null, "B"]
];
var selected = [-1, -1];
var toCapture = [-1, -1];
var otherSelected = [];
var player = "B";
var allPlayerMoves = [];
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
                        elem.innerText = 'O';
                        elem.setAttribute('class', 'game-square red');
                        break;
                    case "KR":
                        elem.innerText = 'K';
                        elem.setAttribute('class', 'game-square red');
                        break;
                    case "B":
                        elem.innerText = 'O';
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
function mapDiagonals(coord, dir, originalColour) {
    if (dir === void 0) { dir = "A"; }
    var arrDiag = [];
    var currentSq = grid[coord[0]][coord[1]];
    if (dir === "U" || dir === "A") {
        var upperLeft = [coord[0] - 1, coord[1] - 1];
        if (validCoordinate(upperLeft)) {
            var upperLeftSq = grid[upperLeft[0]][upperLeft[1]];
            if (upperLeftSq) {
                if (!checkSameColour(originalColour || currentSq, upperLeftSq)) {
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
                if (!checkSameColour(originalColour || currentSq, upperRightSq)) {
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
                if (!checkSameColour(originalColour || currentSq, lowerLeftSq)) {
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
                if (!checkSameColour(originalColour || currentSq, lowerRightSq)) {
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
    if (arrDiag.some(function (move) { return !areArraysEqual([-1, -1], move.capture); }))
        arrDiag = arrDiag
            .filter(function (move) { return !areArraysEqual([-1, -1], move.capture); });
    return arrDiag;
}
// @ts-ignore
function updateSquare(sq) {
    var _a = [Math.floor(sq / 8), sq % 8], row = _a[0], col = _a[1];
    var isSqToMoveTo = otherSelected.find(function (n) { return areArraysEqual(n.nextMove, [row, col]); });
    if (!!isSqToMoveTo) {
        // TEST CODE
        var prevSq_1 = selected;
        var moveNext_1 = {
            nextMove: [-1, -1],
            capture: [-1, -1]
        };
        var final = isSqToMoveTo.nextMove;
        var prevSqColour_1 = grid[prevSq_1[0]][prevSq_1[1]];
        var tree = createTree(selected, prevSqColour_1 === "KB" || prevSqColour_1 === "KR" ? "A" : (prevSqColour_1 === "B" ? "U" : "D"), {});
        var path = traverseTree(final, selected, tree, []);
        moveNext_1 = path[0];
        for (var i = 1; i < path.length; i++) {
            grid[prevSq_1[0]] = grid[prevSq_1[0]].map(function (x, n) { return n === prevSq_1[1] ? null : x; });
            grid[moveNext_1.nextMove[0]] = grid[moveNext_1.nextMove[0]].map(function (x, n) { return n === moveNext_1.nextMove[1] ? prevSqColour_1 : x; });
            if (!areArraysEqual(moveNext_1.capture, [-1, -1])) {
                grid[moveNext_1.capture[0]] = grid[moveNext_1.capture[0]].map(function (x, n) { return n === moveNext_1.capture[1] ? null : x; });
            }
            prevSq_1 = moveNext_1.nextMove;
            moveNext_1 = path[i];
        }
        if (moveNext_1.nextMove[0] === 0)
            grid[moveNext_1.nextMove[0]]
                = grid[moveNext_1.nextMove[0]].map(function (x, n) {
                    return n === moveNext_1.nextMove[1]
                        ? (prevSqColour_1 === "B" ? "KB" : "KR")
                        : x;
                });
        switchPlayer();
    }
    else if (areArraysEqual(selected, [row, col])) {
        selected = [-1, -1];
        otherSelected = [];
    }
    else {
        selected = [row, col];
        if (grid[row][col] === "R" && player === "R") {
            otherSelected = __spreadArray([], Object.values(createTree([row, col], "D", {})), true).flat();
        }
        else if (grid[row][col] === "B" && player === "B") {
            otherSelected = __spreadArray([], Object.values(createTree([row, col], "U", {})), true).flat();
        }
        else if ((grid[row][col] === "KR" && player === "R") || (grid[row][col] === "KB" && player === "B")) {
            otherSelected = __spreadArray([], Object.values(createTree([row, col], "A", {})), true).flat();
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
function getAllPlayerMoves(player) {
    allPlayerMoves = [];
    grid.forEach(function (row, rowInd) {
        row.forEach(function (col, colInd) {
            var _a;
            if (!col)
                return;
            if (!col.endsWith(player))
                return;
            var checkerPossibleMoves = mapDiagonals([rowInd, colInd], (col === "KB" || col === "KR"
                ? "A"
                : (col === "B" ? "U" : "D")));
            if (checkerPossibleMoves.length)
                allPlayerMoves.push((_a = {},
                    _a[rowInd * 8 + colInd] = checkerPossibleMoves,
                    _a));
        });
    });
    return allPlayerMoves;
}
// @ts-ignore
function checkSameColour(checker1, checker2) {
    if (checker1 && checker2) {
        if (["B", "KB"].includes(checker1))
            return ["B", "KB"].includes(checker2);
        else if (["R", "KR"].includes(checker1))
            return ["R", "KR"].includes(checker2);
        else
            return false;
    }
    else
        return false;
}
// @ts-ignore
function traverseTree(start, end, tree, traversalArray) {
    var keys = __spreadArray([], Object.keys(tree), true);
    if (!keys.includes((end[0] * 8 + end[1]).toString()))
        return [];
    if (areArraysEqual(start, end))
        return traversalArray.reverse();
    else {
        var foundKey = keys.find(function (key) { var _a; return (_a = tree[key]) === null || _a === void 0 ? void 0 : _a.some(function (x) { return areArraysEqual(x.nextMove, start); }); });
        if (!foundKey)
            return [];
        var intFoundKey = parseInt(foundKey);
        var coord = [Math.floor(intFoundKey / 8), intFoundKey % 8];
        var nextCaptureObject = tree[foundKey].find(function (x) { return areArraysEqual(x.nextMove, start); });
        if (!nextCaptureObject)
            return [];
        traversalArray.push(nextCaptureObject);
        return traverseTree(coord, end, tree, traversalArray);
    }
}
// @ts-ignore
function createTree(start, dir, prevTree) {
    var tempTree = prevTree;
    var tempTreeKeys = __spreadArray([], Object.keys(tempTree), true);
    var requireForceCapture = !!Object.values(prevTree).flat().length && Object.values(prevTree).flat()
        .every(function (_a, _, arr) {
        var capture = _a.capture;
        return arr.length !== 0 && !areArraysEqual(capture, [-1, -1]);
    });
    if (!tempTreeKeys.includes(String(start[0] * 8 + start[1]))) {
        tempTree[String(start[0] * 8 + start[1])] = mapDiagonals(start, dir);
    }
    for (var _i = 0, tempTreeKeys_1 = tempTreeKeys; _i < tempTreeKeys_1.length; _i++) {
        var key = tempTreeKeys_1[_i];
        var nextMoves = tempTree[key];
        nextMoves.forEach(function (_a) {
            var nextMove = _a.nextMove;
            var indexAsStr = nextMove[0] * 8 + nextMove[1];
            var furtherNextMove = mapDiagonals(nextMove, dir, grid[start[0]][start[1]]);
            if (furtherNextMove.length)
                tempTree[indexAsStr] = furtherNextMove;
        });
    }
    var allObjValues = __spreadArray([], Object.values(tempTree), true);
    if (allObjValues.length && allObjValues.some(function (x) { return x.some(function (_a) {
        var capture = _a.capture;
        return areArraysEqual(capture, [-1, -1]);
    }); }))
        return tempTree;
    if (requireForceCapture) {
        for (var _a = 0, _b = Object.keys(tempTree); _a < _b.length; _a++) {
            var key = _b[_a];
            if (tempTree[key].some(function (x) { return areArraysEqual(x.capture, [-1, -1]); }))
                delete tempTree[key];
        }
    }
    if (areArraysEqual(__spreadArray([], Object.keys(prevTree), true), tempTreeKeys))
        return tempTree;
    else
        return createTree(start, dir, tempTree);
}
