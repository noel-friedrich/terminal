terminal.addCommand("pwd", function() {
    terminal.printLine("/" + terminal.pathAsStr)
}, {
    description: "print the current working directory"
})

