terminal.addCommand("echo", function(rawArgs) {
    terminal.printLine(rawArgs.slice(1))
}, {
    description: "print a line of text",
    rawArgMode: true,
})