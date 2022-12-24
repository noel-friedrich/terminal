terminal.addCommand("whatis", async function(args) {
    if (args.command == "*") {
        let maxFuncLength = terminal.visibleFunctions.reduce((p, c) => Math.max(p, c.name.length), 0)
        let functions = [...terminal.visibleFunctions].sort((a, b) => a.name.localeCompare(b.name))
        for (let func of functions) {
            let funcStr = stringPadBack(func.name, maxFuncLength)
            terminal.printCommand(funcStr, func.name, Color.WHITE, false)
            terminal.printLine(`  ${func.description}`)
        }
        return
    }

    if (args.command == "whatis")
        throw new Error("Recursion.")

    if (!terminal.commandExists(args.command))
        throw new Error(`command not found: ${args.command}`)

    let func = await terminal.loadCommand(args.command)
    terminal.printLine(`${func.name}: ${func.description}`)
}, {
    description: "display a short description of a command",
    args: ["command"]
})