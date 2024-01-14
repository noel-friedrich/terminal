terminal.addCommand("cmdnotfound", async function(commandName, tokens) {
    const commandArgs = tokens[2]

    let commandNames = Object.keys(terminal.commandData)
    let distances = Object.fromEntries(commandNames.map(name => [name, levenshteinDistance(commandName, name)]))
    let bestMatch = commandNames.reduce((a, b) => distances[a] < distances[b] ? a : b)

    terminal.printLine(`command not found: ${commandName}`)

    if (distances[bestMatch] <= 2) {
        terminal.print("did you mean: ")
        terminal.printCommand(`${bestMatch}${commandArgs}`, `${bestMatch}${commandArgs}`)
    }
}, {
    description: "display that a command was not found",
    rawArgMode: true,
    isSecret: true
})