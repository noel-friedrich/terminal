terminal.addCommand("matred", async function(args) {
    await terminal.modules.import("matrix", window)

    let matrix = null
    if (args.A) {
        matrix = Matrix.fromArray(args.A)
        terminal.printLine(matrix)
    } else {
        matrix = await inputMatrix(await inputMatrixDimensions({matrixName: "A"}))
        terminal.addLineBreak()
    }

    if (!matrix.containsOnlyNumbers()) {
        throw new Error("Matrix to reduce may not include variables")
    }

    let stepNum = 1

    const swapRows = (r1, r2) => {
        terminal.addLineBreak()
        matrix.swapRows(r1, r2)
        terminal.print(`#${stepNum}: `)
        terminal.printLine(`r${r1 + 1} <-> r${r2 + 1}`, Color.COLOR_1)
        terminal.printLine(matrix)
        stepNum++
    }

    const scaleRow = (row, scalar) => {
        terminal.addLineBreak()
        matrix.scaleRow(row, scalar)
        terminal.print(`#${stepNum}: `)
        terminal.printLine(`r${row + 1} * ${scalar.toSimplifiedString()}`, Color.COLOR_1)
        terminal.printLine(matrix)
        stepNum++
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
            scalarText += "("
        }

        terminal.print(`#${stepNum}: `)
        terminal.printLine(`r${r2 + 1} ${operation} ${scalarText}r${r1 + 1}${scalarText.endsWith("(") ? ")" : ""}`, Color.COLOR_1)
        terminal.printLine(matrix)

        stepNum++
    }

    if (matrix.isZeroMatrix()) {
        throw new Error("Cannot row reduce matrix with no nonzero entry.")
    }

    function isReducedColumn(columnIndex, pivotRow) {
        const values = matrix.getColumn(columnIndex).map(c => c.value)

        let zeroEntries = 0
        let foundOne = false
        for (let i = 0; i < values.length; i++) {
            const value = values[i]
            if (value == 1) {
                if (i > pivotRow) {
                    return false
                }

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

        while (matrix.isZeroColumn(currColumn) || isReducedColumn(currColumn, pivotRow) || isZeroColumnFromRow(currColumn, pivotRow)) {
            if (isReducedColumn(currColumn, pivotRow)) {
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
    }

    if (stepNum == 1) {
        terminal.printError("Matrix is already in reduced row echelon form.")
    }
}, {
    description: "reduce a given matrix to reduced row echelon form",
    args: {
        "?A:m": "matrix to reduce",
    }
})