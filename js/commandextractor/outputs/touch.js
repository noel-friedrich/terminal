terminal.addCommand("touch", function(args) {
    if (!terminal.isValidFileName(args.filename))
        throw new Error("Invalid filename")
    if (terminal.fileExists(args.filename))
        throw new Error("File already exists")
    let newFile = new FileElement(FileType.READABLE, "")
    terminal.currFolder.content[args.filename] = newFile
}, {
    description: "create a file in the current directory",
    args: {
        "filename": "the name of the file"
    }
})

