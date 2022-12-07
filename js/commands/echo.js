terminal.addCommand("echo", function(rawArgs) {
    terminal.printLine(rawArgs)
}, {
    description: "print a line of text",
    rawArgMode: true,
})