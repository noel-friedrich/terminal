terminal.addCommand("cowthink", function(args) {
    let message = args.message
    if (message.length == 0) {
        terminal.printf`${{[Color.RED]: "Error"}}: No message provided!\n`
        return
    }
    let output = String()
    output += " " + stringMul("-", message.length + 2) + "\n"
    output += "( " + message + " )\n"
    output += " " + stringMul("-", message.length + 2)
    for (let line of COW_THINK.split("\n")) {
        output += stringMul(" ", Math.min(8, message.length + 4)) + line + "\n"
    }
    terminal.printLine(output.slice(0, -3))
}, {
    description: "let the cow think something",
    args: ["*message"]
})

