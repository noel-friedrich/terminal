terminal.addCommand("help", function() {
    terminal.printLine("Welcome to the Help Menu!", Color.COLOR_1)
    terminal.printLine("Here are some commands to try out:\n")
    let helpCommands = ["cat", "cd", "games", "ls", "lscmds", "man", "turtlo", "easter-eggs", "contact"]
    let longestCommandLength = helpCommands.reduce((p, c) => Math.max(p, c.length), 0)
    for (let command of helpCommands.sort((a, b) => a.localeCompare(b))) {
        let spaces = strRepeat(" ", longestCommandLength - command.length + 2)
        let description = terminal.allCommands[command]
        terminal.printCommand(`  ${command}${spaces}`, command, Color.PURPLE, false)
        terminal.printLine(`${description}`)
    }
    terminal.printLine("\n(there are also A LOT of secret ones)")
}, {
    description: "shows this help menu",
})