terminal.addCommand("isprime", async function(args) {
    function isPrime(n) {
        if (n < 2)
            return {result: false}
        if (n === 2)
            return {result: true}
        if (n % 2 === 0)
            return {result: false, divisor: 2}
        for (let i = 3; i <= Math.sqrt(n); i += 2) {
            if (n % i === 0)
                return {result: false, divisor: i}
        }
        return {result: true}
    }

    if (args.n < 0) {
        return terminal.printLine(`${args.n} is not prime (negative numbers just aren't)`)
    } else if (args.n == 0) {
        return terminal.printLine("0 is not prime (not even composite!)")
    } else if (args.n == 1) {
        return terminal.printLine("1 is not prime (it's the identity, wouldn't make much sense)")
    } else if (args.n == 2) {
        return terminal.printLine("2 is prime (the only even prime!)")
    } else if (args.n.toString().includes("e+")) {
        return terminal.printLine("Honestly no idea, too large for me.")
    } else if (args.n == 57) {
        terminal.printEasterEgg("Grothendieck-Egg")
        return terminal.printLine("57 looks prime, but isn't")
    }

    let primeResult = isPrime(args.n)
    if (primeResult.result) {
        terminal.printLine(`${args.n} is prime`)
    } else {
        if (primeResult.divisor) {
            const m = args.n / primeResult.divisor
            terminal.printLine(`${args.n} is not prime (${primeResult.divisor} * ${m} = ${args.n})`)
        } else {
            terminal.printLine(`${args.n} is not prime`)
        }

        let n = args.n
        let distanceCount = 1
        if (args["find-next"]) {
            await sleep(10)
            while (!isPrime(++n).result) {distanceCount++}
            terminal.printLine(`the next prime is ${n} (diff=${distanceCount})`)
        }
    }
}, {
    description: "Check if a number is prime",
    args: {
        "n:i": "The number to check",
        "?f=find-next:b": "if n is not prime, find the next one"
    }
})