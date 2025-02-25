import * as fs from 'fs'

// @ts-ignore
type Coordinate = [number, number]
type Player = "X" | "O"
type Square = Player | null

let current: Player = "X"
let diff = 1
let winningCombos: Array<Array<Coordinate>> = []
// @ts-ignore
let grid: Array<Array<Square>> = []

// @ts-ignore
function chooseDifficulty(difficulty: 3 | 4) {
    if (difficulty === 3) {
        diff = 3
    } else {
        diff = 4
    }
    const optionsElem = document.getElementById('options')
    if (optionsElem) {
        optionsElem.setAttribute('hidden', '')
        if (difficulty === 4) {
            optionsElem.innerHTML = `<p id="current">Current player: X</p>
                <div class="row">
                    <button class="game-square" id="sq0" onclick="updateSquare(0)">-</button>
                    <button class="game-square" id="sq1" onclick="updateSquare(1)">-</button>
                    <button class="game-square" id="sq2" onclick="updateSquare(2)">-</button>
                    <button class="game-square" id="sq3" onclick="updateSquare(3)">-</button>
                </div>       
                <div class="row">
                    <button class="game-square" id="sq4" onclick="updateSquare(4)">-</button>
                    <button class="game-square" id="sq5" onclick="updateSquare(5)">-</button>
                    <button class="game-square" id="sq6" onclick="updateSquare(6)">-</button>  
                    <button class="game-square" id="sq7" onclick="updateSquare(7)">-</button>
                </div>       
                <div class="row">
                    <button class="game-square" id="sq8" onclick="updateSquare(8)">-</button>
                    <button class="game-square" id="sq9" onclick="updateSquare(9)">-</button>
                    <button class="game-square" id="sq10" onclick="updateSquare(10)">-</button>
                    <button class="game-square" id="sq11" onclick="updateSquare(11)">-</button>
                </div>
                <div class="row">
                    <button class="game-square" id="sq12" onclick="updateSquare(12)">-</button>
                    <button class="game-square" id="sq13" onclick="updateSquare(13)">-</button>
                    <button class="game-square" id="sq14" onclick="updateSquare(14)">-</button>
                    <button class="game-square" id="sq15" onclick="updateSquare(15)">-</button>
                </div>`
        }
        optionsElem.removeAttribute('hidden')
    }

    winningCombos = 
    difficulty === 3
    ? [
        [[0, 0], [0, 1], [0, 2]],
        [[1, 0], [1, 1], [1, 2]],
        [[2, 0], [2, 1], [2, 2]],
        [[0, 0], [1, 0], [2, 0]],
        [[0, 1], [1, 1], [2, 1]],
        [[0, 2], [1, 2], [2, 2]],
        [[0, 0], [1, 1], [2, 2]],
        [[2, 0], [1, 1], [0, 2]]
    ]
    : [
        [[0, 0], [0, 1], [0, 2], [0, 3]], 
        [[1, 0], [1, 1], [1, 2], [1, 3]], 
        [[2, 0], [2, 1], [2, 2], [2, 3]], 
        [[3, 0], [3, 1], [3, 2], [3, 3]],
        [[0, 0], [1, 0], [2, 0], [3, 0]], 
        [[0, 1], [1, 1], [2, 1], [3, 1]], 
        [[0, 2], [1, 2], [2, 2], [3, 2]], 
        [[0, 3], [1, 3], [2, 3], [3, 3]],
        [[0, 0], [1, 1], [2, 2], [3, 3]], 
        [[3, 0], [2, 1], [1, 2], [0, 3]]
    ]

    grid = Array(difficulty).fill(Array(difficulty).fill(null))
}

// @ts-ignore
function updateSquare(square: number) {
    const row = Math.floor(square / diff)
    const col = square % diff
    // @ts-ignore
    grid[row] = grid[row].map((elem: Square, ind) => ind === col ? current : elem)
    updateGrid(grid)
}

function updateGrid(newGrid: Array<Array<Square>>) {
    for (let row = 0; row < diff; row++) {
        for (let col = 0; col < diff; col++) {
            const button = document.getElementById(`sq${row * diff + col}`)
            if (button) {
                button.innerText = newGrid[row][col]?.toString() || '-'
                if (button.innerText !== "-") button.setAttribute("disabled", "true")
                else button.removeAttribute('disabled')
            }
        }
    }

    const isThereWinner = winner()

    if (isThereWinner) {
        Array.from(document.getElementsByClassName("game-square"))
        .forEach((elem) => elem.setAttribute('disabled', ''))
    } else {
        current = (current === "X" ? "O" : "X")
        const currentPlayer = document.getElementById("current")
        if (currentPlayer) currentPlayer.innerText = `Next player: ${current}`
    }
}

function winner() {
    if (grid.every(val => val.every(n => !!n))) {
        const currentElem = document.getElementById('current')
        if (currentElem) currentElem.innerText = "Draw!"
        return true
    } else if (winningCombos.some(combo => {
        const mapping = combo.map(index => grid[index[0]][index[1]])
        const isMatch = mapping.every((elem, _, arr) => !!arr[0] && elem === arr[0])
        if (isMatch) {
                combo.forEach(n => document.getElementById(`sq${n[0] * diff + n[1]}`)?.setAttribute('style', 'color: blue;'))
                const currentElem = document.getElementById('current')
                if (currentElem) currentElem.innerText = `The winner is: ${current}`
                return true
            } else return false
        })
    ) return true
    else return false
}