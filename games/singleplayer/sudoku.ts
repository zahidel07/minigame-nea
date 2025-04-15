// Initialiser types
// @ts-ignore
type Coordinate = [number, number]

// Initialiser variables
let currentSelected: Coordinate = [-1, -1]
// @ts-ignore
let grid: (number | null)[][] = Array(9).fill(Array(9).fill(null))
// @ts-ignore
let prefillIndexes = Array(9).fill([-1, -1])
let prefillNumbers = Array(9).fill(null)
// @ts-ignore
let [time, mins, sec] = [0, 0, 0]

let everyGridCoord: Coordinate[] = []
for (let x = 0; x < 9; x++) {
    for (let y = 0; y < 9; y++) {
        everyGridCoord.push([x, y])
    }
}

/**
 * This is a function stored inside a variable that counts the number of time passed since the user started playing
 */
const timer = () => {
    mins = Math.floor(time / 60)
    sec = time % 60
    const timerElem = document.getElementById('timer')
    if (timerElem) {
        timerElem.innerText = `${mins.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
    }
    time += 1
}

/**
 * Fill the numbers randomly
 */
// @ts-ignore
function randomFillGrid(): (number | null)[][] {
    let availableCoords: Coordinate[] = []
    for (let currentNum = 1; currentNum <= 9; currentNum++) {
        availableCoords = everyGridCoord.filter(x => !grid[x[0]][x[1]])
        let [randRow, randCol]: Coordinate = [Math.floor(Math.random() * 9), Math.floor(Math.random() * 9)]
        for (let n = 0; n < 9; n++) {
            while (!availableCoords.some(x => areArraysEqual(x, [randRow, randCol]))) {
                if (availableCoords.length === 0) break;
                [randRow, randCol] = [Math.floor(Math.random() * 9), Math.floor(Math.random() * 9)] 
            }
            availableCoords = availableCoords.filter(x => {
                if (areArraysEqual(x, [randRow, randCol])) return false
                if (isInSameRowColOrBox(x, [randRow, randCol])) return false
                return true
            })
            grid[randRow] = grid[randRow].map((elem, elemInd) => elemInd === randCol ? currentNum : elem)
        }
    }
    for (let i = 0; i < 5; i++) {
        let unsortedNumbers = new Set<number>()
        let sortedNumbers = new Set<number>()
        console.log('\n' + grid
        .map((x, xi) => (xi > 0 && xi % 3 === 0 ? '------|-------|-------\n' : '') + x.map((y, yi) => !y ? (yi > 0 && yi % 3 === 0 ? '|  ' : ' ') : (yi > 0 && yi % 3 === 0 ? '| ' + y : y)).join(' '))
        .join('\n'))
        for (let num = 1; num <= 9; num++) {
            if (sortedNumbers.has(num)) continue
            let numberCoords = everyGridCoord.filter(x => grid[x[0]][x[1]] === num)
            let availableSpaces: Coordinate[] = []
            if (numberCoords.length === 9) {
                unsortedNumbers.delete(num)
                sortedNumbers.add(num)
            } else {
                sortedNumbers.delete(num)
                unsortedNumbers.add(num)
                availableSpaces = everyGridCoord
                .filter(x => !numberCoords.some(n => {
                    return areArraysEqual(n, x) || findSameRowColOrBox(n).some(r => areArraysEqual(r, x))
                }))
                if (availableSpaces.length === 1) {
                    const coordToReplace = availableSpaces[0]
                    grid[coordToReplace[0]] = grid[coordToReplace[0]].map((col, colInd) => {
                        return colInd === coordToReplace[1] ? num : col
                    })
                    numberCoords.push(coordToReplace)
                    if (numberCoords.length === 9) {
                        unsortedNumbers.delete(num)
                        sortedNumbers.add(num)
                    }
                } else {
                    availableSpaces = availableSpaces
                    .filter((x, _, arr) => {
                        const firstSameRowCol3x3 = arr.find(n => isInSameRowColOrBox(n, x))
                        return areArraysEqual(x, firstSameRowCol3x3 || [-1, -1])
                    })
                    if (availableSpaces.length === 1) {
                        const coordToReplace = availableSpaces[0]
                        grid[coordToReplace[0]] = grid[coordToReplace[0]].map((col, colInd) => {
                            return colInd === coordToReplace[1] ? num : col
                        })
                        numberCoords.push(coordToReplace)
                        if (numberCoords.length === 9) {
                            unsortedNumbers.delete(num)
                            sortedNumbers.add(num)
                        }
                    }
                }
                console.log(num, availableSpaces)
            }
        }
        console.log("Unsorted: ")
        console.log(unsortedNumbers)
        console.log("Sorted: ")
        console.log(sortedNumbers)
    }
    return grid
}

/**
 * Update a square. This will toggle between it being selected and deselected
 * @param {number} square The coordinate of the square, as an integer, to be updated 
*/
// @ts-ignore
function updateSquare(square: number) {
    const sqRow = Math.floor(square / 9)
    const sqCol = square % 9
    if (areArraysEqual(currentSelected, [sqRow, sqCol])) {
        // If it has been selected, deselect it
        currentSelected = [-1, -1]
    } else {
        // If it has been deselected, select it
        currentSelected = [sqRow, sqCol]
    }
    // Then update the grid
    updateGrid()
}

/**
 * Update the grid.
 * An element counts as "pseudoselected" if it lies within the same row, column or 3x3 box as the currently selected box.
 * If there is no selected, all pseudoselected elements are deselected.
 */
// @ts-ignore
function updateGrid() {
    Array.from(document.getElementsByClassName('game-square'))
    .forEach((elem, elemInd) => {
        if (areArraysEqual(currentSelected, [-1, -1])) {
            elem.setAttribute('class', 'game-square')
        } else {
            const rowInd = Math.floor(elemInd / 9)
            const colInd = elemInd % 9;
            (elem as HTMLElement).innerText = grid[rowInd][colInd]?.toString() || ''
            if (areArraysEqual([rowInd, colInd], currentSelected)) elem.setAttribute('class', 'game-square selected')
            // the isInSameRowColOrBox function is used to check if two squares lie within the same 3x3 box, grid or column as each other.
            else if (isInSameRowColOrBox(currentSelected, [rowInd, colInd])) elem.setAttribute('class', 'game-square pseudoselected')
            else elem.setAttribute('class', 'game-square')
        }
    })
}

/**
 * This function is used to check that they are in the same row, column or box,
 * Same row: Check that the first element of each coordinate match.
 * Same column: Check that the second element of each coordinate match.
 * Same 3x3 box: For each coordinate, divide the row and column number by 3. BOTH the first elements AND the second elements match.
 * @param {Coordinate} square1 
 * @param {Coordinate} square2 
 * @returns {boolean}
 */
function isInSameRowColOrBox(square1: Coordinate, square2: Coordinate): boolean {
    return (square1[0] === square2[0]) // Same row
    || (square1[1] === square2[1]) // Same col
    || (Math.floor(square1[0] / 3) === Math.floor(square2[0] / 3) && Math.floor(square1[1] / 3) === Math.floor(square2[1] / 3)) // Same 3x3 box
}

/**
 * Check that two elements match. Their row numbers AND column numbers must match, and either one of them must have a number inside
 * @param {Coordinate} square1 The first coordinate to check. 
 * @param {Coordinate} square2 The second coordinate to check.
 * @returns {boolean} Whether the elements of both coordinates match.
 */
function elementsMatch(square1: Coordinate, square2: Coordinate) {
    return (!!grid[square1[0]][square1[1]] || !!grid[square2[0]][square2[1]]) && grid[square1[0]][square1[1]] === grid[square2[0]][square2[1]]
}

/**
 * Generate a list of every single element that lies within the same row, column or 3x3 box as a specific element.
 * @param {Coordinate} sq The square to check
 * @returns {Coordinate[]} All elements within the same row, column or box as a specific element.
 */
function findSameRowColOrBox(sq: Coordinate): Coordinate[] {
    return grid
    .map((r, ri) => r
        .map((_, ci) => [ri, ci] as Coordinate)
        .filter(x => isInSameRowColOrBox(x, sq) && !areArraysEqual(x, sq))
    )
    .flat()
}

function checkValidity(sq: Coordinate) {
    const numAtSq = grid[sq[0]][sq[1]]
    if (!numAtSq) return true
    const otherSqs = findSameRowColOrBox(sq)
    return otherSqs
    .map(x => grid[x[0]][x[1]])
    .every(n => n != numAtSq)
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
 * Remove from one array, any items that are within the exclude array.
 * 
 * Examples:
 * [1, 2, 3] exclude [1, 2, 3] returns []
 * [1, 2, 3] exclude [1] returns [2, 3]
 * [1, 2, 3] exclude [2, 4] returns [1, 3]
 * @param {Array<T>} array The array to exclude items from
 * @param {Array<T>} exclude The list of items, whose elements will be excluded from the array parameter 
 * @returns {Array<T>} The new array, excluding elements within the exclude parameter
 */
function excludeFromArray<T>(array: Array<T>, exclude: Array<T>): Array<T> {
    return array.filter(x => !exclude.includes(x))
}

randomFillGrid()
setInterval(timer, 1000)