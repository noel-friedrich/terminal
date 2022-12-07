terminal.addCommand("man", function(args) {
    let command = terminal.getFunction(args.command)
    if (command == null) {
        throw new Error(`No manual entry for ${args.command}`)
    }
    if (args.command == "man") {
        throw new Error("Recursion.")
    }
    terminal.printLine("description: \"" + command.description + "\"")
    if (command.args.length == 0) {
        terminal.printLine("args: doesn't accept any arguments")
    } else {
        getArgs({
            rawArgs: "--help",
            funcName: args.command,
        }, command.args, command.standardVals, command.argDescriptions)
    }
}, {
    description: "show the manual page for a command",
    args: {"command": "the command to show the manual page for"},
    helpVisible: true
})

