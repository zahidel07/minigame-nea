type Checker = "B" | "R" | "KB" | "KR"
// @ts-ignore
type Square = Checker | null
// @ts-ignore
type Coordinate = [number, number]
type Row = [Square, Square, Square, Square, Square, Square, Square, Square]

// @ts-ignore
let grid: Array<Row> = [
    ["R", null, "R", null, "R", null, "R", null],
    [null, "R", null, "R", null, "R", null, "R"],
    ["R", null, "R", null, "R", null, "R", null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, "B", null, "B", null, "B", null, "B"],
    ["B", null, "B", null, "B", null, "B", null],
    [null, "B", null, "B", null, "B", null, "B"]
]
// @ts-ignore
let selected: Coordinate = [-1, -1]
// @ts-ignore
let otherSelected: Array<Coordinate> = []
// @ts-ignore
let player: "R" | "B" = "B"

// @ts-ignore
function updateGrid() {
    grid.forEach((row, rowInd) => {
        row.forEach((col, colInd) => {
            const elem = document.getElementById(`sq${rowInd * 8 + colInd}`)
            if (!elem) return
            if (areArraysEqual([rowInd, colInd], selected)) {
                elem.setAttribute('class', 'game-square selected')
            } else if (otherSelected.some(a => areArraysEqual(a, [rowInd, colInd]))) {
                elem.setAttribute('class', 'game-square pseudoselected')
            } else {
                switch (col) {
                    case "R":
                        elem.innerText = 'X'
                        elem.setAttribute('class', 'game-square red')
                        break
                    case "KR":
                        elem.innerText = 'K'
                        elem.setAttribute('class', 'game-square red')
                        break
                    case "B":
                        elem.innerText = 'X'
                        elem.setAttribute('class', 'game-square black')
                        break
                    case "KB":
                        elem.innerText = 'K'
                        elem.setAttribute('class', 'game-square black')
                        break
                    default:
                        elem.innerText = ' '       
                        elem.setAttribute('class', 'game-square')
                        break
                }
            }
        })
    })

    const winner = checkWinner()
    if (!!winner) {
        grid.forEach((row, rowInd) => {
            row.forEach((_, colInd) => {
                const sq = document.getElementById(`sq${rowInd * 8 + colInd}`)
                if (!sq) return
                sq.setAttribute('disabled', '')
                sq.removeAttribute('onclick')
            })
        })
        const currText = document.getElementById('current')
        if (!currText) return
        currText.innerText = `The winner is: ${winner === "R" ? "Red" : "Black"}!`
    } 
}

// @ts-ignore
function mapDiagonals(coord: Coordinate, dir?: "U" | "D" | "A" = "A"): Array<Coordinate> {
    let arrDiag: Coordinate[] = []
    if (dir === "U" || dir === "A") arrDiag.push([coord[0] - 1, coord[1] - 1], [coord[0] - 1, coord[1] + 1])
    if (dir === "D" || dir === "A") arrDiag.push([coord[0] + 1, coord[1] - 1], [coord[0] + 1, coord[1] + 1])
    arrDiag = arrDiag
    .filter(validCoordinate)
    .filter(x => {
        const coordElem = grid[x[0]][x[1]]
        const gridElem = grid[coord[0]][coord[1]]
        if (!gridElem || !coordElem) return true
        if (["B", "KB"].includes(gridElem) && ["B", "KB"].includes(coordElem)) return false
        if (["R", "KR"].includes(gridElem) && ["R", "KR"].includes(coordElem)) return false
        if (gridElem !== coordElem) return true
        return true
    })
    return arrDiag
}

// @ts-ignore
function updateSquare(sq: number) {
    const row = Math.floor(sq / 8)
    const col = sq % 8
    const sqToMoveTo = otherSelected.find(n => areArraysEqual(n, [row, col]))
    if (!!sqToMoveTo) {
        const prev = grid[selected[0]][selected[1]]
        grid[selected[0]] = grid[selected[0]].map((x, i) => i === selected[1] ? null : x) as Row
        grid[sqToMoveTo[0]] = grid[sqToMoveTo[0]].map((x, i) => i === sqToMoveTo[1] ? prev : x) as Row
        selected = [-1, -1]
        otherSelected = []
        if (sqToMoveTo[0] === 0 && prev === "B") grid[sqToMoveTo[0]] = grid[sqToMoveTo[0]].map((x, i) => i === sqToMoveTo[1] ? "KB" : x) as Row
        if (sqToMoveTo[0] === 7 && prev === "R") grid[sqToMoveTo[0]] = grid[sqToMoveTo[0]].map((x, i) => i === sqToMoveTo[1] ? "KR" : x) as Row
        else switchPlayer()
    } else if (areArraysEqual(selected, [row, col])) {
        selected = [-1, -1]
        otherSelected = []
    } else {
        selected = [row, col]
        // UPDATE LATER
        // --
        if (grid[row][col] === "R" && player === "R") {
            otherSelected = mapDiagonals([row, col], "D") as Array<Coordinate>
        } else if (grid[row][col] === "B" && player === "B") {
            otherSelected = mapDiagonals([row, col], "U") as Array<Coordinate>
        } else if ((grid[row][col] === "KR" && player === "R") || (grid[row][col] === "KB" && player === "B")) {
            otherSelected = mapDiagonals([row, col]) as Array<Coordinate>
        } else {
            selected = [-1, -1]
            otherSelected = []
        }
        // --
    }
    updateGrid()
}

// @ts-ignore
function areArraysEqual<T>(array1: Array<T>, array2: Array<T>) {
    return array1.length === array2.length && array1.every((elem1, ind1) => array2[ind1] === elem1)
}

// @ts-ignore
function switchPlayer() {
    player = player === "R" ? "B" : "R"
    const currentPlayerText = document.getElementById('current')
    if (currentPlayerText) currentPlayerText.innerText = `Current player: ${player === "R" ? "Red" : "Black"}`
}

// @ts-ignore
function checkWinner(): Exclude<Checker, "KB" | "KR"> | null {
    const flatGrid = grid.flat(1)
    if (!flatGrid.includes("B")) return "R"
    else if (!flatGrid.includes("R")) return "B"
    else return null
}

function validCoordinate(coordinate: [number, number]): coordinate is Coordinate {
    return (coordinate[0] >= 0 && coordinate[0] <= 7) && (coordinate[1] >= 0 && coordinate[1] <= 7)
}