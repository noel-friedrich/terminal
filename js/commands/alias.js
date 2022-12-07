terminal.addCommand("alias", function(args) {
    let alias = args.alias, command = args.command

    if (terminal.functions.map(f => f.name.toLowerCase()).includes(alias.toLowerCase())) {
        throw new Error("Command/Alias already exists!")
    }
    if (!String(alias).match(/^[a-zA-Z][-\_0-9a-zA-Z]*$/) || alias.length > 20) {
        throw new Error("Invalid alias!")
    }

    addAlias(alias, command)
}, {
    description: "create a new alias for a given function",
    args: {
        alias: "name of the new alias",
        command: "name of the command to be aliased"
    }
})

