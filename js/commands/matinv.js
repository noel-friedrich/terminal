terminal.addCommand("matinv", async function(args) {
    await terminal.modules.import("matrix", window)

    let matrix = null
    if (args.A) {
        matrix = Matrix.fromArray(args.A)
    } else {
        matrix = await inputMatrix(await inputMatrixDimensions({matrixName: "A", square: true}))
        terminal.addLineBreak()
    }

    terminal.printLine(matrix.inverse().simplify())
}, {
    description: "find the inverse of a matrix",
    args: {
        "?A:sm": "matrix to invert",
    }
})