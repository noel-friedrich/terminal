terminal.addCommand("matdet", async function(args) {
    await terminal.modules.import("matrix", window)

    let matrix = null
    if (args.A) {
        matrix = Matrix.fromArray(args.A)
    } else {
        matrix = await inputMatrix(await inputMatrixDimensions({matrixName: "A", square: true}))
        terminal.addLineBreak()
    }

    terminal.printLine(matrix.determinant().simplify().toSimplifiedString())

}, {
    description: "find the determinant of a matrix",
    args: {
        "?A:sm": "square matrix",
    }
})