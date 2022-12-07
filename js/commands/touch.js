terminal.addCommand("touch", async function(args) {
    if (!terminal.isValidFileName(args.filename))
        throw new Error("Invalid filename")
    if (terminal.fileExists(args.filename))
        throw new Error("File already exists")
    let newFile = new TextFile("")
    terminal.currFolder.content[args.filename] = newFile
    await terminal.fileSystem.reload()
}, {
    description: "create a file in the current directory",
    args: {
        "filename": "the name of the file"
    }
})

