const COW_SAY = ` 
\\   ^__^
 \\  (oo)\\_______
    (__)\       )\\/\\
        ||----w |
        ||     ||
`

terminal.addCommand("cowsay", function(args) {
    let message = args.message
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