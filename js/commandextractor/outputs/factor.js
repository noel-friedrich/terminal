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

    if (args.n != undefined) {
        printFactors(args.n)
        return
    }

    terminal.printLine("Type a number to factorize it.")

    while (true) {
        let text = await terminal.prompt()
        for (let word of text.trim().split(" ").map(w => w.trim()).filter(w => w.length > 0)) {
            if (word.length == 0 || isNaN(word)) {
                terminal.printf`${{[Color.WHITE]: word}}: Invalid number!\n`
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
        n: undefined
    }
})

class CliApi {

    static urlBase = "api/"

    static async get(name) {
        let url = `${CliApi.urlBase}get.php?key=${encodeURIComponent(name)}`
        return await fetch(url).then(response => response.text())
    }

    static async set(name, value) {
        let url = `${CliApi.urlBase}set.php`
        return await fetch(`${url}?key=${encodeURIComponent(name)}&value=${encodeURIComponent(value)}`)
    }

}

const KEY_REGEX = /^[a-zA-Z\_\-][a-zA-Z\_\-0-9\#\~]*$/

