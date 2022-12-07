terminal.addCommand("wc", function(args) {
    let text = ""
    if (args.s) {
        text = args.s
        if (args.file) {
            terminal.printLine("Ignoring file argument")
        }
    } else {
        let file = terminal.getFile(args.file)
        if (file.type == FileType.FOLDER) {
            throw new Error("Cannot read file of type FOLDER")
        }
        text = file.content
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
        "?file": "file to open",
        "?s": "string to count instead of file"
    }
})

