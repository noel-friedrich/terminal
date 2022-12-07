terminal.addCommand("kaprekar", async function(args) {
    let startNumber = ~~args.n
    let numDigits = startNumber.toString().length

    let history = new Set([startNumber])

    function f(n) {
        let a = Array.from(n.toString())
        let b = Array.from(n.toString())

        while (a.length < numDigits)
            a.push("0")

        while (b.length < numDigits)
            b.push("0")

        a = a.sort().join("")
        b = b.sort((a, b) => b - a).join("")

        let m = b - a

        terminal.printLine(`${b} - ${a} = ${stringPad(m, numDigits, "0")}`)

        if (n === m || m === 0)
            return n

        if (history.has(m)) {
            terminal.printLine("Cycle detected!")
            return m
        }

        history.add(m)

        return f(m)
    }

    f(startNumber)

}, {
    description: "display the kaprekar steps of a number",
    args: {
        "n:n:1~999999999": "the number to display the kaprekar steps of"
    }
})

