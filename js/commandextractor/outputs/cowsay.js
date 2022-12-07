terminal.addCommand("cowsay", function(args) {
    let message = args.message
    if (message.length == 0) {
        terminal.printf`${{[Color.RED]: "Error"}}: No message provided!\n`
        return
    }
    let output = String()
    output += " " + stringMul("-", message.length + 2) + "\n"
    output += "< " + message + " >\n"
    output += " " + stringMul("-", message.length + 2)
    for (let line of COW_SAY.split("\n")) {
        output += stringMul(" ", Math.min(8, message.length + 4)) + line + "\n"
    }
    terminal.printLine(output.slice(0, -3))
}, {
    description: "let the cow say something",
    args: ["*message"]
})

const COW_THINK = ` 
o   ^__^
 o  (oo)\\_______
    (__)\       )\\/\\
        ||----w |
        ||     ||
`
