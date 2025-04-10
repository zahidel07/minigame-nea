// @ts-ignore
type Dir = "L" | "R" | "U" | "D"

// @ts-ignore
let grid: Array<Array<number | null>> = Array(4).fill(Array(4).fill(null))

/**
 * keyListener is a function stored inside a constant which is used to listen
 * for any keyboard changes before taking in the user input and performing an action based on the above.
 * @param {KeyboardEvent} keyEvent The keyboard event 
 */
const keyListener = (keyEvent: KeyboardEvent) => {
    const keyPressed = keyEvent.code
    switch (keyPressed) {
        case "ArrowDown":
        case "KeyS":
            grid = moveGrid(grid, "D")
            break
        case "ArrowUp":
        case "KeyW":
            grid = moveGrid(grid, "U")
            break
        case "ArrowLeft":
        case "KeyA":
            grid = moveGrid(grid, "L")
            break
        case "ArrowRight":
        case "KeyD":
            grid = moveGrid(grid, "R")
            break
        default:
            break
    }
}

/**
 * Update the grid
 */
// @ts-ignore
function updateGrid() {
    setTimeout(() => {
        grid.forEach((row, rowInd) => {
            row.forEach((col, colInd) => {
                const gridElem = document.getElementById(`sq${rowInd * 4 + colInd}`)
                if (!gridElem) return
                if (col !== null) {
                    gridElem.setAttribute('class', 'game-square occupied') 
                    gridElem.innerText = col.toString()
                } else {
                    gridElem.setAttribute('class', 'game-square')
                    gridElem.innerText = '-'
                }
            })
        })
    }, 100)
    checkComplete()
}

/**
 * Add a random 2 somewhere in the grid.
 * This does not check if the grid has a space available first - this is done elsewhere in the program.
 */
function addRandom() {
    let randomRow = Math.floor(Math.random() * 4)
    let randomCol = Math.floor(Math.random() * 4)
    while (!!grid[randomRow][randomCol]) {
        randomRow = Math.floor(Math.random() * 4)
        randomCol = Math.floor(Math.random() * 4)
    }
    grid[randomRow] = grid[randomRow].map((elem, ind) => ind === randomCol ? 2 : elem) as [number | null, number | null, number | null, number | null]
    updateGrid()
}

/**
 * sortNums will group all numbers together and place them on the side of the array determined by dir, without changing their order.
 * It will move all "null" elements to the opposite side to dir.
 * 
 * Example
 * sortNums([1, 2, null, 3], "L") returns [1, 2, 3, null]
 * sortNums()
 * @param {Array<number | null>} arr The array to be sorted 
 * @param {Dir} dir The direction to move in. Must be "L" or "R". Default is "L" 
 * @returns {Array<number | null>} The sorted array
 */
function sortNums(arr: Array<number | null>, dir: Exclude<Dir, "U" | "D"> = "L"): Array<number | null> {
    arr = arr.sort((first, second) => {
        if (first === null && second !== null) return dir === "L" ? 1 : -1
        else if (first !== null && second === null) return dir === "L" ? -1 : 1
        else return 0
    })
    arr = mergeNums(arr, dir)
    return arr
}

/**
 * mergeNums will find pairs of equal numbers and merge them in the direction of dir.
 * If "dir" is left, the left is the merged number and the right becomes null, and if "dir" is right then the opposite occurs.
 * 
 * Example
 * mergeNums([1, 2, 3], "L") returns [1, 2, 3]
 * mergeNums([2, 2, 3, 3], "L") returns [4, null, 6, null]
 * mergeNums([0, null, 2, 2, null]) returns [0, null, null, 4, null]
 * @param {Array<number | null>} arr The array whose elements are to be merged. 
 * @param {Dir} dir The direction to move in. Must be "L" or "R". Default is "L" 
 * @returns {Array<number | null>} The merged array
 */
function mergeNums(arr: Array<number | null>, dir: Exclude<Dir, "U" | "D"> = "L"): Array<number | null> {
    let temp = arr
    for (let i = 0; i < arr.length - 1; i++) {
        const first = arr[i]
        const second = arr[i + 1]
        if (!first || !second) continue
        if (first === second) {
            const sum = first + second
            if (dir === "L") {
                arr[i] = sum
                arr[i + 1] = null
            } else {
                arr[i + 1] = sum
                arr[i] = null
            }
            i += 1
        }
    }    
    return temp
}

