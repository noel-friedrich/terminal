terminal.addCommand("set", async function(args) {
    await terminal.modules.load("cliapi", terminal)
    const CliApi = terminal.modules.cliapi
    if (!CliApi.KEY_REGEX.test(args.key)) {
        terminal.printError("Invalid key")
        return
    }
    if (args.value.length > 255) {
        terminal.printError("Value too big in size")
        return
    }
    await CliApi.set(args.key, args.value)
    terminal.printLine("Success", Color.LIGHT_GREEN)
}, {
    description: "set a value on the server",
    args: {
        key: "the key to set the value of",
        value: "the value to set"
    },
    disableEqualsArgNotation: true
})

