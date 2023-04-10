terminal.addCommand("loadall", async function(args) {
    let i = 0
    for (let command of Object.keys(terminal.allCommands)) {
        await terminal.loadCommand(command)
        terminal.print(".")
        i++
        if (i % 40 == 0) terminal.printLine()
    }
    terminal.printLine(`Loaded ${i} commands`)
}, {
    description: "preload all possible commands"
})