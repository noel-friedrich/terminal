terminal.addCommand("solve", async function(args) {
    let equation = args.equation
    if (!/^[0-9x\s\\\*\.a-z+-\^\(\)]+=[0-9x\s\\\*\.a-z+-\^\(\)]+$/.test(equation)) {
        terminal.printf`${{[Color.RED]: "Error"}}: Invalid equation!\n`
        terminal.printf`An valid equation could be: ${{[Color.COLOR_1]: "2x+4=5"}}\n`
        return
    }
    while (/[0-9]x/g.test(equation)) equation = equation.replace(/([0-9])x/g, "$1*x")
    while (/[0-9a-z]\s*\^\s*[0-9a-z]/g.test(equation)) equation = equation.replace(/([0-9a-z])\s*\^\s*([0-9a-z])/g, "$1**$2")
    let [left, right] = equation.split("=")
    let iterations = args.i
    let iterationCount = 0
    let maxIterations = args.m
    let lowerBound = args.l
    let upperBound = args.u
    try {
        var [LHS, RHS] = [Function("x", `return ${left}`), Function("x", `return ${right}`)]
    } catch {
        throw new Error("Invalid equation!")
    }
    function findSolution(minX, maxX, resolution, depth) {
        let diff = maxX - minX
        let stepSize = diff / resolution
        let lastState = LHS(minX) > RHS(maxX)
        let solutions = Array()
        for (let x = minX; x <= maxX; x += stepSize) {
            iterationCount++
            if (iterationCount > maxIterations)
                return solutions
            let currState = LHS(x) > RHS(x)
            if (currState != lastState) {
                if (depth === 1) {
                    solutions.push(x)
                } else {
                    solutions = solutions.concat(findSolution(
                        x - stepSize,
                        x + stepSize,
                        resolution,
                        depth - 1
                    ))
                }
            }
            lastState = currState
        }
        return solutions
    }
    
    let solutions = findSolution(lowerBound, upperBound, Math.round((upperBound - lowerBound) * 10), iterations)
    let roundFactor = 10 ** 3
    let shownSolutions = Array()
    let solutionCount = 0
    for (let i = 0; i < solutions.length; i++) {
        let solution = String(Math.round(solutions[i] * roundFactor) / roundFactor)
        if (shownSolutions.includes(solution)) continue
        solutionCount++
        let xName = `x${solutionCount}`
        terminal.printf`${{[Color.COLOR_1]: xName}} = ${{[Color.LIGHT_GREEN]: solution}}\n`
        shownSolutions.push(solution)
    }
    if (solutions.length == 0) {
        terminal.printf`${{[Color.RED]: "Error"}}: No solution found!\n`
    }
    if (iterationCount >= maxIterations) {
        terminal.printf`${{[Color.RED]: "Error"}}: Too many Iterations!\n`
    }
}, {
    description: "solve a mathematical equation for x",
    args: {
        "*equation": "the equation to solve",
        "?i:n:1~5": "the number of iteration-steps to perform",
        "?m:n:1~100000": "the maximum number of total iterations to perform",
        "?l:n": "the lower bound of the search interval",
        "?u:n": "the upper bound of the search interval"
    },
    standardVals: {
        i: 4,
        m: 100000,
        l: -100,
        u: 100
    }
})

