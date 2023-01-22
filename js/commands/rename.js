terminal.addCommand("rename", async function(args) {
    if (!terminal.isValidFileName(args.name))
        throw new Error("invalid file name")

    if (terminal.fileExists(args.name))
        throw new Error("file already exists in folder")

    let file = terminal.getFile(args.file)
    delete file.parent.content[file.name]
    file.parent.content[args.name] = file
    file.name = args.name
    console.log(file.parent)
    await terminal.fileSystem.reload()
}, {
    description: "rename a file or folder",
    args: {
        "file": "the file or folder to rename",
        "name": "the new name of the file or folder"
    }
})