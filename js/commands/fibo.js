terminal.addCommand("fibo", function(args) {
    let a = 0
    let b = 1

    if (args.phi && args.n < 3)
        throw new Error("n must be greater than 1 when using phi")

    let lastTwo = []

    for (let i = 0; i < args.n; i++) {
        terminal.printLine(a)
        lastTwo.push(a)
        if (lastTwo.length > 2)
            lastTwo.shift()

        let c = a + b
        a = b
        b = c
    }

    if (args.phi) {
        let [a, b] = lastTwo
        terminal.printLine(`phi ≈ ${b / a}`, Color.COLOR_1)
    }
}, {
    description: "Prints the Fibonacci sequence",
    args: { 
        "?n:i:1~100": "The number of elements to print",
        "?p=phi:b": "calculate the golden ratio using the last two elements"
    },
    defaultValues: {
        n: 10
    }
})