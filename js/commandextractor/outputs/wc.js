terminal.addCommand("wc", function(args) {
    let file = terminal.getFile(args.file)
    if (file.type == FileType.FOLDER) {
        throw new Error("Cannot read file of type FOLDER")
    }
    let fileInfos = {
        "lines": file.content.split("\n").length,
        "words": file.content.split(" ").length,
        "characters": file.content.length
    }
    for (let [infoName, infoContent] of Object.entries(fileInfos)) {
        terminal.print(infoContent + " ", Color.COLOR_1)
        terminal.printLine(infoName)
    }
}, {
    description: "display word and line count of file",
    args: {
        "file": "file to open"
    }
})

