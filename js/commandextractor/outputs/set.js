terminal.addCommand("set", async function(args) {
    if (!KEY_REGEX.test(args.key)) {
        terminal.printf`${{[Color.RED]: "Error"}}: Invalid key format!\n`
        return
    }
    if (args.value.length > 255) {
        terminal.printf`${{[Color.RED]: "Error"}}: Value too large!\n`
        return
    }
    await CliApi.set(args.key, args.value)
    terminal.printf`${{[Color.LIGHT_GREEN]: "Success"}}\n`
}, {
    description: "set a value on the server",
    args: {
        key: "the key to set the value of",
        value: "the value to set"
    }
})

