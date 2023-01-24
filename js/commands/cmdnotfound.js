terminal.addCommand("cmdnotfound", async function([commandName, argText]) {
    const maxDistance = 2

    let commandNames = Object.keys(terminal.commandData)
    let distances = Object.fromEntries(commandNames.map(name => [name, levenshteinDistance(commandName, name)]))
    let bestMatch = commandNames.reduce((a, b) => distances[a] < distances[b] ? a : b)

    terminal.printLine(`command not found: ${commandName}`)

    if (distances[bestMatch] <= maxDistance) {
        terminal.print("did you mean: ")
        terminal.printCommand(`${bestMatch}${argText}`)
    }
}, {
    description: "display that a command was not found",
    rawArgMode: true,
    isSecret: true
})