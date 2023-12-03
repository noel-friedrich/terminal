terminal.addCommand("fraction", function(args) {
    let n = args.n

    let bestFraction = null
    let bestError = Infinity
    for (let denominator = 1; denominator < args.d; denominator++) {
        let numerator = Math.round(n * denominator)
        const newValue = numerator / denominator
        
        const error = Math.abs(n - newValue)

        if (error == 0) {
            bestFraction = [numerator, denominator]
            break
        }

        if (error < bestError) {
            bestError = error
            bestFraction = [numerator, denominator]
        }
    }

    const fractionN = bestFraction[0] / bestFraction[1]

    const error = fractionN - n
    terminal.print("Best result: ")
    terminal.printLine(`${bestFraction[0]}/${bestFraction[1]}`, Color.COLOR_1)

    // print comparison

    const strFractionN = fractionN.toString()
    const strN = n.toString()
    terminal.print("           = ")
    for (let i = 0; i < strFractionN.length; i++) {
        let isCorrect = false
        if (i < strN.length) {
            isCorrect = strFractionN[i] == strN[i]
        }

        const color = isCorrect ? Color.fromHex("#00ff00") : Color.ERROR
        terminal.print(strFractionN[i], Color.BLACK, {background: color})
    }
    terminal.addLineBreak()

    if (error != 0) {
        terminal.printLine(`approximate error: ${error}`)
    }
}, {
    description: "find a fraction from a decimal number",
    args: {
        "n=number:n": "number (decimal)",
        "?d=max-denominator:i:1~999999999": "maximum denominator",
    },
    defaultValues: {
        d: 1000
    }
})