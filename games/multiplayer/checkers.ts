type Checker = "B" | "R" | "KB" | "KR"
type Square = Checker | null
type Coordinate = [number, number]

let grid: Array<[Square, Square, Square, Square, Square, Square, Square, Square]> = [
    ["R", null, "R", null, "R", null, "R", null],
    [null, "R", null, "R", null, "R", null, "R"],
    ["R", null, "R", null, "R", null, "R", null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, "B", null, "B", null, "B", null, "B"],
    ["B", null, "B", null, "B", null, "B", null],
    [null, "B", null, "B", null, "B", null, "B"]
]

function mapGrid() {
    grid.forEach((row, rowInd) => {
        row.forEach((col, colInd) => {
            const elem = document.getElementById(`sq${rowInd * 8 + colInd}`)
            if (!elem) return
            switch (col) {
                case "R":
                case "B":
                    elem.innerText = 'X'
                    break
                case "KR":
                case "KB":
                    elem.innerText = 'K'
                    break
                default:
                    elem.innerText = '-'       
                    break
            }
        })
    })
}