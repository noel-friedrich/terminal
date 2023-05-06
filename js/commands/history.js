terminal.addCommand("history", function(args) {
    let sliceLimit = args["show-full"] ? Infinity : 50
    let output = ""
    for (let i = Math.max(0, terminal.prevCommands.length - args.l); i < terminal.prevCommands.length; i++) {
        if (terminal.prevCommands[i].length >= sliceLimit) {
            output += `${i + 1}: ${terminal.prevCommands[i].slice(0, sliceLimit)} [...]\n`
        } else {
            output += `${i + 1}: ${terminal.prevCommands[i]}\n`
        }
    }
    terminal.printLine(output.slice(0, -1))
}, {
    description: "print the command history",
    args: {
        "?l=limit:n:1~100000": "the maximum number of commands to print",
        "?show-full:b": "show the full command instead of the shortened version"
    },
    standardVals: {
        l: 1000
    }
})