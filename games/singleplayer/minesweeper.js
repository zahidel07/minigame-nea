let grid = Array(8).fill(Array(8).fill(null))
let numOfMines = 0
let time = 0
let mins = 0
let sec = 0

const timer = () => {
    mins = Math.floor(time / 60)
    sec = time % 60
    document.getElementById('timer').innerText = `${mins.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
    time += 1
}

while (numOfMines < 10 || numOfMines > 15) {
    numOfMines = Math.floor(Math.random() * 64)
}

const mines = []

for (let n = 0; n < numOfMines; n++) {
    let randomRow = Math.floor(Math.random() * 8)
    let randomCol = Math.floor(Math.random() * 8)
    arr = [randomRow, randomCol]
    while (arrayInArray(arr, mines)) {
        randomRow = Math.floor(Math.random() * 8)
        randomCol = Math.floor(Math.random() * 8)
        arr = [randomRow, randomCol]
    }
    mines.push(arr)
}

let userSquares = []
let flags = []
let flagMode = false

function updateSquare(square) {
    const row = Math.floor(square / 8)
    const col = square % 8

    if (flagMode) {
        const flagText = document.getElementById('flags-remaining')
        const textElem = document.getElementById('current')
        if (arrayInArray([row, col], flags)) {
            flags = flags.filter(f => !(f[0] === row && f[1] === col))
            const unflaggedElem = document.getElementById(`sq${row * 8 + col}`)
            unflaggedElem.setAttribute('class', 'game-square')
            unflaggedElem.innerText = '-'
        } else {
            if (flags.length >= numOfMines) {
                textElem.innerText = 'You have reached your maximum number of flags.';
                [...document.getElementsByClassName('game-square')]
                .forEach((elem) => elem.setAttribute('disabled', ''))
                setTimeout(() => {
                    textElem.innerText = 'Choose a square'
                    resetGridStyle()
                }, 2000)
            } else {
                flags.push([row, col])
                const flaggedElem = document.getElementById(`sq${row * 8 + col}`)
                flaggedElem.setAttribute('class', 'game-square flagged')
                flaggedElem.innerText = 'F'
            }
        }
        flagText.innerText = `Flags Remaining: ${numOfMines - flags.length}`
    } else {
        if (arrayInArray([row, col], flags)) {
            const textElem = document.getElementById('current')
            const prevText = textElem.innerText;
            [...document.getElementsByClassName('game-square')]
            .forEach((elem) => elem.setAttribute('disabled', ''))
            textElem.innerText = 'You cannot select an element that has been flagged.'
            setTimeout(() => {
                textElem.innerText = prevText
                resetGridStyle()
            }, 1500)
        } else if (!arrayInArray([row, col], userSquares)) {
            if (arrayInArray([row, col], mines)) {
                [...document.getElementsByClassName('game-square')]
                .forEach((elem, ind) => {
                    elem.setAttribute('disabled', '')
                    tempRow = Math.floor(ind / 8)
                    tempCol = ind % 8
                    if (arrayInArray([tempRow, tempCol], mines)) {
                        elem.setAttribute('class', 'game-square mine')
                        elem.innerText = 'X'
                    }
                    else elem.setAttribute('class', 'game-square selected')
                })
                document.getElementById('toggle-flag').setAttribute('disabled', '')
                document.getElementById('current').innerText = 'Game over! You lost.'
                clearInterval(timer)
                return
            } else {
                userSquares.push([row, col])
                const sqElem = document.getElementById(`sq${square}`)
                sqElem.setAttribute('class', 'game-square selected')
                sqElem.setAttribute('disabled', '')
                const nearbySquares = adjacentSquares([row, col])
                const nearbyMines = filterAdjacentSquares(nearbySquares)
                const numOfMines = nearbySquares.length - nearbyMines.length
                if (numOfMines > 0) {
                    sqElem.innerText = numOfMines
                    sqElem.style.color = [
                        "blue", "green", "orange", "yellow", "red", "black"
                    ][numOfMines > 5 ? 5 : numOfMines - 1]
                }
            }
        }
    }
}

function adjacentSquares(square) {
    let adjSquares = []
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

function filterAdjacentSquares(squaresArray) {
    return squaresArray.filter(square => !arrayInArray(square, mines))
}

function checkWinner() {
    if (mines.length + userSquares.length === 64) {
        [...document.getElementsByClassName('game-square')]
        .forEach((elem, ind) => {
            elem.setAttribute('disabled', 'true')
            if (arrayInArray([Math.floor(ind / 8), ind % 8], mines)) {
                elem.setAttribute('class', 'game-square mine')
                elem.innerText = 'X'
            }
            else elem.setAttribute('class', 'game-square selected')
        })
        document.getElementById('current').innerText = 'Congratulations! You won the game.'
        clearInterval(timer)
    }
}

function resetGridStyle() {
    grid.forEach((row, rowInd) => {
        row.forEach((col, colInd) => {
            const ind = rowInd * 8 + colInd
            const sqElem = document.getElementById(`sq${ind}`)
            if (arrayInArray([rowInd, colInd], flags)) {
                sqElem.setAttribute('class', 'game-square flagged')
                sqElem.removeAttribute('disabled')
                sqElem.innerText = 'F'
            } else if (arrayInArray([rowInd, colInd], userSquares)) {
                sqElem.setAttribute('class', 'game-square selected')
                sqElem.setAttribute('disabled', '')
                sqElem.innerText = '-'
                const surroundingSquares = adjacentSquares([Math.floor(ind / 8), ind % 8])
                const surroundingSquaresWithMines = filterAdjacentSquares(surroundingSquares)
                const numOfMines = surroundingSquares.length - surroundingSquaresWithMines.length
                if (numOfMines > 0) {
                    sqElem.innerText = numOfMines
                    sqElem.style.color = [
                        "blue", "green", "orange", "yellow", "red", "black"
                    ][numOfMines > 6 ? 6 : numOfMines - 1]
                }
            } else {
                sqElem.setAttribute('class', 'game-square')
                sqElem.removeAttribute('disabled')
            }
        })
    })
}

function arrayInArray(searchArray, array) {
    return array.some((mainArr) => mainArr.length === searchArray.length && mainArr.every((elem, ind) => searchArray[ind] === elem))
}

function toggleFlag() {
    flagMode = !flagMode
    const flagButton = document.getElementById('toggle-flag')
    flagButton.setAttribute('class', flagMode ? 'flag-on' : 'flag-off')
    flagButton.innerText = flagMode ? 'Flag Mode On' : 'Flag Mode Off'
    const flagsText = document.getElementById('flags-remaining')
    if (flagsText) flagsText.innerText = flagMode ? `Flags Remaining: ${numOfMines - flags.length}` : ''
}

setInterval(timer, 1000)