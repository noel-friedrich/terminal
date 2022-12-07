terminal.addCommand("history", function(args) {
    let output = ""
    for (let i = Math.max(0, terminal.prevCommands.length - args.l); i < terminal.prevCommands.length; i++) {
        output += `${i + 1}: ${terminal.prevCommands[i]}\n`
    }
    terminal.printLine(output.slice(0, -1))
}, {
    description: "print the command history",
    args: {
        "?l=limit:n:1~100000": "the maximum number of commands to print"
    },
    standardVals: {
        l: 1000
    }
})