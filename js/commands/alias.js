terminal.addCommand("alias", function(args) {
    let actionCount = 0

    if (args.remove) {
        if (Object.keys(terminal.data.aliases).includes(args.remove)) {
            terminal.data.removeAlias(args.remove)
            terminal.printSuccess(`Removed alias "${args.remove}"`)
            actionCount++
        } else {
            throw new Error(`Alias "${args.remove}" not found`)
        }
    }

    if (args.show) {
        let longestAliasLength = Object.keys(terminal.data.aliases).reduce((p, c) => c.length > p ? c.length : p, 0)
        for (let [alias, command] of Object.entries(terminal.data.aliases)) {
            terminal.print(alias.padEnd(longestAliasLength + 2), Color.COLOR_1)
            terminal.printLine(command)
        }
        actionCount++
    }

    if (args.alias && args.command) {
        const alias = args.alias, command = args.command

        if (terminal.functions.map(f => f.name.toLowerCase()).includes(alias.toLowerCase())) {
            throw new Error("Command/Alias already exists!")
        }
        if (!String(alias).match(/^[a-zA-Z][-\_0-9a-zA-Z]*$/) || alias.length > 20) {
            throw new Error("Invalid alias!")
        }

        addAlias(alias, command)
        actionCount++

    } else if (args.alias || args.command) {
        terminal.print("Example: ")
        terminal.printCommand("alias hello hi")
        throw new Error("Must both provide alias and new command")
    }

    if (actionCount == 0) {
        TerminalParser.parseArgs(["--help"], this)
    }
}, {
    description: "create a new alias for a given function",
    args: {
        "?alias:s": "name of the new alias",
        "?*command:s": "name of the command to be aliased",
        "?s=show:b": "show all aliases",
        "?r=remove:s": "remove a given alias"
    }
})

