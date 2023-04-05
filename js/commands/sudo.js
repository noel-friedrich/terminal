terminal.addCommand("sudo", async function() {
    let password = await terminal.prompt("[sudo] password: ", {password: true})
    
    if (password.length < 8)
        throw new Error("Password too short")
    if (password.length > 8)
        throw new Error("Password too long")
    if (password.match(/[A-Z]/))
        throw new Error("Password must not contain uppercase letters")
    if (password.match(/[a-z]/))
        throw new Error("Password must not contain lowercase letters")
    if (password.match(/[0-9]/))
        throw new Error("Password must not contain numbers")

    function containsRepeatedCharacters(str) {
        for (let char of str) {
            if (str.replace(char, "").includes(char))
                return true
        }
        return false
    }

    if (containsRepeatedCharacters(password))
        throw new Error("Password must not contain repeated characters")

    terminal.printSuccess("Password accepted")
    terminal.printLine("You are now officially a hacker!!")
    terminal.printEasterEgg("Hacker-Egg")
}, {
    description: "try to use sudo",
    args: ["**"]
})