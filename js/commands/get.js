terminal.addCommand("get", async function(args) {
    await terminal.modules.load("cliapi", terminal)
    const CliApi = terminal.modules.cliapi
    if (!CliApi.KEY_REGEX.test(args.key)) {
        terminal.printError("Invalid key")
        return
    }
    let value = await CliApi.get(args.key)
    terminal.printLine(value)

    terminal.addLineBreak()
    await terminal.copy(value, {printMessage: true})
}, {
    description: "get a value from the server",
    args: {
        key: "the key to get the value of"
    },
    disableEqualsArgNotation: true
})

