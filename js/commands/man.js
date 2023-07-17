terminal.addCommand("man", async function(args) {
    if (!terminal.commandExists(args.command))
        throw new Error(`No manual entry for ${args.command}`)
    let command = await terminal.loadCommand(args.command)
    if (args.command == "man") {
        throw new Error("Recursion.")
    }

    terminal.printTable([
        ["name", command.name],
        ["author", command.author],
        ["description", command.description],
    ])
    if (command.args.length == 0) {
        terminal.printLine("args: doesn't accept any arguments")
    } else {
        TerminalParser.parseArgs(["--help"], command)
    }
}, {
    description: "show the manual page for a command",
    args: {"command": "the command to show the manual page for"},
    helpVisible: true
})

