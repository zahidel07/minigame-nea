type Player = "X" | "O"

type Square = Player | null

let current: Player = "X"

const winningCombos: Array<[number, number, number]> = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
]

const grid: Array<Square> = [
    null, null, null, null, null, null, null, null, null
]

function updateSquare(square: number): void {
    grid[square] = current
    updateGrid(grid)
}

function updateGrid(newGrid: Array<Square>) {
    for (let i = 0; i < 9; i++) {
        const button = document.getElementById(`sq${i}`) as HTMLButtonElement
        button.innerHTML = (newGrid[i] || null) as string
    }

    if (current === "X") current = "O"
    else current = "X"
}

function winner(): Player | null {
    for (let n = 0; n < winningCombos.length; n++) {
        const isConsecutive = winningCombos[n]
        .map((index) => grid[index])
        .every((val, _ind, arr) => val === arr[0])

        if (isConsecutive) {
            return current
        }
    }
    return null
}