terminal.addCommand("primes", async function() {
    function sqrt(value) {
        if (value < 0n) {
            throw 'square root of negative numbers is not supported'
        }
    
        if (value < 2n) {
            return value;
        }
    
        function newtonIteration(n, x0) {
            const x1 = ((n / x0) + x0) >> 1n;
            if (x0 === x1 || x0 === (x1 - 1n)) {
                return x0;
            }
            return newtonIteration(n, x1);
        }
    
        return newtonIteration(value, 1n);
    }

    function isPrime(n) {
        if (n < 2n)
            return false
        if (n === 2n)
            return true
        if (n % 2n === 0n)
            return false
        for (let i = 3n; i <= sqrt(n); i += 2n) {
            if (n % i === 0n)
                return false
        }
        return true
    }

    async function lucasLehmerTest(p, n) {
        let s = 4n
        for (let i = 0n; i < p - 2n; i++) {
            s = (s ** 2n - 2n) % n
        }
        return s === 0n
    }

    terminal.printLine("Press enter to generate the next mersenne prime.")

    for (let p = 0n; p < 10000n; p++) {
        if (!isPrime(p))
            continue
        const n = 2n ** p - 1n
        if (await lucasLehmerTest(p, n)) {
            terminal.print(`(2^${p}-1) ${n}`)
            await terminal.prompt("", {printInputAfter: false})
            terminal.addLineBreak()
        }
        await sleep(0)
    }
}, {
    description: "generate mersenne primes"
})