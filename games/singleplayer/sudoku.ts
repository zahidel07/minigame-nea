let currentSelected = [-1, -1]
// @ts-ignore
let grid = Array(9).fill(Array(9).fill(null))
let prefillIndexes = Array(9).fill([-1, -1])
let prefillNumbers = Array(9).fill(null)
// @ts-ignore
let [time, mins, sec] = [0, 0, 0]

const timer = () => {
    mins = Math.floor(time / 60)
    sec = time % 60
    const timerElem = document.getElementById('timer')
    if (timerElem) {
        timerElem.innerText = `${mins.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
    }
    time += 1
}

// @ts-ignore
function fillRandom() {
    let randRow = Math.floor(Math.random() * 9)
    let randCol = Math.floor(Math.random() * 9)
    let randNum = -1
    for (let n = 0; n < 9; n++) {
        while (
            grid[randRow][randCol] 
            || prefillIndexes.some(index => isInSameRowColOrBox([randRow, randCol], index) && elementsMatch([randRow, randCol], index))
            || randNum === -1
        ) {
            randRow = Math.floor(Math.random() * 9) 
            randCol = Math.floor(Math.random() * 9)
            randNum = Math.ceil(Math.random() * 9)
        }
        prefillIndexes[n] = [randRow, randCol]
        prefillNumbers[n] = randNum
        // @ts-ignore
        grid[randRow] = grid[randRow].map((elem, elemInd) => elemInd === randCol ? randNum : elem)
    }
    updateGrid()
}

// @ts-ignore
function updateSquare(square: number) {
    const sqRow = Math.floor(square / 9)
    const sqCol = square % 9
    if (sqRow === currentSelected[0] && sqCol === currentSelected[1]) {
        currentSelected = [-1, -1]
    } else {
        currentSelected = [sqRow, sqCol]
    }
    updateGrid()
}

// @ts-ignore
function updateGrid() {
    Array.from(document.getElementsByClassName('game-square'))
    .forEach((elem, elemInd) => {
        if (currentSelected[0] === -1 && currentSelected[1] === -1) {
            elem.setAttribute('class', 'game-square')
        } else {
            const rowInd = Math.floor(elemInd / 9)
            const colInd = elemInd % 9;
            (elem as HTMLElement).innerText = grid[rowInd][colInd] || ''
            if (rowInd === currentSelected[0] && colInd === currentSelected[1]) elem.setAttribute('class', 'game-square selected')
            else if (isInSameRowColOrBox(currentSelected, [rowInd, colInd])) elem.setAttribute('class', 'game-square pseudoselected')
            else elem.setAttribute('class', 'game-square')
        }
    })
}

function isInSameRowColOrBox(square1, square2) {
    return (square1[0] === square2[0])
    || (square1[1] === square2[1])
    || (Math.floor(square1[0] / 3) === Math.floor(square2[0] / 3) && Math.floor(square1[1] / 3) === Math.floor(square2[1] / 3))
}

function elementsMatch(square1: [number, number], square2: [number, number]) {
    return (!!grid[square1[0]][square1[1]] || !!grid[square2[0]][square2[1]]) && grid[square1[0]][square1[1]] === grid[square2[0]][square2[1]]
}

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

fillRandom()
setInterval(timer, 1000)