terminal.addCommand("head", function(args) {
    let file = terminal.getFile(args.file)
    if (file.content.length == 0)
        throw new Error("File is empty")
    let lines = file.content.split("\n")
    let result = lines.slice(0, args.l).join("\n")
    terminal.printLine(result)
}, {
    description: "display the first lines of a file",
    args: ["file", "?l:n:1~1000"],
    standardVals: {l: 10}
})

