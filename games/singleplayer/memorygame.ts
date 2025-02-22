// @ts-ignore
let presetGrid: Array<Array<null | number>> = []
// @ts-ignore
let userGrid: Array<Array<null | number>> = []
// @ts-ignore
let [maxRows, maxCols, time, mins, sec]: number[] = [0, 0, 0, 0, 0]

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

// @ts-ignore
function gridHTML(rows: number, cols: number) {
    let gridStr = '<p id="current">Choose 2 squares</p>\n'
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

// @ts-ignore
let chosenElements = [[-1, -1], [-1, -1]]

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

// @ts-ignore
function updateSquare(square: number) {
    const row = Math.floor(square / maxRows)
    const col = square % maxCols

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
    else checkChosen(square)
}

// @ts-ignore
function checkChosen(userSelected: number) {
    if (arrayInArray([-1, -1], chosenElements)) {
        const indexOfMinusOne = arrayIndexInArray([-1, -1], chosenElements)
        if (indexOfMinusOne === -1) return
        const selectedRow = Math.floor(userSelected / maxRows)
        const selectedCol = userSelected % maxCols
        chosenElements[indexOfMinusOne] = [selectedRow, selectedCol]
        const elem = document.getElementById(`sq${userSelected}`)
        const current = document.getElementById('current')
        if (!elem) return
        elem.innerText = presetGrid[selectedRow][selectedCol]?.toString() || ''
        elem.setAttribute('class', 'game-square selected')
        if (!arrayInArray([-1, -1], chosenElements)) equalSquares()
        else {
            if (!current) return
            current.innerText = "Choose 1 more square"
        }
    }
}

// @ts-ignore
function equalSquares() {
    const textElement = document.getElementById('current')
    if (!textElement) return
    const sqRow1 = chosenElements[0][0]
    const sqCol1 = chosenElements[0][1]
    const sqRow2 = chosenElements[1][0]
    const sqCol2 = chosenElements[1][1]

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
        setTimeout(() => checkWinner(), 1500)
    } else {
        textElement.innerText = "Didn't match..."
        chosenElements.forEach((elem) => {
            const ind = elem[0] * maxCols + elem[1]
            const sqElem = document.getElementById(`sq${ind}`)
            if (sqElem) {
                sqElem.setAttribute('class', 'game-square invalid')
                sqElem.setAttribute('disabled', '')
            }
        })
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

// @ts-ignore
function resetGridStyling() {
    Array.from(document.getElementsByClassName('game-square'))
    .forEach((square) => {
        const id = square.id
        const idNum = parseInt(id.slice(2))   
        const idRow = Math.floor(idNum / maxRows)
        const idCol = idNum % maxCols

        if (!!userGrid[idNum]) {
            square.setAttribute('class', 'game-square valid')
            square.setAttribute('disabled', '')
        } else if (chosenElements.includes([idRow, idCol])) {
            square.setAttribute('class', 'game-square selected')
            square.setAttribute('disabled', '')
        } else {
            square.setAttribute('class', 'game-square')
            square.removeAttribute('disabled')
        }
    })
}

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

// @ts-ignore
function arrayInArray<T>(searchArray: Array<T>, array: Array<Array<T>>) {
    return array.some((mainArr) => areArraysEqual(searchArray, mainArr))
}

// @ts-ignore
function areArraysEqual<T>(array1: Array<T>, array2: Array<T>) {
    return array1.length === array2.length && array1.every((elem1, ind1) => array2[ind1] === elem1)
}

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