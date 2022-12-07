terminal.addCommand("whatis", function(args) {
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

    let func = terminal.getFunction(args.command)
    if (func == null)
        throw new Error(`command not found: ${args.command}`)

    terminal.printLine(`${func.name}: ${func.description}`)
}, {
    description: "display a short description of a command",
    args: ["command"]
})

const START_TIME = Date.now()

