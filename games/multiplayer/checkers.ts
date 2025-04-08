// @target: es2019
// These are the type definitions that are used for type checking in the program
type Checker = "B" | "R" | "KB" | "KR"
type Direction = "U" | "D" | "A"
// @ts-ignore
type Square = Checker | null
// @ts-ignore
type Coordinate = [number, number]
type Row = [Square, Square, Square, Square, Square, Square, Square, Square]
// These two type definitions below are important: 
// CaptureObj is an object that stores two attributes: nextMove and capture
// nextMove is the next move to move to. The coordinate to move from is ambiguous
// capture is the coordinate of any checkers that are captured if this move is made. If no moves are possible, this is [-1, -1]
type CaptureObj = {
    nextMove: Coordinate;
    capture: Coordinate
}
type NextCoordTree = {
    [coordinate: string]: Array<CaptureObj>
}

// @ts-ignore
// The grid is defined to be a 2x2 array of type Square = Checker | null = "R" | "B" | "KB" | "KR" | null
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

/**
 * Updates every single element of the grid in the HTML page with the corresponding element in the grid definition in this file.
 * This will also check for any winners.
 * @returns {void}
*/
// @ts-ignore
function updateGrid(): void {
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

/**
 * mapDiagonals is a function used to select a checker from a grid and return its next possible moves,
 * in one of the directions "up", "down", or "all" (meaning up and down)
 * 
 * If no enemy checkers are adjacent to the current checker, the next two diagonal squares are given as possible moves
 * If there is an enemy checker, then this is a capturing opportunity. All non-capturing opportunities are removed
 * as soon as any capturing opportunity is found.
 * 
 * @param {Coordinate} coord The coordinate of the element to start from.
 * @param {Direction} dir The direction to move in - "U" for up, "D" for down and "A" for all. Default: "A" 
 * @param {Square?} originalColour The original colour of the checker. This is used in recursions when the square at coord is null 
 * @returns {Array<CaptureObj>} The list of moves that the checker at position coord can make, along with any capturing opportunities
 */
// @ts-ignore
function mapDiagonals(coord: Coordinate, dir: Direction = "A", originalColour?: Square): Array<CaptureObj> {
    let arrDiag: CaptureObj[] = []
    const currentSq = grid[coord[0]][coord[1]]
    /**
     * This procedure is repeated:
     * 1. If direction is up or all, check top left and top right
     * 2. For top left:
     *   a. Check if it's empty
     *   b. If it's empty, this becomes the next possible move, and capture is set to [-1, -1] (no checkers are captured)
     *   c. If it's not empty, check its colour
     *   d. If the colour of this and the current checker match, this checker cannot "jump" over it, so don't add to arrDiag
     *   e. If the colours DON'T match, check the next top left square after
     *   f. If this one is empty, this is a capturing opportunity
     *   g. Otherwise, don't do anything
     * 3. Repeat steps 2(a)-2(g) for top right
     * 4. Repeat steps 2-3 for bottom right and bottom left if direction is down or all
     * 5. If ONE of the CaptureObj's has a capture attribute NOT equal to [-1, -1] then remove all with a capture attribute NOT equal to [-1, -1]
     * 6. Return the array of objects showing the next moves and any possible captures
     */
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
    // If ONE non-capturing move exists, remove ALL non-capturing moves
    // otherwise don't do anything
    if (arrDiag.some(move => !areArraysEqual([-1, -1], move.capture))) arrDiag = arrDiag
    .filter(move => !areArraysEqual([-1, -1], move.capture))
    return arrDiag
}

/**
 * updateSquare depends on the current square, the square selected, and any next possible moves
 * It will perform an action depending on the square being "updated" and the data above.
 * @param {number} sq The index of the square to update, in the form row * 8 + col, using zero-indexing
 * @returns {void}
 */
// @ts-ignore
function updateSquare(sq: number): void {
    const [row, col] = [Math.floor(sq / 8), sq % 8]
    const isSqToMoveTo = otherSelected.find(n => areArraysEqual(n.nextMove, [row, col]))
    if (!!isSqToMoveTo) {
        // If the square to update is part of the otherSelected, then move to this square, using reverse binary tree traversal
        let prevSq = selected
        let moveNext: CaptureObj = {
            nextMove: [-1, -1],
            capture: [-1, -1]
        }
        const final = isSqToMoveTo.nextMove
        const prevSqColour = grid[prevSq[0]][prevSq[1]]
        // Generate the appropriate binary tree for this move and the corresponding path
        const tree = createTree(
            selected, 
            prevSqColour === "KB" || prevSqColour === "KR" ? "A" : (prevSqColour === "B" ? "U" : "D"),
            {}
        )
        const path = traverseTree(final, selected, tree, [])
        // Go through every element of the tree 
        for (let i = 0; i < path.length; i++) {
            // In each iteration, the next move is made, and any possible capturable checkers are removed
            if (i === 0) moveNext = path[0]
            grid[prevSq[0]] = grid[prevSq[0]].map((x, n) => n === prevSq[1] ? null : x) as Row
            grid[moveNext.nextMove[0]] = grid[moveNext.nextMove[0]].map((x, n) => n === moveNext.nextMove[1] ? prevSqColour : x) as Row
            if (!areArraysEqual(moveNext.capture, [-1, -1])) {
                grid[moveNext.capture[0]] = grid[moveNext.capture[0]].map((x, n) => n === moveNext.capture[1] ? null : x) as Row
            }
            prevSq = moveNext.nextMove
            moveNext = path[i]
        }
        // If a checker has reached its opposite end of the board, upgrade it to a king checker
        if (moveNext.nextMove[0] === 0) grid[moveNext.nextMove[0]]
        = grid[moveNext.nextMove[0]].map((x, n) => {
            return n === moveNext.nextMove[1] 
            ? (prevSqColour === "B" ? "KB" : "KR")
            : x 
        }) as Row
        // "Deselect" the coordinate already selected and any other capturable squares
        // This will indicate the move has been completed
        selected = [-1, -1]
        otherSelected = []
        switchPlayer()
    // The else if and else are used to handle the toggling of a square that is repeatedly selected
    } else if (areArraysEqual(selected, [row, col])) {
        // If selected the current selected square, then deselect it
        selected = [-1, -1]
        otherSelected = []
    } else {
        // If selecting a square that has not been selected, then select it
        selected = [row, col]
        // In each of the if statements below, the array of objects of next moves is generated 
        // Then a map is used to extract only the "nextMove" possibility, as the capture is not needed
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
            // If the selected checker is empty, then automatically deselect all
            selected = [-1, -1]
            otherSelected = []
        }
    }
    // Update the grid
    updateGrid()
}

