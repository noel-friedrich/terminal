terminal.addCommand("matred", async function() {
    await terminal.modules.import("matrix", window)

    const matrix = await inputMatrix(await inputMatrixDimensions({matrixName: "A"}))
    terminal.addLineBreak()

    const swapRows = (r1, r2) => {
        terminal.addLineBreak()
        matrix.swapRows(r1, r2)
        terminal.printLine(`r${r1 + 1} <-> r${r2 + 1}`, Color.COLOR_1)
        terminal.printLine(matrix)
    }

    const scaleRow = (row, scalar) => {
        terminal.addLineBreak()
        matrix.scaleRow(row, scalar)
        terminal.printLine(`r${row + 1} * ${scalar.toSimplifiedString()}`, Color.COLOR_1)
        terminal.printLine(matrix)
    }

    const addScalarRow = (r1, r2, scalar) => {
        terminal.addLineBreak()
        matrix.addScalarRow(r1, r2, scalar)

        let operation = "+"
        if (scalar.value < 0) {
            scalar = scalar.mul(-1)
            operation = "-"    
        }

        let scalarText = scalar.toSimplifiedString()
        if (scalarText == "1") {
            scalarText = ""
        } else {
            scalarText += "*"
        }

        terminal.printLine(`r${r2 + 1} ${operation} ${scalarText}r${r1 + 1}`, Color.COLOR_1)
        
        terminal.printLine(matrix)
    }

    terminal.printLine(matrix.toString())

    if (matrix.isZeroMatrix()) {
        throw new Error("Cannot row reduce matrix with no nonzero entry.")
    }

    function isReducedColumn(columnIndex) {
        const values = matrix.getColumn(columnIndex).map(c => c.value)

        let zeroEntries = 0
        let foundOne = false
        for (let value of values) {
            if (value == 1) {
                if (foundOne) {
                    return false
                } else {
                    foundOne = true
                }
            } else if (value == 0) {
                zeroEntries++
            } else {
                return false
            }
        }

        return zeroEntries == values.length - 1
    }

    function isZeroColumnFromRow(columnIndex, rowIndex) {
        for (let i = rowIndex; i < matrix.nRows; i++) {
            if (matrix.get(i, columnIndex) != 0) {
                return false
            }
        }
        return true
    }

    reduction_loop:
    for (let it = 0; it < 1000; it++) {
        let currColumn = 0
        let pivotRow = 0

        while (matrix.isZeroColumn(currColumn) || isReducedColumn(currColumn) || isZeroColumnFromRow(currColumn, pivotRow)) {
            if (isReducedColumn(currColumn)) {
                pivotRow++
            }
            currColumn++

            if (pivotRow >= matrix.nRows || currColumn >= matrix.nCols) {
                break reduction_loop
            }
        }

        // get first non-zero-row
        let beforePivot = pivotRow
        while (matrix.get(pivotRow, currColumn) == 0) {
            pivotRow++

            if (pivotRow >= matrix.nRows) {
                break reduction_loop
            }
        }

        if (pivotRow != beforePivot) {
            swapRows(beforePivot, pivotRow)
            continue
        }

        if (matrix.get(pivotRow, currColumn) != 1) {
            scaleRow(pivotRow, new MatrixCell(1).div(matrix.getCell(pivotRow, currColumn)))
            continue
        }

        for (let otherRow = 0; otherRow < matrix.nRows; otherRow++) {
            if (otherRow == pivotRow) continue

            if (matrix.get(otherRow, currColumn) != 0) {
                addScalarRow(pivotRow, otherRow, matrix.getCell(otherRow, currColumn).mul(-1))
                continue reduction_loop
            }
        }

        break

        /* outer:
        for (let i = 0; i < matrix.nRows; i++) {
            if (matrix.get(i, i) == 1) {
                for (let j = 0; j < matrix.nRows; j++) {
                    if (i == j) continue
                    
                    if (matrix.get(j, i) != 0) {
                        addScalarRow(i, j, matrix.getCell(j, i).mul(-1))
                        finished = false
                        break outer
                    }
                }
            } else if (matrix.getCellValue(i, i) != 0) {
                scaleRow(i, new MatrixCell(1).div(matrix.getCell(i, i)))
                finished = false
                break
            }
        } */
    }

    terminal.addLineBreak()
    terminal.printLine(matrix)
}, {
    description: "reduce a given matrix to reduced row echelon form",
})