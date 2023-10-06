terminal.addCommand("man", async function(args) {
    if (!terminal.commandExists(args.command))
        throw new Error(`No manual entry for ${args.command}`)
    let command = await terminal.loadCommand(args.command)
    if (args.command == "man") {
        terminal.printEasterEgg("manmanEgg")
        terminal.addLineBreak()
    }

    let infoTableData = [
        ["name", command.name],
        ["author", command.author],
        ["description", command.description],
        ["is a game", command.info.isGame ? "yes" : "no"],
        ["is secret", command.info.isSecret ? "yes" : "no"]
    ]

    const hasArgs = (command.args.length === undefined)
        ? !!Object.keys(command.args).length
        : !!command.args.length

    if (!hasArgs) {
        infoTableData.push(["arguments", "doesn't accept any arguments"])
    }

    terminal.printTable(infoTableData)

    if (hasArgs) {
        let argTableData = []
        const {argOptions} = TerminalParser.parseArguments([], command)
        for (let arg of argOptions) {
            argTableData.push([
                arg.forms.join(", "), arg.optional ? "yes" : "no",
                arg.description, arg.type,
                arg.default || "/"
            ])
        }

        terminal.addLineBreak()
        terminal.printTable(argTableData, ["Argument", "Optional", "Description", "Type", "Default"])
    }
}, {
    description: "show the manual page for a command",
    args: {"command:c": "the command to show the manual page for"},
    helpVisible: true
})

