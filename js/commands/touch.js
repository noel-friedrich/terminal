terminal.addCommand("touch", async function(args) {
    if (!terminal.isValidFileName(args.filename))
        throw new Error("Invalid filename")
    if (terminal.fileExists(args.filename))
        throw new Error("File already exists")

    const file = new PlainTextFile().setName(args.filename)
    terminal.currDirectory.addChild(file)
}, {
    description: "create a file in the current directory",
    args: {
        "filename:s": "the name of the file"
    }
})

