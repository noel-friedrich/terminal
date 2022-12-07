terminal.addCommand("password", async function(args) {
    function generatePassword(length, characters, repeatChars) {
        let password = String()
        let tries = 0
        const maxTries = 10000
        while (password.length < length) {
            tries++
            if (tries > maxTries) {
                terminal.printf`${{[Color.RED]: "Error"}}: Impossible Config?\n`
                return password
            }
            let char = characters[Math.floor(Math.random() * characters.length)]
            if (password.length > 0 && repeatChars) {
                let lastChar = password[password.length - 1]
                if (char == lastChar)
                    continue
            }
            password += char
        }
        return password
    }
    for (let i = 0; i < args.n; i++) {
        let password = generatePassword(args.l, args.c, args.norepeat)
        if (password.length == args.l)
            terminal.printf`${{[Color.COLOR_1]: password}}\n`
        else
            break
        if (i == 0 && args.n == 1) {
            await sleep(100)
            await navigator.clipboard.writeText(password)
            terminal.printLine("Copied to Clipboard ✓")
        }
    }
}, {
    description: "Generate a random password",
    args: {
        "?l:n:1~1000": "The length of the password",
        "?c": "The characters to use in the password",
        "?norepeat": "If present, the password will not repeat characters",
        "?n:n:1~100": "Number of passwords to generate"
    },
    standardVals: {
        l: 20,
        c: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%&",
        n: 1,
        norepeat: false
    }
})

