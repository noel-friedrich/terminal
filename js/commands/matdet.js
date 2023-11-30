terminal.addCommand("matdet", async function() {
    await terminal.modules.import("matrix", window)

    const matrix = await inputMatrix(await inputMatrixDimensions({matrixName: "A", square: true}))
    terminal.addLineBreak()

    terminal.printLine(matrix.determinant().simplify().toSimplifiedString())

}, {
    description: "find the determinant of a matrix",
})