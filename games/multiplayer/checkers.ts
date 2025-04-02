// @target: es2019
type Checker = "B" | "R" | "KB" | "KR"
type Direction = "U" | "D" | "A"
type Square = Checker | null
type Coordinate = [number, number]
type Row = [Square, Square, Square, Square, Square, Square, Square, Square]
type CaptureObj = {
    nextMove: Coordinate;
    capture: Coordinate
}
type NextCoordTree = {
    [coordinate: string]: Array<CaptureObj>
}

// @ts-ignore
let grid: Array<Row> = [
    ["R" , null, "R" , null, "R" , null, "R" , null],
    [null, "R" , null, "R" , null, "R" , null, "R" ],
    ["R" , null, "R" , null, "R" , null, "R" , null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, "B" , null, "B" , null, "B" , null, "B" ],
    ["B" , null, "B" , null, "B" , null, "B" , null],
    [null, "B" , null, "B" , null, "B" , null, "B" ]
]
// @ts-ignore
let selected: Coordinate = [-1, -1]
// @ts-ignore
let toCapture: Coordinate = [-1, -1]
// @ts-ignore
let otherSelected: Array<CaptureObj> = []
// @ts-ignore
let player: "R" | "B" = "B"
// @ts-ignore
let allPlayerMoves: Array<NextCoordTree> = []

// @ts-ignore
function updateGrid() {
    grid.forEach((row, rowInd) => {
        row.forEach((col, colInd) => {
            const elem = document.getElementById(`sq${rowInd * 8 + colInd}`)
            if (!elem) return
            if (areArraysEqual([rowInd, colInd], selected)) {
                elem.setAttribute('class', 'game-square selected')
            } else if (otherSelected.some(a => areArraysEqual(a.nextMove, [rowInd, colInd]))) {
                elem.setAttribute('class', 'game-square pseudoselected')
            } else {
                switch (col) {
                    case "R":
                        elem.innerText = 'O'
                        elem.setAttribute('class', 'game-square red')
                        break
                    case "KR":
                        elem.innerText = 'K'
                        elem.setAttribute('class', 'game-square red')
                        break
                    case "B":
                        elem.innerText = 'O'
                        elem.setAttribute('class', 'game-square black')
                        break
                    case "KB":
                        elem.innerText = 'K'
                        elem.setAttribute('class', 'game-square black')
                        break
                    default:
                        elem.innerText = ' '       
                        elem.setAttribute('class', 'game-square')
                        break
                }
            }
        })
    })

    const winner = checkWinner()
    if (!!winner) {
        grid.forEach((row, rowInd) => {
            row.forEach((_, colInd) => {
                const sq = document.getElementById(`sq${rowInd * 8 + colInd}`)
                if (!sq) return
                sq.setAttribute('disabled', '')
                sq.removeAttribute('onclick')
            })
        })
        const currText = document.getElementById('current')
        if (!currText) return
        currText.innerText = `The winner is: ${winner === "R" ? "Red" : "Black"}!`
    } 
}

