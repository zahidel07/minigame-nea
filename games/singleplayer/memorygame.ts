// @ts-ignore
let presetGrid: Array<Array<null | number>> = []
// @ts-ignore
let userGrid: Array<Array<null | number>> = []
// @ts-ignore
let [maxRows, maxCols, time, mins, sec]: number[] = [0, 0, 0, 0, 0]

/**
 * The interval function is used for the time elapsed.
 * It will take the variable "time" in seconds and convert it to minutes and seconds
 */
// @ts-ignore
const interval = () => {
    mins = Math.floor(time / 60)
    sec = time % 60
    const intervalElement = document.getElementById('interval')
    if (intervalElement) intervalElement.innerText = `${mins.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
    time += 1
}

// @ts-ignore
let intervalSet: any = null 

/**
 * Set up a grid with the appropriate number of rows and columns in the HTML page.
 * @param {number} rows The number of rows to add 
 * @param {number} cols The number of cols to add 
 * @returns {string} The grid, in HTML format, which is to be printed to the page
 */
// @ts-ignore
function gridHTML(rows: number, cols: number) {
    let gridStr = '<p id="current">Choose 2 squares</p>\n'
    // This is an example of polynomial time complexity or O(n²)
    for (let r = 0; r < rows; r++) {
        gridStr += '<div class="row">\n'
        for (let c = 0; c < cols; c++) {
            gridStr += `<button class="game-square" id="sq${r * cols + c}" onclick="updateSquare(${r * maxCols + c})">-</button>\n`
        }
        gridStr += '</div>\n'
    }
    gridStr += '<p>Time elapsed: <span id="interval">00:00</span></p>'
    return gridStr
}

/**
 * Select a difficulty, then set up the grid.
 * Difficulty 0: Easy, 4x5
 * Difficulty 1: Medium, 5x6
 * Difficulty 2: Hard, 6x7
 * @param {0 | 1 | 2} difficulty The difficulty to choose 
 */
// @ts-ignore
function chooseDifficulty(difficulty: 0 | 1 | 2) {
    if (difficulty === 0) {
        maxRows = 4
        maxCols = 5
    } else if (difficulty === 1) {
        maxRows = 5
        maxCols = 6
    } else {
        maxRows = 6
        maxCols = 7
    }
    
    const gameboxElem = document.getElementById('gamebox')
    const optionsElem = document.getElementById('options')
    if (gameboxElem) {
        gameboxElem.innerHTML = gridHTML(maxRows, maxCols)
        gameboxElem.removeAttribute('hidden')
    }
    if (optionsElem) optionsElem.setAttribute('hidden', '')

    presetGrid = Array(maxRows).fill(Array(maxCols).fill(null))
    userGrid = Array(maxRows).fill(Array(maxCols).fill(null))

    intervalSet = setInterval(interval, 1000)
    fillRandom()
}

// chosenElements is a 2D array, it will include two coordinates.
// [-1, -1] indicates an empty square and means that a square hasn't been selected
// Otherwise it will point to any (zero-indexed) coordinate that has been selected
// @ts-ignore
let chosenElements = [[-1, -1], [-1, -1]]

/**
 * Fill the numbers randomly. It will do so by repeatedly choosing a random row and column by checking
 * that it is not empty, before inserting a random square. It will fill from numbers 1 to 20 in these
 * random positions.
 */
// @ts-ignore
function fillRandom() {
    for (let ind = 1; ind <= presetGrid.flat().length + 1; ind++) {
        let randRow = Math.floor(Math.random() * maxRows)
        let randCol = Math.floor(Math.random() * maxCols)
        while (!!presetGrid[randRow][randCol]) {
            randRow = Math.floor(Math.random() * maxRows)    
            randCol = Math.floor(Math.random() * maxCols)
        }
        presetGrid[randRow] = presetGrid[randRow].map((elem, ind) => ind === randCol ? Math.floor(ind / 2) : elem)
    }
}

/**
 * updateSquare is used to update a square. it depends on how many of the chosenElements indexes are empty (or [-1, -1])
 * It will replace a [-1, -1] in the chosenElements with the coordinate that has been selected.
 * 
 * If two elements have been selected, it will check if both elements are matching. 
 * Whether they match or don't match, this is announced to the user before chosenElements reverts back to [[-1, -1], [-1, -1]]
 * @param {number} square The coordinate, as a number, of the selected square  
 * @returns {void}
 */
// @ts-ignore
function updateSquare(square: number) {
    const row = Math.floor(square / maxRows)
    const col = square % maxCols

    // The user cannot choose a square that has already been selected
    if (arrayInArray([row, col], chosenElements)) {
        const textElement = document.getElementById('current')
        if (!textElement) return
        const previousText = textElement.innerText
        textElement.innerText = 'You cannot choose the same square twice!';
        Array.from(document.getElementsByClassName('game-square'))
        .map((sq, ind) => {
            const sqRow = Math.floor(square / maxRows)
            const sqCol = square % maxCols
            !!userGrid[sqRow][sqCol] 
            ? sq.setAttribute('class', 'game-square valid') 
            : (ind === sqRow * maxCols + sqCol ? sq.setAttribute('class', 'game-square invalid') : sq.setAttribute('class', 'game-square locked'))
        })
        setTimeout(() => {
            textElement.innerText = previousText
            resetGridStyling()
        }, 1500)
    }
    // Otherwise, check the chosen square
    else checkChosen(square)
}

/**
 * Check the chosen square and compare against the chosenSquares variable.
 * @param {number} userSelected The coordinate, as a number, that the user has selected. This is normally passed on from the arguments in the updateSquare() function 
 * @returns {void}
 */
// @ts-ignore
function checkChosen(userSelected: number) {
    // Can only continue if the number of squares selected is not 2
    if (arrayInArray([-1, -1], chosenElements)) {
        const indexOfMinusOne = arrayIndexInArray([-1, -1], chosenElements)
        if (indexOfMinusOne === -1) return
        const selectedRow = Math.floor(userSelected / maxRows)
        const selectedCol = userSelected % maxCols
        // Replace the [-1, -1]
        chosenElements[indexOfMinusOne] = [selectedRow, selectedCol]
        const elem = document.getElementById(`sq${userSelected}`)
        const current = document.getElementById('current')
        if (!elem) return
        elem.innerText = presetGrid[selectedRow][selectedCol]?.toString() || ''
        elem.setAttribute('class', 'game-square selected')
        // Once we know that both elements in chosenSquares aren't [-1, -1], then check if they match using the equalSquares() function
        if (!arrayInArray([-1, -1], chosenElements)) equalSquares()
        // Otherwise, we know that the second element must be [-1, -1] so inform the user to select another square
        else {
            if (!current) return
            current.innerText = "Choose 1 more square"
        }
    }
}

/**
 * Check whether both squares in chosenSquares contain the exact same number. If they are,
 * consider this to be a match, otherwise inform the user that they don't match.
 * @returns {void}
 */
// @ts-ignore
function equalSquares() {
    const textElement = document.getElementById('current')
    if (!textElement) return
    // Get their rows and columns
    const sqRow1 = chosenElements[0][0]
    const sqCol1 = chosenElements[0][1]
    const sqRow2 = chosenElements[1][0]
    const sqCol2 = chosenElements[1][1]

    // This is the case where they match
    if (presetGrid[sqRow1][sqCol1] == presetGrid[sqRow2][sqCol2]) {
        textElement.innerText = "Matched!"
        chosenElements.forEach((elem, ind) => {
            const row = elem[0]
            const col = elem[1]
            const sqElem = document.getElementById(`sq${ind}`)
            if (sqElem) {
                sqElem.setAttribute('disabled', '')
                sqElem.setAttribute('class', 'game-square valid')
            }
            userGrid[row][col] = presetGrid[row][col]
        })
        // Check if the user has complete the game
        setTimeout(() => checkWinner(), 1500)
    // This is the case where they don't match
    } else {
        // Inform the user
        textElement.innerText = "Didn't match..."
        // In informing so, we must disable all elements, so that the user doesn't accidentially choose 
        // another square, causing conflicts within the program
        chosenElements.forEach((elem) => {
            const ind = elem[0] * maxCols + elem[1]
            const sqElem = document.getElementById(`sq${ind}`)
            if (sqElem) {
                sqElem.setAttribute('class', 'game-square invalid')
                sqElem.setAttribute('disabled', '')
            }
        })
        // Then reenable all elements
        setTimeout(() => {
            chosenElements.forEach((elem) => {
                const ind = elem[0] * maxCols + elem[1]
                const sqElem = document.getElementById(`sq${ind}`)
                if (sqElem) {
                    sqElem.removeAttribute('disabled')
                    sqElem.setAttribute('class', 'game-square')
                    sqElem.innerText = '-'
                }
            })
            chosenElements = [[-1, -1], [-1, -1]]
            textElement.innerText = "Choose 2 squares"
        }, 1500)
    }
}

/**
 * This isn't necessarily a reset grid styling, more of an update grid styling, it has only been 
 * named this way due to a bug in the program giving a "Duplicate Function Implementation" error
 */
// @ts-ignore
function resetGridStyling() {
    Array.from(document.getElementsByClassName('game-square'))
    .forEach((square) => {
        // Obtain the row and column of the square
        const id = square.id
        const idNum = parseInt(id.slice(2))   
        const idRow = Math.floor(idNum / maxRows)
        const idCol = idNum % maxCols

        if (!!userGrid[idRow][idCol]) {
            // The case where this is part of the matched elements
            square.setAttribute('class', 'game-square valid')
            square.setAttribute('disabled', '')
        } else if (chosenElements.includes([idRow, idCol])) {
            // The case where this has been selected
            square.setAttribute('class', 'game-square selected')
            square.setAttribute('disabled', '')
        } else {
            // The case where it has not been selected
            square.setAttribute('class', 'game-square')
            square.removeAttribute('disabled')
        }
    })
}

/**
 * Check if the user has matched all of the squares
 */
// @ts-ignore
function checkWinner() {
    const textElement = document.getElementById('current')

    if (!userGrid.flat().includes(null)) {
        if (textElement) textElement.innerText = 'Congratulations! You matched all the squares'
        clearInterval(intervalSet)
    } else {
        chosenElements = [[-1, -1], [-1, -1]]
        if (textElement) textElement.innerText = "Choose 2 squares"
    }
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
    return array.some((mainArr) => areArraysEqual(searchArray, mainArr))
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
function areArraysEqual<T>(array1: Array<T>, array2: Array<T>) {
    return array1.length === array2.length && array1.every((elem1, ind1) => array2[ind1] === elem1)
}

/**
 * Find the index of an array inside of a bigger array. This uses zero-indexing.
 * If the search array is not found inside the bigger array then the function returns -1.
 * 
 * Examples:
 * index of [-1] in [[-1]] returns 0
 * index of [2] inside [[1], [3], [2]] returns 2
 * index of [5, 2] inside [[2, 5], [5, 2]] returns 1
 * index of [2] inside [] returns -1
 * @param {Array<T>} searchArray The 1D array that is to be searched for 
 * @param {Array<Array<T>>} array The 2D array in which searchArray is to be found 
 * @returns 
 */
// @ts-ignore
function arrayIndexInArray<T>(searchArray: Array<T>, array: Array<Array<T>>) {
    if (arrayInArray(searchArray, array)) {
        let ind = 0
        for (let n = 0; n < array.length; n++) {
            if (areArraysEqual(searchArray, array[n])) {
                ind = n
                return ind
            }
            else continue
        }
        return -1
    } else return -1
}