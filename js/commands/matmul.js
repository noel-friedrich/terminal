terminal.addCommand("matmul", async function(args) {
    await terminal.modules.import("matrix", window)

    let matrixA = null
    let matrixB = null

    if (args.A) {
        matrixA = Matrix.fromArray(args.A)
    } else {
        matrixA = await inputMatrix(await inputMatrixDimensions({matrixName: "A"}))
        terminal.addLineBreak()
    }

    if (args.B) {
        matrixB = Matrix.fromArray(args.B)
    } else {
        matrixB = await inputMatrix(await inputMatrixDimensions({
            matrixName: "B", forcedRows: matrixA.dimensions.columns
        }))
        terminal.addLineBreak()
    }

    if (matrixA.nCols != matrixB.nRows) {
        throw new Error("Matrix dimensions are not compatible.")
    }

    const matrixC = matrixA.multiply(matrixB).simplify()

    terminal.printLine(`Resulting Matrix [${matrixC.dimensions}]:`)
    terminal.printLine(matrixC.toString())

}, {
    description: "multiply two matrices with each other",
    args: {
        "?A:m": "matrix A",
        "?B:m": "matrix B",
    }
})