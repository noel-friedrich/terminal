terminal.addCommand("nsolve", async function(args) {
    function makeDerivative(f, h=0.0001) {
        return x => (f(x + h) - f(x)) / h
    }

    function newtonSolve(f, df, startX, n) {
        let x = startX
        for (let i = 0; i < n; i++) {
            const slope = df(x)
            const value = f(x)

            if (slope == 0) {
                throw new Error(`slope is zero (at x=${x})`)
            }

            if (Math.abs(value) == Infinity) {
                throw new Error(`value is infinite (at x=${x})`)
            }

            if (args.list) {
                terminal.printLine(`n(${i}) = ${x}`)
            }

            let prevX = x
            x -= f(x) / slope

            if (prevX == x) {
                break
            }
        }
        return x
    }

    if (!/^[0-9x\s\\\*\.a-z+-\^\(\)]+=[0-9x\s\\\*\.a-z+-\^\(\)]+$/.test(args.equation)) {
        terminal.printError("Invalid equation.")
        terminal.printLine("Only numbers, letters, *, +, -, ^, (, ), \\ and spaces are allowed")
        return
    }

    if (args.equation.split("=").length != 2) {
        throw new Error("More than one equation found.")
    }

    const [lhs, rhs] = args.equation.split("=")
    const f = Function("x", `return (${lhs})-(${rhs})`)
    const df = makeDerivative(f)

    const result = newtonSolve(f, df, args.startn, args.iterations)

    const error = Math.abs(f(result) - 0)
    if (error > 0.01) {
        terminal.printError("Method did not converge.", "Warning")
        terminal.printLine(`(wrong) result: ${result}`)
        terminal.printLine(`error: ${error}`)
    } else {
        terminal.printLine(result, Color.COLOR_1)
    }
}, {
    description: "solve an equation using the newton-raphson method",
    args: {
        "*e=equation:s": "the equation to solve",
        "?s=startn:n": "Starting number",
        "?i=iterations:i:1~999999": "number of iterations to perform",
        "?l=list:b": "list all intermediate values"
    },
    defaultValues: {
        startn: 0.71,
        iterations: 1000
    }
})