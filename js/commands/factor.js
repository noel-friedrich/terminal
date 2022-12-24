terminal.addCommand("factor", async function(args) {

    function primeFactors(n) {
        let i = 2
        let factors = []
        while (i * i <= n) {
            if (n % i) {
                i += 1
            } else {
                n = parseInt(n / i)
                factors.push(i)
            }
        }
        if (n > 1) {
            factors.push(n)
        }
        return factors
    }

    function printFactors(num) {
        let factors = primeFactors(num).join(" ")
        if (factors.length == 0 || isNaN(parseInt(num))) {
            terminal.printLine(`${num}: Invalid number!`)
        } else {
            terminal.print(num + ": ")
            terminal.printLine(factors, Color.COLOR_1)
        }
    }

    if (args.n != null) {
        printFactors(args.n)
        return
    }

    terminal.printLine("Type a number to factorize it.")

    while (true) {
        let text = await terminal.prompt()
        for (let word of text.trim().split(" ").map(w => w.trim()).filter(w => w.length > 0)) {
            if (word.length == 0 || isNaN(word)) {
                terminal.printLine(`${word}: Invalid number!`)
            } else {
                let num = parseInt(word)
                printFactors(num)
            }
        }
    }
}, {
    description: "print the prime factors of a number",
    args: {
        "?n:n": "number to factorize"
    },
    standardVals: {
        n: null
    }
})