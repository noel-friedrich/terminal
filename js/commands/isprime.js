terminal.addCommand("isprime", async function(args) {
    function isPrime(n) {
        if (n < 2)
            return false
        if (n === 2)
            return true
        if (n % 2 === 0)
            return false
        for (let i = 3; i <= Math.sqrt(n); i += 2) {
            if (n % i === 0)
                return false
        }
        return true
    }

    let result = isPrime(args.n)
    if (result) {
        terminal.printLine(`${args.n} is prime`)
    } else {
        terminal.printLine(`${args.n} is not prime`)
    }
}, {
    description: "Check if a number is prime",
    args: {
        "n:i": "The number to check"
    }
})