terminal.addCommand("matmin", async function(args) {
    await terminal.modules.import("matrix", window)

    let matrix = null
    if (args.A) {
        matrix = Matrix.fromArray(args.A)
    } else {
        matrix = await inputMatrix(await inputMatrixDimensions({matrixName: "A", square: true}))
        terminal.addLineBreak()
    }

    terminal.printLine(matrix.minors().simplify())
}, {
    description: "find the matrix of minors of a given matrix",
    args: {
        "?A:sm": "matrix to find minors of",
    }
})