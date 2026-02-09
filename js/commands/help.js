terminal.addCommand("help", function() {
    terminal.printLine("Welcome to the Help Menu!", Color.COLOR_1)
    terminal.printLine("Here are some commands to try out:\n")
    const helpCommands = ["lscmds", "turtlo", "easter-eggs", "contact", "games", "ls", "cat", "cd"]
    let longestCommandLength = helpCommands.reduce((p, c) => Math.max(p, c.length), 0)
    for (let command of helpCommands) {
        let spaces = strRepeat(" ", longestCommandLength - command.length + 2)
        let description = terminal.allCommands[command]
        terminal.printCommand(`  ${command}${spaces}`, command, Color.COLOR_1, false)
        terminal.printLine(`${description}`)
    }
    terminal.printLine("\nThe website also emulates a real file system")
    terminal.printLine("which you can manipulate. All changes you make")
    terminal.printLine("are local. Any remaining questions? Contact me!")
}, {
    description: "shows some useful commands",
    category: "information"
})