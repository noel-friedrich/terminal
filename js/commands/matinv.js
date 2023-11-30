terminal.addCommand("matinv", async function() {
    await terminal.modules.import("matrix", window)

    const matrix = await inputMatrix(await inputMatrixDimensions({matrixName: "A", square: true}))
    terminal.addLineBreak()

    terminal.printLine(matrix.inverse().simplify())
}, {
    description: "find the inverse of a matrix",
})