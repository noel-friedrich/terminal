terminal.addCommand("history", function() {
    for (let i = Math.max(0, terminal.prevCommands.length - 1000); i < terminal.prevCommands.length; i++) {
        terminal.printCommand(stringPad(String(i + 1), 5), `!${i + 1}`, Color.COLOR_1, false)
        terminal.printLine(`  ${terminal.prevCommands[i]}`)
    }
}, "show the last 1000 commands")

{
    terminal.addCommand("!", function(args) {
        let index = args.index - 1
        let command = terminal.prevCommands[index]
        if (command == undefined) {
            terminal.printf`${{[Color.RED]: "Error"}}: Command at index not found!\n`
            return
        }
        terminal.inputLine(command, false, false)
    }, {
        description: "run a command from history",
        args: ["index:n:1~100000"]
    })

    addAlias("runfunc", "!")
}

