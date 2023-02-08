terminal.addCommand("sc", async function(args) {
    if (args.command) {
        let tokens = TerminalParser.tokenize(args.command)
        if (tokens.length == 0)
            throw new Error("Command cannot be empty")
        let [commandToken, argTokens] = TerminalParser.extractCommandAndArgs(tokens)
        if (!terminal.commandExists(commandToken))
            throw new Error(`Command '${commandToken}' does not exist`)
    }

    const modeFuncs = {
        add: async function() {
            if (!args.command)
                throw new Error("Must specify a command to add")
            let commands = terminal.data.startupCommands
            if (commands.includes(args.command))
                throw new Error(`Command '${args.command}' is already in the startup commands`)
            commands.push(args.command)
            terminal.data.startupCommands = commands
            terminal.printSuccess(`Added '${args.command}' to startup commands`)
        },
        remove: async function() {
            if (!args.command)
                throw new Error("Must specify a command to remove")
            let commands = terminal.data.startupCommands
            if (!commands.includes(args.command))
                throw new Error(`Command '${args.command}' is not in the startup commands`)
            commands.splice(commands.indexOf(args.command), 1)
            terminal.data.startupCommands = commands
            terminal.printSuccess(`Removed '${args.command}' from startup commands`)
        },
        reset: async function() {
            terminal.data.resetProperty("startupCommands")
            terminal.printSuccess("Reset startup commands")
        },
        list: async function() {
            if (args.command)
                throw new Error("Cannot specify a command when listing")
            let commands = terminal.data.startupCommands
            if (commands.length == 0)
                terminal.printLine("No startup commands found")
            else {
                terminal.printLine("Startup Commands:")
                for (let command of commands) {
                    terminal.printLine(`- ${command}`)
                }
            }

            terminal.printLine()
            terminal.print("To add a command, use ")
            terminal.printLine("sc add <command>", Color.COLOR_1)
            terminal.print("To remove a command, use ")
            terminal.printLine("sc remove <command>", Color.COLOR_1)
        }
    }

    if (args.mode in modeFuncs) {
        await modeFuncs[args.mode]()
    } else {
        terminal.printError(`Unknown mode '${args.mode}'`)
    }
}, {
    description: "manage the startup commands",
    args: {
        "?mode": "'add', 'remove', 'reset' or 'list'",
        "?command": "the command to add or remove"
    },
    defaultValues: {
        mode: "list"
    }
})