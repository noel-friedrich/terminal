terminal.addCommand("matmul", async function() {
    await terminal.modules.import("matrix", window)

    const matrixA = await inputMatrix(await inputMatrixDimensions({matrixName: "A"}))
    terminal.addLineBreak()

    const matrixB = await inputMatrix(await inputMatrixDimensions({
        matrixName: "B", forcedRows: matrixA.dimensions.rows
    }))
    terminal.addLineBreak()

    const matrixC = matrixA.multiply(matrixB)

    terminal.printLine(`Resulting Matrix [${matrixC.dimensions}]:`)
    terminal.printLine(matrixC.toString())

}, {
    description: "multiply two matrices with each other",
})