/**
 * Transposition. Swap the rows and colums of a 2D array
 * 
 * E.g. the transposition of 
 * [[1, 2, 3],
 *  [4, 5, 6],
 *  [7, 8, 9]]
 * will be
 * [[1, 4, 7],
 *  [2, 5, 8],
 *  [3, 6, 9]]
 * @param {Grid} arr The 2x2 array to be transposed 
 * @returns {Grid} The transposition of the array arr
 */
function transpose(arr: Array<Array<number | null>>): Array<Array<number | null>> {
    let transposedArr: Array<Array<number | null>> = []
    for (let i = 0; i < arr[0].length; i++) {transposedArr.push(arr.map(row => row[i]))}
    return transposedArr
}
// This function is useful in moving the grid up or down, because we cannot form operations on 2D arrays vertically
// So using a transposition, the rows and columns swap, meaning we can perform the operation on the column as a 1D array
// Before retransposing back to give the grid back in its original form

/**
 * moveGrid will move the grid in the specified direction, using the sortNums function. It will then add a 2 randomly if space is available
 * 
 * If "U" is specified for "dir", a transposition occurs, followed by sortNums left, followed by retransposition back.
 * If "D" is specified for "dir", a transposition occurs, followed by sortNums right, followed by retransposition back,
 * @param {Array<Array<number | null>>} currentGrid The grid to be moved 
 * @param {Dir} dir The direction to move in.
 * @returns {Array<Array<number | null>>} The grid after all elements have been moved in the specified direction
 */
function moveGrid(currentGrid: Array<Array<number | null>>, dir: Dir): Array<Array<number | null>> {
    let tempGrid = currentGrid
    switch (dir) {
        case "L":
        case "R":
            tempGrid.map((row, ind) => tempGrid[ind] = sortNums(row, dir))
            break
        case "U":
        case "D":
            tempGrid = transpose(tempGrid)
            tempGrid.map((row, ind) => tempGrid[ind] = sortNums(row, dir === "U" ? "L" : "R"))
            tempGrid = transpose(tempGrid)
            break
        default:
            break
    }
    if (checkAvailableGridSpaces()) addRandom()
    updateGrid()
    return tempGrid
}

/**
 * Returns a boolean determining if there are any empty elements
 * @returns {boolean}
 */
function checkAvailableGridSpaces() {
    return grid.flat().some(elem => elem === null)
}

/**
 * Takes in a function and determines all the squares adjacent to it, not diagonally.
 * 
 * Example: the squares adjacent to [0, 2] are [1, 2], [0, 1] and [0, 3]
 * the squares adjacent to [2, 1] are [1, 1], [3, 1], [2, 0] and [2, 3]
 * @param {[number, number]} square The coordinate of the square 
 * @returns {[number, number][]} The coordinates of all squares adjacent to it
 */
// @ts-ignore
function adjacentSquares(square: [number, number]): [number, number][] {
    let adjSquares: Array<[number, number]> = []
    const row = square[0]
    const col = square[1]

    adjSquares = [
        [row - 1, col], [row, col - 1], [row, col + 1], [row + 1, col]
    ]

    adjSquares = adjSquares.filter((sq) => {
        if (sq[0] < 0 || sq[0] > 3) return false
        else if (sq[1] < 0 || sq[1] > 3) return false
        else return true   
    })
    
    return adjSquares
}

/**
 * Check if the user has won the game. In other words, if a number equal to or greater than 2048 is generated
 * @returns {boolean}
 */
function checkComplete() {
    let isLoser = false
    let tempGrid: Array<Array<number | null>> = Array(4).fill(Array(4).fill(true))
    for (let row = 0; row < tempGrid.length; row++) {
        let rowArr: Array<[number, number]> = []
        for (let col = 0; col < grid[0].length; col++) {
            let adjSqs: any = adjacentSquares([row, col])
            adjSqs = adjSqs.map(n => grid[n[0]][n[1]])
            adjSqs = adjSqs.some(x => x === grid[row][col])
            rowArr[col] = adjSqs
        } 
        tempGrid[row] = rowArr[row]
    }

    isLoser = tempGrid
    .flat()
    .every(x => !x)

    const current = document.getElementById('current')
    if (grid.flat().some(num => num && num >= 2048)) {
        if (current) current.innerText = "Congratulations! You made 2048."
        document.body.removeEventListener("keydown", keyListener)
        return true
    } else if (isLoser) {
        if (current) current.innerText = "Game over! You didn\'t make 2048."
        document.body.removeEventListener("keydown", keyListener)
        return true
    } else return false
}

addRandom()