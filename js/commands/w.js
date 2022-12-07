terminal.addCommand("w", function() {
    terminal.printLine("USER   TIME_ELAPSED")
    terminal.print("root   ", Color.COLOR_1)
    terminal.printLine(((Date.now() - terminal.startTime) / 1000) + "s")
}, {
    description: "print the current time elapsed"
})

