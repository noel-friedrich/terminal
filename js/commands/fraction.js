terminal.addCommand("fraction", function(args) {
    let n = args.n

    function bestApproxFraction(n, maxDenominator) {
        // using continued fraction logic

        if (!Number.isFinite(n)) {
            throw new Error("n must be finite")
        }

        if (maxDenominator < 1) {
            throw new Error("maximum denominator must be positive")
        }

        // Handle sign separately
        const sign = n < 0 ? -1 : 1
        n = Math.abs(n)

        // Integer case
        if (Number.isInteger(n)) {
            return [sign * n, 1]
        }

        // Continued fraction convergents
        let h1 = 1, h0 = 0
        let k1 = 0, k0 = 1
        let x = n

        while (true) {
            const a = Math.floor(x)

            const h2 = a * h1 + h0
            const k2 = a * k1 + k0

            if (k2 > maxDenominator) {
                break
            }

            h0 = h1
            k0 = k1
            h1 = h2
            k1 = k2

            const frac = x - a
            if (frac === 0) {
                break
            }

            x = 1 / frac
        }

        // h1/k1 is the last convergent within the limit
        // h0/k0 is the one before it
        // Try the best semiconvergent that still fits
        const t = Math.floor((maxDenominator - k0) / k1)

        const num1 = h0 + t * h1
        const den1 = k0 + t * k1

        const num2 = h1
        const den2 = k1

        const err1 = Math.abs(n - num1 / den1)
        const err2 = Math.abs(n - num2 / den2)

        if (err2 <= err1) {
            return [sign * num2, den2]
        }
        return [sign * num1, den1]
    }

    const bestFraction = bestApproxFraction(n, args.d)
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
        "n=number:n": "number to be approximated",
        "?d=max-denominator:i": "maximum denominator",
    },
    defaultValues: {
        d: 1000
    },
    category: "maths"
})