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
    if (password.match(/[^a-zA-Z0-9]/))
        throw new Error("Password must not contain special characters")

    throw new Error("Password must not be a password")
}, {
    description: "try to use sudo",
    args: ["**"]
})