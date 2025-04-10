// @ts-ignore
type Coordinate = [number, number]
type Grid = Array<Array<number | null>>

// Initialiser variables
// @ts-ignore
let grid: Grid = Array(8).fill(Array(8).fill(null))
let numOfMines = 0
// @ts-ignore
let [time, mins, sec]: number[] = [0, 0, 0]
// @ts-ignore
let intervalSet: any = null

/**
 * The interval function is used for the time elapsed.
 * It will take the variable "time" in seconds and convert it to minutes and seconds
 */
// @ts-ignore
const interval = () => {
    mins = Math.floor(time / 60)
    sec = time % 60
    const intervalElem = document.getElementById('interval')
    if (intervalElem) intervalElem.innerText = `${mins.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
    time += 1
}

// Assign a random number of mines, between 10 and 15 INCLUSIVE
while (numOfMines < 10 || numOfMines > 15) {
    numOfMines = Math.floor(Math.random() * 64)
}

// This array will store the coordinates of all the mines
const mines: Array<Coordinate> = []

// Assign the mines to random positions
for (let n = 0; n < numOfMines; n++) {
    let randomRow = Math.floor(Math.random() * 8)
    let randomCol = Math.floor(Math.random() * 8)
    let arr = [randomRow, randomCol] as Coordinate
    while (arrayInArray(arr, mines)) {
        randomRow = Math.floor(Math.random() * 8)
        randomCol = Math.floor(Math.random() * 8)
        arr = [randomRow, randomCol]
    }
    mines.push(arr)
}

// More initialiser variables
let userSquares: Array<Coordinate> = []
let flags: Array<Coordinate> = []
let flagMode = false

/**
 * Perform an action depending on a square that has been selected
 * @param {number} square The coordinate of the square, as an integer, to update 
 * @returns {void}
 */
// @ts-ignore
function updateSquare(square: number): void {
    // Obtain row and column
    const row = Math.floor(square / 8)
    const col = square % 8

    // If flag mode is enabled, then perform the following actions
    if (flagMode) {
        const flagText = document.getElementById('flags-remaining')
        const textElem = document.getElementById('current')
        // If the element has been flagged, clicking it will unflag it
        if (arrayInArray([row, col], flags)) {
            flags = flags.filter(f => !(f[0] === row && f[1] === col))
            const unflaggedElem = document.getElementById(`sq${row * 8 + col}`)
            if (unflaggedElem) {
                unflaggedElem.setAttribute('class', 'game-square')
                unflaggedElem.innerText = '-'
            }
        } else {
            // Before the user can flag a square, we must check they haven't surpassed the maximum number of flags
            if (flags.length >= numOfMines) {
                // Inform the user that they have reached their maximum limit for flags
                if (textElem) textElem.innerText = 'You have reached your maximum number of flags.';
                Array.from(document.getElementsByClassName('game-square'))
                .forEach((elem) => elem.setAttribute('disabled', ''))
                setTimeout(() => {
                    if (textElem) textElem.innerText = 'Choose a square'
                    resetGridStyle()
                }, 2000)
            } else {
                // Otherwise, if the element hasn't been flagged, clicking it will flag it
                flags.push([row, col])
                const flaggedElem = document.getElementById(`sq${row * 8 + col}`)
                if (flaggedElem) {
                    flaggedElem.setAttribute('class', 'game-square flagged')
                    flaggedElem.innerText = 'F'
                }
            }
        }
        // Then, update the number of flags remaining
        if (flagText) flagText.innerText = `Flags Remaining: ${numOfMines - flags.length}`
    } else {
        // Perform different action depending on the condition.
        // If the element has been flagged, the user cannot select it. It is because flagging an element
        // is for the purposes of protecting the user, based on their suspicion about a mine being at this position
        if (arrayInArray([row, col], flags)) {
            const textElem = document.getElementById('current')
            const prevText = textElem?.innerText || 'Select a square';
            Array.from(document.getElementsByClassName('game-square'))
            .forEach((elem) => elem.setAttribute('disabled', ''))
            if (textElem) textElem.innerText = 'You cannot select an element that has been flagged.'
            setTimeout(() => {
                if (textElem) textElem.innerText = prevText
                resetGridStyle()
            }, 1500)
        // Otherwise check that it isn't already selected
        } else if (!arrayInArray([row, col], userSquares)) {
            // If the user clicks on a mine, it is game over for them
            if (arrayInArray([row, col], mines)) {
                Array.from(document.getElementsByClassName('game-square'))
                .forEach((elem, ind) => {
                    elem.setAttribute('disabled', '')
                    let tempRow = Math.floor(ind / 8)
                    let tempCol = ind % 8
                    if (arrayInArray([tempRow, tempCol], mines)) {
                        elem.setAttribute('class', 'game-square mine');
                        (elem as HTMLElement).innerText = 'O'
                    }
                    else elem.setAttribute('class', 'game-square selected')
                })
                document.getElementById('toggle-flag')?.setAttribute('disabled', '')
                const currentTextElem = document.getElementById('current')
                if (currentTextElem) currentTextElem.innerText = 'Game over! You lost.'
                clearInterval(intervalSet)
                return
            // Otherwise add this to userSquares
            } else {
                userSquares.push([row, col])
                const sqElem = document.getElementById(`sq${square}`)
                if (sqElem) sqElem.setAttribute('class', 'game-square selected')
                if (sqElem) sqElem.setAttribute('disabled', '')
                const nearbySquares = adjacentSquares([row, col])
                const nearbyMines = filterAdjacentSquares(nearbySquares)
                // Count the number of mines nearby and add a number, with its colour changing depending on the number
                // of nearby mines
                // Blue - 1 mine, Green - 2 mines, Orange - 3 mines, Yellow - 4 mines, Red - 5 mines, Black - 6 or more mines
                const numOfMines = nearbySquares.length - nearbyMines.length
                if (numOfMines > 0) {
                    if (sqElem) {
                        sqElem.innerText = numOfMines.toString()
                        sqElem.style.color = [
                            "blue", "green", "orange", "yellow", "red", "black"
                        ][numOfMines > 5 ? 5 : numOfMines - 1]
                    }
                }
            }
        }
    }
}

/**
 * Obtain the squares adjacent to a chosen square. This includes diagonally, horizontally and vertically adjacent squares
 * @param {Coordinate} square The square to select 
 * @returns {Array<Coordinate>}
 */
// @ts-ignore
function adjacentSquares(square: Coordinate): Array<Coordinate> {
    let adjSquares: Array<Coordinate> = []
    const rowNum = square[0]
    const colNum = square[1]

    switch (rowNum) {
        case 0:
            if (colNum === 0) adjSquares = [[0, 1], [1, 0], [1, 1]]
            else if (colNum === 7) adjSquares = [[0, 6], [1, 6], [1, 7]]
            else adjSquares = [
                [rowNum, colNum - 1], [rowNum, colNum + 1], [rowNum + 1, colNum - 1], [rowNum + 1, colNum], [rowNum + 1, colNum + 1]
            ]
            break
        case 7:
            if (colNum === 0) adjSquares = [[7, 1], [6, 1], [6, 2]]
            else if (colNum === 7) adjSquares = [[7, 6], [6, 6], [6, 7]]
            else adjSquares = [
                [rowNum, colNum - 1], [rowNum, colNum + 1], [rowNum - 1, colNum - 1], [rowNum - 1, colNum], [rowNum - 1, colNum + 1]
            ]
            break
        default:
            adjSquares = [[rowNum - 1, colNum], [rowNum + 1, colNum]]
            if (colNum !== 0) adjSquares.push([rowNum, colNum - 1], [rowNum - 1, colNum - 1], [rowNum + 1, colNum - 1])
            if (colNum !== 7) adjSquares.push([rowNum, colNum + 1], [rowNum - 1, colNum + 1], [rowNum + 1, colNum + 1])
            break
    }

    return adjSquares
}

/**
 * Filter an array of squares, returning only those that do not have a mine
 * @param {Array<Coordinate>} squaresArray The array of squares 
 * @returns {Array<Coordinate>} The filtered array of squares, which does NOT include those with a mine
 */
// @ts-ignore
function filterAdjacentSquares(squaresArray) {
    return squaresArray.filter(square => !arrayInArray(square, mines))
}

/**
 * Check if the user has won the game. This means the user has selected ALL non-mine squares without having chosen a mine.
 */
// @ts-ignore
function checkWinner() {
    if (mines.length + userSquares.length === 64) {
        Array.from(document.getElementsByClassName('game-square'))
        .forEach((elem, ind) => {
            elem.setAttribute('disabled', 'true')
            if (arrayInArray([Math.floor(ind / 8), ind % 8], mines)) {
                elem.setAttribute('class', 'game-square mine');
                (elem as HTMLElement).innerText = 'O'
            }
            else elem.setAttribute('class', 'game-square selected')
        })
        const currentTextElem = document.getElementById('current')
        if (currentTextElem) currentTextElem.innerText = 'Congratulations! You won the game.'
        clearInterval(intervalSet)
    }
}

/**
 * Reset the grid styling
 */
// @ts-ignore
function resetGridStyle() {
    (grid as Grid).forEach((row, rowInd) => {
        row.forEach((_, colInd) => {
            const ind = rowInd * 8 + colInd
            const sqElem = document.getElementById(`sq${ind}`)
            if (arrayInArray([rowInd, colInd], flags)) {
                if (sqElem) {
                    sqElem.setAttribute('class', 'game-square flagged')
                    sqElem.removeAttribute('disabled')
                    sqElem.innerText = 'F'
                }
            } else if (arrayInArray([rowInd, colInd], userSquares)) {
                if (sqElem) {
                    sqElem.setAttribute('class', 'game-square selected')
                    sqElem.setAttribute('disabled', '')
                    sqElem.innerText = '-'
                }
                const surroundingSquares = adjacentSquares([Math.floor(ind / 8), ind % 8])
                const surroundingSquaresWithMines = filterAdjacentSquares(surroundingSquares)
                const numOfMines = surroundingSquares.length - surroundingSquaresWithMines.length
                if (numOfMines > 0) {
                    if (sqElem) {
                        sqElem.innerText = numOfMines.toString()
                        sqElem.style.color = [
                            "blue", "green", "orange", "yellow", "red", "black"
                        ][numOfMines > 6 ? 6 : numOfMines - 1]
                    }
                }
            } else {
                if (sqElem) {
                    sqElem.setAttribute('class', 'game-square')
                    sqElem.removeAttribute('disabled')
                }
            }
        })
    })
}

/**
 * A utility function to check whether an array is inside of another array.
 * This means the array must be INSIDE the other array, not its elements being part of the elements of the bigger array
 * 
 * Examples:
 * [1] inside [[1]] returns true
 * [3] inside [3] returns an error, because array must be a 2D array
 * [1, 2] inside [[1, 2], [1, 3]] returns true
 * [1, 2] inside [[1, 3]] returns false
 * @param {Array<T>} searchArray A 1D array, which is to be searched 
 * @param {Array<Array<T>>} array The 2D array in which searchArray is to be searched for 
 * @returns {boolean} Whether searchArray is inside of array
 */
// @ts-ignore
function arrayInArray<T>(searchArray: Array<T>, array: Array<Array<T>>) {
    return array.some((mainArr) => mainArr.length === searchArray.length && mainArr.every((elem, ind) => searchArray[ind] === elem))
}

/**
 * Toggle between flag mode being enabled and disabled
 */
function toggleFlag() {
    // If flagMode is true, set it to false, and vice versa
    flagMode = !flagMode
    // Then update the flagMode button and display the number of flags
    // Also if flagMode is enabled, show the number of flags remaining, otherwise hide this information
    const flagButton = document.getElementById('toggle-flag')
    if (flagButton) {
        flagButton.setAttribute('class', flagMode ? 'flag-on' : 'flag-off')
        flagButton.innerText = flagMode ? 'Flag Mode On' : 'Flag Mode Off'
    }
    const flagsText = document.getElementById('flags-remaining')
    if (flagsText) flagsText.innerText = flagMode ? `Flags Remaining: ${numOfMines - flags.length}` : ''
}

intervalSet = setInterval(interval, 1000)