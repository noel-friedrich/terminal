terminal.addCommand("nsolve", async function(args) {
    function makeDerivative(f, h=0.0001) {
        return x => (f(x + h) - f(x)) / h
    }

    function newtonSolve(f, df, startX, n) {
        let x = startX
        for (let i = 0; i < n; i++) {
            x -= f(x) / df(x)
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
    if (error > 0.1) {
        terminal.printError("Couldn't find a solution")
    } else {
        terminal.printLine(result)
    }
}, {
    description: "solve an equation using the newton-raphson method",
    args: {
        "*e=equation:s": "the equation to solve",
        "?s=startn:n": "Starting number",
        "?i=iterations:i:1~99999": "number of iterations to perform",
    },
    defaultValues: {
        startn: 0,
        iterations: 100
    }
})