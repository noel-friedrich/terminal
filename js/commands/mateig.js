terminal.addCommand("mateig", async function(args) {
    await terminal.modules.import("matrix", window)

    let matrix = null
    if (args.A) {
        matrix = Matrix.fromArray(args.A)
    } else {
        const dimensions = await inputMatrixDimensions({matrixName: "A", square: true})
        matrix = await inputMatrix(dimensions)
        terminal.addLineBreak()
    }

    // helpful for debugging
    terminal.window.m = matrix

    function powerIteration(matrix, basis, iterations=1_000) {
        let v = Matrix.vector(Array.from({length: matrix.n}).map(Math.random))
        for (let i = 0; i < iterations; i++) {
            let w = matrix.multiply(v)

            // project w orthogonal to each u in basis
            for (let u of basis) {
                const coeff = (
                    u.transpose().multiply(w).getCell(0,0).value
                    / u.transpose().multiply(u).getCell(0,0).value
                )
                w = w.add(u.scale(-coeff));
            }

            // normalize
            v = w.scale(1 / w.norm())
        }
        return v
    }

    const eigenVectors = []

    for (let i = 0; i < matrix.n; i++) {
        // find largest (in absolute terms) eigenvector and eigenvalue
        let eigenVector = powerIteration(matrix, eigenVectors)
        eigenVectors.push(eigenVector)
        
        // compute eigenvalue
        const eigenValue = (
            eigenVector.transpose().multiply(matrix.multiply(eigenVector)).getCell(0, 0).value
            / eigenVector.transpose().multiply(eigenVector).getCell(0, 0).value
        )

        eigenVector = eigenVector.scale(1 / eigenVector.getCell(0, 0).value)

        terminal.printLine(new MatrixCell(eigenValue).toSimplifiedString(), Color.COLOR_1)
        terminal.printLine(eigenVector.transpose().toString())
        terminal.addLineBreak()
    }

    // const unitMatrix = Matrix.unit(matrix.n)
    // const charPoly = x => matrix.add(unitMatrix.scale(-x)).determinant()
    // for (let x = -10; x < 10; x++) {
    //     terminal.printLine(`${x} -> ${charPoly(x)}`)
    // }
}, {
    description: "find the eigenvalues and eigenspaces of a given matrix",
    args: {
        "?A:sm": "square matrix",
    },
    isSecret: true
})