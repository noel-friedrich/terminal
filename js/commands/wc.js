terminal.addCommand("wc", function(args) {
    let text = ""
    if (args.s) {
        text = args.s
        if (args.f) {
            terminal.printLine("Ignoring file argument")
        }
    } else if (args.f) {
        let file = terminal.getFile(args.f)
        if (file.type == FileType.FOLDER) {
            throw new Error("Cannot read file of type FOLDER")
        }
        text = file.content
    } else {
        throw new Error("Either String or File must be provided")
    }

    let fileInfos = {
        "lines": text.split("\n").length,
        "words": text.split(" ").length,
        "characters": text.length
    }
    for (let [infoName, infoContent] of Object.entries(fileInfos)) {
        terminal.print(infoContent + " ", Color.COLOR_1)
        terminal.printLine(infoName)
    }
}, {
    description: "display word and line count of file",
    args: {
        "?f=file": "file to open",
        "?s": "string to count instead of file"
    }
})