// @ts-ignore
function mapDiagonals(coord: Coordinate, dir: Direction = "A", originalColour?: Square): Array<CaptureObj> {
    let arrDiag: CaptureObj[] = []
    const currentSq = grid[coord[0]][coord[1]]
    if (dir === "U" || dir === "A") {
        const upperLeft = [coord[0] - 1, coord[1] - 1] as Coordinate
        if (validCoordinate(upperLeft)) {
            const upperLeftSq = grid[upperLeft[0]][upperLeft[1]]
            if (upperLeftSq) {
                if (!checkSameColour(originalColour || currentSq, upperLeftSq)) {
                    const nextUpperLeft = [coord[0] - 2, coord[1] - 2] as Coordinate
                    if (validCoordinate(nextUpperLeft)) {
                        const nextUpperLeftSq = grid[nextUpperLeft[0]][nextUpperLeft[1]]
                        if (!nextUpperLeftSq) {
                            toCapture = upperLeft
                            arrDiag.push({
                                nextMove: nextUpperLeft,
                                capture: toCapture
                            })
                        }
                    }        
                }
            } else arrDiag.push({
                nextMove: upperLeft,
                capture: [-1, -1]
            })
        }
        const upperRight = [coord[0] - 1, coord[1] + 1] as Coordinate
        if (validCoordinate(upperRight)) {
            const upperRightSq = grid[upperRight[0]][upperRight[1]]
            if (upperRightSq) {
                if (!checkSameColour(originalColour || currentSq, upperRightSq)) {
                    const nextUpperRight = [coord[0] - 2, coord[1] + 2] as Coordinate
                    if (validCoordinate(nextUpperRight)) {
                        const nextUpperRightSq = grid[nextUpperRight[0]][nextUpperRight[1]]
                        if (!nextUpperRightSq) {
                            toCapture = upperRight
                            arrDiag.push({
                                nextMove: nextUpperRight,
                                capture: toCapture
                            })
                        }
                    }        
                }
            } else arrDiag.push({
                nextMove: upperRight,
                capture: [-1, -1]
            })
        }
    } if (dir === "D" || dir === "A") {
        const lowerLeft = [coord[0] + 1, coord[1] - 1] as Coordinate
        if (validCoordinate(lowerLeft)) {
            const lowerLeftSq = grid[lowerLeft[0]][lowerLeft[1]]
            if (lowerLeftSq) {
                if (!checkSameColour(originalColour || currentSq, lowerLeftSq)) {
                    const nextLowerLeft = [coord[0] + 2, coord[1] - 2] as Coordinate
                    if (validCoordinate(nextLowerLeft)) {
                        const nextLowerLeftSq = grid[nextLowerLeft[0]][nextLowerLeft[1]]
                        if (!nextLowerLeftSq) {
                            toCapture = lowerLeft
                            arrDiag.push({
                                nextMove: nextLowerLeft,
                                capture: toCapture
                            })
                        }
                    }        
                }
            } else arrDiag.push({
                nextMove: lowerLeft,
                capture: [-1, -1]
            })
        }
        const lowerRight = [coord[0] + 1, coord[1] + 1] as Coordinate
        if (validCoordinate(lowerRight)) {
            const lowerRightSq = grid[lowerRight[0]][lowerRight[1]]
            if (lowerRightSq) {
                if (!checkSameColour(originalColour || currentSq, lowerRightSq)) {
                    const nextLowerRight = [coord[0] + 2, coord[1] + 2] as Coordinate
                    if (validCoordinate(nextLowerRight)) {
                        const nextLowerRightSq = grid[nextLowerRight[0]][nextLowerRight[1]]
                        if (!nextLowerRightSq) {
                            toCapture = lowerRight
                            arrDiag.push({
                                nextMove: nextLowerRight,
                                capture: toCapture
                            })
                        }
                    }        
                }
            } else arrDiag.push({
                nextMove: lowerRight,
                capture: [-1, -1]
            })
        }
    }
    if (arrDiag.some(move => !areArraysEqual([-1, -1], move.capture))) arrDiag = arrDiag
    .filter(move => !areArraysEqual([-1, -1], move.capture))
    return arrDiag
}

// @ts-ignore
function updateSquare(sq: number) {
    const [row, col] = [Math.floor(sq / 8), sq % 8]
    const isSqToMoveTo = otherSelected.find(n => areArraysEqual(n.nextMove, [row, col]))
    if (!!isSqToMoveTo) {
        // TEST CODE
        let prevSq = selected
        let moveNext: CaptureObj = {
            nextMove: [-1, -1],
            capture: [-1, -1]
        }
        const final = isSqToMoveTo.nextMove
        const prevSqColour = grid[prevSq[0]][prevSq[1]]
        const tree = createTree(
            selected, 
            prevSqColour === "KB" || prevSqColour === "KR" ? "A" : (prevSqColour === "B" ? "U" : "D"),
            {}
        )
        const path = traverseTree(final, selected, tree, [])       
        for (let i = 0; i < path.length; i++) {
            if (i === 0) moveNext = path[0]
            grid[prevSq[0]] = grid[prevSq[0]].map((x, n) => n === prevSq[1] ? null : x) as Row
            grid[moveNext.nextMove[0]] = grid[moveNext.nextMove[0]].map((x, n) => n === moveNext.nextMove[1] ? prevSqColour : x) as Row
            if (!areArraysEqual(moveNext.capture, [-1, -1])) {
                grid[moveNext.capture[0]] = grid[moveNext.capture[0]].map((x, n) => n === moveNext.capture[1] ? null : x) as Row
            }
            prevSq = moveNext.nextMove
            moveNext = path[i]
        }
        if (moveNext.nextMove[0] === 0) grid[moveNext.nextMove[0]]
        = grid[moveNext.nextMove[0]].map((x, n) => {
            return n === moveNext.nextMove[1] 
            ? (prevSqColour === "B" ? "KB" : "KR")
            : x 
        }) as Row
        selected = [-1, -1]
        otherSelected = []
        switchPlayer()
    } else if (areArraysEqual(selected, [row, col])) {
        selected = [-1, -1]
        otherSelected = []
    } else {
        selected = [row, col]
        if (grid[row][col] === "R" && player === "R") {
            // @ts-ignore
            otherSelected = [...Object.values(createTree([row, col], "D", {}))].flat()
        } else if (grid[row][col] === "B" && player === "B") {
            // @ts-ignore
            otherSelected = [...Object.values(createTree([row, col], "U", {}))].flat()
        } else if ((grid[row][col] === "KR" && player === "R") || (grid[row][col] === "KB" && player === "B")) {
            // @ts-ignore
            otherSelected = [...Object.values(createTree([row, col], "A", {}))].flat()
        } else {
            selected = [-1, -1]
            otherSelected = []
        }
    }
    updateGrid()
}

