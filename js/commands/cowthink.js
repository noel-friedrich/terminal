const COW_SAY = ` 
o   ^__^
 o  (oo)\\_______
    (__)\       )\\/\\
        ||----w |
        ||     ||
`

terminal.addCommand("cowthink", function(args) {
    const message = args.thought
    const bubbleWidth = Math.min(40, message.length)

    function splitIntoLines(text, width=bubbleWidth) {
        let lines = []
        let line = String()
        for (let word of text.split(" ")) {
            if (line.length + word.length > width) {
                lines.push(line)
                line = String()
            }
            line += word + " "
        }
        lines.push(line)
        return lines
    }

    let lines = splitIntoLines(message).map(l => l.trim())

    let output = String()

    output += " " + stringMul("-", bubbleWidth + 2) + "\n"
    let i = 0
    for (let line of lines) {
        let leftChar = "("
        let rightChar = ")"
        i++

        if (lines.length >= 3) {
            if (i == 1) {
                leftChar = "/"
                rightChar = "\\"
            } else if (i == lines.length) {
                leftChar = "\\"
                rightChar = "/"
            }
        } else if (lines.length == 1) {
            leftChar = "("
            rightChar = ")"
        }

        output += `${leftChar} ${stringPadMiddle(line, bubbleWidth)} ${rightChar}\n`
    }
    output += " " + stringMul("-", bubbleWidth + 2) + "\n"
    output = output.slice(0, -1)
    for (let line of COW_SAY.split("\n")) {
        let amountSpaces = Math.max(4, Math.min(message.length, bubbleWidth - 20) + 4)
        output += " ".repeat(amountSpaces) + line + "\n"
    }
    terminal.printLine(output.slice(0, -3))
}, {
    description: "let the cow say something",
    args: ["*thought"]
})