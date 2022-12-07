terminal.addCommand("reverse", async function(args) {
    let reversed = args.message.split("").reverse().join("")
    terminal.printLine(reversed)
    if (args.c) {
        terminal.copy(reversed)
        terminal.printLine("Copied to Clipboard ✓", Color.COLOR_1)
    }
}, {
    description: "reverse a message",
    args: {
        "*message": "the message to reverse",
        "?c": "copy the reversed message to the clipboard"
    }
})

