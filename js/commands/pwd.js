terminal.addCommand("pwd", function() {
    terminal.printLine("/" + terminal.fileSystem.pathStr)
}, {
    description: "print the current working directory"
})