// @ts-ignore
function areArraysEqual<T>(array1: Array<T>, array2: Array<T>) {
    return array1.length === array2.length && array1.every((elem1, ind1) => array2[ind1] === elem1)
}

// @ts-ignore
function switchPlayer() {
    player = player === "R" ? "B" : "R"
    const currentPlayerText = document.getElementById('current')
    if (currentPlayerText) currentPlayerText.innerText = `Current player: ${player === "R" ? "Red" : "Black"}`
}

// @ts-ignore
function checkWinner(): Exclude<Checker, "KB" | "KR"> | null {
    const flatGrid = grid.flat(1)
    if (!flatGrid.includes("B")) return "R"
    else if (!flatGrid.includes("R")) return "B"
    else return null
}

// @ts-ignore
function validCoordinate(coordinate: [number, number]): coordinate is Coordinate {
    return (coordinate[0] >= 0 && coordinate[0] <= 7) && (coordinate[1] >= 0 && coordinate[1] <= 7)
}

// @ts-ignore
function getAllPlayerMoves(player: "R" | "B"): Array<NextCoordTree> {
    allPlayerMoves = []
    grid.forEach((row, rowInd) => {
        row.forEach((col, colInd) => {
            if (!col) return
            if (!col.endsWith(player)) return
            const checkerPossibleMoves = mapDiagonals([rowInd, colInd], (
                col === "KB" || col === "KR"
                ? "A"
                : (col === "B" ? "U" : "D")
            ))
            // @ts-ignore
            if (checkerPossibleMoves.length) allPlayerMoves.push({
                [rowInd * 8 + colInd]: checkerPossibleMoves
            })
        })
    })
    return allPlayerMoves
}

// @ts-ignore
function checkSameColour(checker1: Square, checker2: Square) {
    if (checker1 && checker2) {
        if (["B", "KB"].includes(checker1)) return ["B", "KB"].includes(checker2)
        else if (["R", "KR"].includes(checker1)) return ["R", "KR"].includes(checker2)
        else return false
    }
    else return false
}

// @ts-ignore
function traverseTree(start: Coordinate, end: Coordinate, tree: NextCoordTree, traversalArray: Array<CaptureObj>): Array<CaptureObj> {
    const keys = [...Object.keys(tree)]
    if (!keys.includes((end[0] * 8 + end[1]).toString())) return []
    if (areArraysEqual(start, end)) return traversalArray.reverse()
    else {
        const foundKey = keys.find(key => tree[key]?.some(x => areArraysEqual(x.nextMove, start)))
        if (!foundKey) return []
        const intFoundKey = parseInt(foundKey)
        const coord: Coordinate = [Math.floor(intFoundKey / 8), intFoundKey % 8]
        const nextCaptureObject = tree[foundKey].find(x => areArraysEqual(x.nextMove, start))
        if (!nextCaptureObject) return []
        traversalArray.push(nextCaptureObject)
        return traverseTree(coord, end, tree, traversalArray)
    }
}

// @ts-ignore
function createTree(start: Coordinate, dir: Direction, prevTree: NextCoordTree): NextCoordTree {
    let tempTree = prevTree
    const tempTreeKeys = [...Object.keys(tempTree)]
    const requireForceCapture = !![...Object.values(prevTree)].flat().length && [...Object.values(prevTree)].flat()
    .some(({ capture }, _, arr) => arr.length !== 0 && !areArraysEqual(capture, [-1, -1]))
    if (!tempTreeKeys.includes(String(start[0] * 8 + start[1]))) {
        // @ts-ignore
        tempTree[String(start[0] * 8 + start[1])] = mapDiagonals(start, dir)
    }
    for (let key of tempTreeKeys) {
        const nextMoves = tempTree[key]
        nextMoves.forEach(({ nextMove }) => {
            const indexAsStr = nextMove[0] * 8 + nextMove[1]
            let furtherNextMove = mapDiagonals(nextMove, dir, grid[start[0]][start[1]])
            if (requireForceCapture) furtherNextMove.filter(move => !areArraysEqual([-1, -1], move.capture))
            if (furtherNextMove.length) tempTree[indexAsStr] = furtherNextMove
        })
    }
    const allObjValues = [...Object.values(tempTree)]
    if (
        allObjValues.length && allObjValues.some(x => x.some(({ capture }) => areArraysEqual(capture, [-1, -1])))
    ) return tempTree
    if (requireForceCapture) {
        for (let key of Object.keys(tempTree)) {
            if (tempTree[key].some(x => areArraysEqual(x.capture, [-1, -1]))) tempTree[key] = []
        }
    }
    const newTree: NextCoordTree = {}
    Object.keys(prevTree).forEach(key => {
        if (!prevTree[key].length) return
        else newTree[key] = prevTree[key]
    })
    if (areArraysEqual([...Object.keys(prevTree)], tempTreeKeys)) return newTree
    else return createTree(start, dir, newTree)
}
