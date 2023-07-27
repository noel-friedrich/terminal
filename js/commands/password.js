terminal.addCommand("password", async function(args) {
    function generatePassword(length, characters, repeatChars) {
        let password = String()
        let tries = 0
        const maxTries = 10000
        while (password.length < length) {
            tries++
            if (tries > maxTries) {
                terminal.printError("Could not generate password!")
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

    let password = generatePassword(args.l, args.c, args.norepeat)

    if (args.diverse) {
        let allLowerCaseLetters = "abcdefghijklmnopqrstuvwxyz"
        let allUpperCaseLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        let allNumbers = "0123456789"
        let allSpecialChars = "$#@%&!?.,;:[]{}()_-+=*"

        if (args.l < 4) {
            throw new Error("Password length must be at least 4 to use the diverse option!")
        }

        function isValidPassword(password) {
            return (
                allLowerCaseLetters.split("").some(char => password.includes(char)) &&
                allUpperCaseLetters.split("").some(char => password.includes(char)) &&
                allNumbers.split("").some(char => password.includes(char)) &&
                allSpecialChars.split("").some(char => password.includes(char))
            )
        }

        if (isValidPassword(args.c)) {
            let i = 0
            let maxTries = 1000
            for (; i < maxTries; i++) {
                password = generatePassword(args.l, args.c, args.norepeat)
                if (isValidPassword(password))
                    break
            }

            if (i == maxTries) {
                throw new Error("Failed to generate a diverse password! Try increasing the length.")
            }
        } else {
            throw new Error("Could not generate a diverse password!\nThe characters you provided are not diverse enough.")
        }
    }

    terminal.printLine(password)
    if (!args.nocopy) {
        await terminal.copy(password)
        terminal.printLine("Copied to Clipboard ✓")
    }
}, {
    description: "Generate a random password",
    args: {
        "?l=length:i:1~9999": "The length of the password",
        "?c=chars:s": "The characters to use in the password",
        "?norepeat:b": "If present, the password will not repeat characters",
        "?nocopy:b": "Do not copy the password to the clipboard",
        "?d=diverse:b": "Use at least one special character, number, and uppercase letter",
    },
    standardVals: {
        l: 20,
        c: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%&!?.,;:[]{}()_-+=*",
    }
})

