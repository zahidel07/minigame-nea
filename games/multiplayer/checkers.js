"use strict";
let grid = [
    ["R", null, "R", null, "R", null, "R", null],
    [null, "R", null, "R", null, "R", null, "R"],
    ["R", null, "R", null, "R", null, "R", null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, "B", null, "B", null, "B", null, "B"],
    ["B", null, "B", null, "B", null, "B", null],
    [null, "B", null, "B", null, "B", null, "B"]
];
let selected = [-1, -1];
let otherSelected = [];
let player = "B";
function mapDiagonals(coord, dir = "A") {
    let arrDiag = [];
    const currentSq = grid[coord[0]][coord[1]];
    if (!currentSq)
        return [];
    if (dir === "U" || dir === "A") {
        // approach
        // make new coordinate: the adjacent to current
        // check it's valid
        // check it's empty
        // if not empty:
        //    check NEXT adjacent along same direction
        //    check if empty
        //    if empty, check opportunity to capture
        //    this is only the case if the current square is NOT equal to the 1st adjacent
        // if there is ANY opportunity available, all non-opportunities must be removed
        // (this forces user to take available opportunities)
        // otherwise, all other moves available
        // if no moves available for any checker, then declare opposite as winner
        const upperLeft = [coord[0] - 1, coord[1] - 1];
        if (validCoordinate(upperLeft)) {
            const upperLeftSq = grid[upperLeft[0]][upperLeft[1]];
            if (upperLeftSq) {
                if (!checkSameColour(currentSq, upperLeftSq)) {
                    const nextUpperLeft = [coord[0] - 2, coord[1] - 2];
                    if (validCoordinate(nextUpperLeft)) {
                        const nextUpperLeftSq = grid[nextUpperLeft[0]][nextUpperLeft[1]];
                        if (!nextUpperLeftSq)
                            arrDiag.push(nextUpperLeft);
                    }
                }
            }
            else
                arrDiag.push(upperLeft);
        }
        const upperRight = [coord[0] - 1, coord[1] + 1];
        if (validCoordinate(upperRight)) {
            const upperRightSq = grid[upperRight[0]][upperRight[1]];
            if (upperRightSq) {
                if (!checkSameColour(currentSq, upperRightSq)) {
                    const nextUpperRight = [coord[0] - 2, coord[1] + 2];
                    if (validCoordinate(nextUpperRight)) {
                        const nextUpperRightSq = grid[nextUpperRight[0]][nextUpperRight[1]];
                        if (!nextUpperRightSq)
                            arrDiag.push(nextUpperRight);
                    }
                }
            }
            else
                arrDiag.push(upperRight);
        }
    }
    if (dir === "D" || dir === "A") {
        const lowerLeft = [coord[0] + 1, coord[1] - 1];
        if (validCoordinate(lowerLeft)) {
            const lowerLeftSq = grid[lowerLeft[0]][lowerLeft[1]];
            if (lowerLeftSq) {
                if (!checkSameColour(currentSq, lowerLeftSq)) {
                    const nextLowerLeft = [coord[0] + 2, coord[1] - 2];
                    if (validCoordinate(nextLowerLeft)) {
                        const nextLowerLeftSq = grid[nextLowerLeft[0]][nextLowerLeft[1]];
                        if (!nextLowerLeftSq)
                            arrDiag.push(nextLowerLeft);
                    }
                }
            }
            else
                arrDiag.push(lowerLeft);
        }
        const lowerRight = [coord[0] + 1, coord[1] + 1];
        if (validCoordinate(lowerRight)) {
            const lowerRightSq = grid[lowerRight[0]][lowerRight[1]];
            if (lowerRightSq) {
                if (!checkSameColour(currentSq, lowerRightSq)) {
                    const nextLowerRight = [coord[0] + 2, coord[1] + 2];
                    if (validCoordinate(nextLowerRight)) {
                        const nextLowerRightSq = grid[nextLowerRight[0]][nextLowerRight[1]];
                        if (!nextLowerRightSq)
                            arrDiag.push(nextLowerRight);
                    }
                }
            }
            else
                arrDiag.push(lowerRight);
        }
    }
    return arrDiag;
}
function updateSquare(sq) {
    const row = Math.floor(sq / 8);
    const col = sq % 8;
    const sqToMoveTo = otherSelected.find(n => areArraysEqual(n, [row, col]));
    if (!!sqToMoveTo) {
        const prev = grid[selected[0]][selected[1]];
        grid[selected[0]] = grid[selected[0]].map((x, i) => i === selected[1] ? null : x);
        grid[sqToMoveTo[0]] = grid[sqToMoveTo[0]].map((x, i) => i === sqToMoveTo[1] ? prev : x);
        selected = [-1, -1];
        otherSelected = [];
        if (sqToMoveTo[0] === 0 && prev === "B")
            grid[sqToMoveTo[0]] = grid[sqToMoveTo[0]].map((x, i) => i === sqToMoveTo[1] ? "KB" : x);
        if (sqToMoveTo[0] === 7 && prev === "R")
            grid[sqToMoveTo[0]] = grid[sqToMoveTo[0]].map((x, i) => i === sqToMoveTo[1] ? "KR" : x);
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
}
function areArraysEqual(array1, array2) {
    return array1.length === array2.length && array1.every((elem1, ind1) => array2[ind1] === elem1);
}
function switchPlayer() {
    player = player === "R" ? "B" : "R";
}
function checkWinner() {
    const flatGrid = grid.flat(1);
    if (!flatGrid.includes("B"))
        return "R";
    else if (!flatGrid.includes("R"))
        return "B";
    else
        return null;
}
function validCoordinate(coordinate) {
    return (coordinate[0] >= 0 && coordinate[0] <= 7) && (coordinate[1] >= 0 && coordinate[1] <= 7);
}
function checkSameColour(checker1, checker2) {
    if (["B", "KB"].includes(checker1))
        return ["B", "KB"].includes(checker2);
    else if (["R", "KR"].includes(checker1))
        return ["R", "KR"].includes(checker2);
    else
        return false;
}