terminal.addCommand("get", async function(args) {
    if (!KEY_REGEX.test(args.key)) {
        terminal.printf`${{[Color.RED]: "Error"}}: Invalid key format!\n`
        return
    }
    let value = await CliApi.get(args.key)
    terminal.printf`${{[Color.LIGHT_GREEN]: ">>>"}} ${{[Color.WHITE]: value}}\n`
}, {
    description: "get a value from the server",
    args: {
        key: "the key to get the value of"
    }
})

