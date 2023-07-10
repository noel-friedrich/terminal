terminal.addCommand("copy", async function(rawArgs) {
    rawArgs = rawArgs.trim()
    if (terminal.parser.isVariable(rawArgs)) {
        let name = terminal.parser.extractVariableName(rawArgs + "=")
        let value = terminal.getVariableValue(name)
        await terminal.copy(value)
    } else if (terminal.fileExists(rawArgs)) {
        let file = terminal.getFile(rawArgs)
        if (file.isDirectory)
            throw new Error("Cannot copy a folder")
        await terminal.copy(file.content)
        terminal.printLine("Copied File to Clipboard ✓")
    } else {
        await terminal.copy(rawArgs)
        terminal.printLine("Copied to Clipboard ✓")
    }
}, {
    description: "copy the file content to the clipboard",
    rawArgMode: true
})