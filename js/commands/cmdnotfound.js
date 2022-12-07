terminal.addCommand("cmdnotfound", async function(commandName) {
    terminal.printLine(`command not found: ${commandName}`)
}, {
    description: "display that a command was not found",
    rawArgMode: true,
    isSecret: true
})