/**
 * Check if two arrays are equal. This will check if the lengths are the same and the elements match at every index
 * It will not perform type checks, although this is not necessary in an equality check.
 * 
 * Examples:
 * areArraysEqual([1, 2], [1, 2]) returns **true**
 * areArraysEqual([], []) returns **true**
 * areArraysEqual([1, 2], [3, 4]) returns **false**
 * areArraysEqual([1, 2], [1]) returns **false**
 * 
 * The generic type T is inferred from the union of the types of elements in array1 and array2.
 * @param {Array<T>} array1 The first array, which is compared with the second
 * @param {Array<T>} array2 The second array
 * @returns {boolean} Whether the two arrays are equal
 */
// @ts-ignore
function areArraysEqual<T>(array1: Array<T>, array2: Array<T>): boolean {
    return array1.length === array2.length && array1.every((elem1, ind1) => array2[ind1] === elem1)
}

/**
 * Switch players. If the current player is "red" it will toggle to "black" and vice versa.
 */
// @ts-ignore
function switchPlayer() {
    player = player === "R" ? "B" : "R"
    const currentPlayerText = document.getElementById('current')
    if (currentPlayerText) currentPlayerText.innerText = `Current player: ${player === "R" ? "Red" : "Black"}`
}

/**
 * Check the winner of the game.
 * @returns {"B" | "R" | null} The winner of the game
 */
// @ts-ignore
function checkWinner(): Exclude<Checker, "KB" | "KR"> | null {
    const flatGrid = grid.flat(1)
    if (!flatGrid.includes("B") || getAllPlayerMoves("B").length === 0) return "R"
    else if (!flatGrid.includes("R") || getAllPlayerMoves("R").length === 0) return "B"
    else return null
}

/**
 * Check if a coordinate is valid. This means its elements are within the range 0 to 7 inclusive.
 * @param {[number, number]} coordinate The coordinate, a tuple type [number, number], to be compared 
 * @returns {coordinate is Coordinate} Whether this coordinate is valid
 */
// @ts-ignore
function validCoordinate(coordinate: [number, number]): coordinate is Coordinate {
    return (coordinate[0] >= 0 && coordinate[0] <= 7) && (coordinate[1] >= 0 && coordinate[1] <= 7)
}

/**
 * Get all the possible moves that a certain player's checkers can make.
 * @param {"R" | "B"} player The player whose moves to check 
 * @returns {Array<NextCoordTree>} All the possible moves that this player can check.
 */
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
