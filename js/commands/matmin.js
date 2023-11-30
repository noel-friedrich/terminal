terminal.addCommand("matmin", async function() {
    await terminal.modules.import("matrix", window)

    const matrix = await inputMatrix(await inputMatrixDimensions({matrixName: "A", square: true}))
    terminal.addLineBreak()

    terminal.printLine(matrix.minors().simplify())
}, {
    description: "find the matrix of minors of a given matrix",
})