let presetGrid = []
let userGrid = []
let maxRows = 0
let maxCols = 0

function gridHTML(rows, cols) {
    let gridStr = ''
    for (let r = 0; r < rows; r++) {
        gridStr += '<div class="row">\n'
        for (let c = 0; c < cols; c++) {
            gridStr += `<button class="game-square" id="sq${r * cols + c}" onclick="updateSquare(${r * maxCols + c})">-</button>\n`
        }
        gridStr += '</div>\n'
    }
    return gridStr
}

function chooseDifficulty(difficulty) {
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
    
    document.getElementById('gamebox').innerHTML = gridHTML(maxRows, maxCols)
    document.getElementById('options').setAttribute('hidden', '')
    document.getElementById('gamebox').removeAttribute('hidden')

    presetGrid = Array(maxRows).fill(Array(maxCols).fill(null))
    userGrid = Array(maxRows).fill(Array(maxCols).fill(null))

    fillRandom()
}

let chosenElements = [-1, -1]

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

function updateSquare(square) {
    const row = Math.floor(square / maxRows)
    const col = square % maxCols

    if (arrayInArray([row, col], chosenElements)) {
        const textElement = document.getElementById('current')
        const previousText = textElement.innerText
        textElement.innerText = 'You cannot choose the same square twice!';
        [...document.getElementsByClassName('game-square')]
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

function checkChosen(userSelected) {
    if (arrayInArray([-1, -1], chosenElements)) {
        const indexOfMinusOne = arrayIndexInArray([-1, -1], chosenElements)
        if (indexOfMinusOne === -1) return
        const selectedRow = Math.floor(userSelected / maxRows)
        const selectedCol = userSelected % maxCols
        chosenElements[indexOfMinusOne] = [selectedRow, selectedCol]
        const elem = document.getElementById(`sq${userSelected}`)
        elem.innerText = presetGrid[selectedRow][selectedCol]
        elem.setAttribute('class', 'game-square selected')
        if (!arrayInArray([-1, -1], chosenElements)) equalSquares()
        else document.getElementById('current').indexText = "Choose 1 more square"
    }
}

function equalSquares() {
    const textElement = document.getElementById('current')
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
            sqElem.disabled = true
            sqElem.setAttribute('class', 'game-square valid')
            userGrid[row][col] = presetGrid[row][col]
        })
        setTimeout(() => checkWinner(), 1500)
    } else {
        textElement.innerText = "Didn't match..."
        chosenElements.forEach((elem) => {
            const ind = elem[0] * maxCols + elem[1]
            document.getElementById(`sq${ind}`).setAttribute('class', 'game-square invalid')
            document.getElementById(`sq${ind}`).disabled = true
        })
        setTimeout(() => {
            chosenElements.forEach((elem) => {
                const ind = elem[0] * maxCols + elem[1]
                document.getElementById(`sq${ind}`).disabled = false
                document.getElementById(`sq${ind}`).setAttribute('class', 'game-square')
                document.getElementById(`sq${ind}`).innerText = '-'
            })
            chosenElements = [[-1, -1], [-1, -1]]
            textElement.innerText = "Choose 2 squares"
        }, 1500)
    }
}

function resetGridStyling() {
    [...document.getElementsByClassName('game-square')]
    .forEach((square) => {
        const id = square.id
        const idNum = parseInt(id.slice(2))   

        if (!!userGrid[idNum]) {
            square
            .setAttribute('class', 'game-square valid')
            .setAttribute('disabled', true)
        } else if (chosenElements.includes(idNum)) {
            square
            .setAttribute('class', 'game-square selected')
            .setAttribute('disabled', true)
        } else {
            square
            .setAttribute('class', 'game-square')
            .setAttribute('disabled', false)
        }
    })
}

function checkWinner() {
    const textElement = document.getElementById('current')

    if (!userGrid.flat().includes(null)) {
        textElement.innerText = 'Game over. You matched all the squares'
    } else {
        chosenElements = [-1, -1]
        textElement.innerText = "Choose 2 squares"
    }
}

function arrayInArray(searchArray, array) {
    return array.some((mainArr) => areArraysEqual(searchArray, mainArr))
}

function areArraysEqual(array1, array2) {
    return array1.length === array2.length && array1.every((elem1, ind1) => array2[ind1] === elem1)
}

function arrayIndexInArray(searchArray, array) {
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